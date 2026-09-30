import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Popover } from "radix-ui";
import { cn } from "../lib/utils";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  Info,
  LoaderCircle,
  MessageCircle,
  Paperclip,
  Search,
  ShieldCheck,
  Smile,
  Sparkles,
  SquarePen,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { useChat } from "../stores/chat";
import { dayLabel, messageDate, timeLabel } from "../lib/format";
import {
  Avatar,
  Button,
  ErrorNotice,
  IconButton,
  Input,
  Modal,
  Spinner,
  Textarea,
} from "./ui";

import AttachmentUpload, { PendingAttachment } from "./AttachmentUpload";

const EMPTY = [];

export default function ChatPanel({ onNew }) {
  const activeId = useChat((state) => state.activeId);

  if (!activeId) {
    return (
      <section className="relative hidden min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-background/50 p-8 text-center md:flex">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0 hero-glow opacity-60" />
        <div className="pointer-events-none absolute inset-0 chat-pattern opacity-30" />

        <div className="relative z-10 flex max-w-md flex-col items-center">
          <div className="relative mb-8 flex size-24 items-center justify-center rounded-3xl border border-primary/20 bg-gradient-to-br from-surface to-accent/60 shadow-xl shadow-primary/10 backdrop-blur-2xl">
            <MessageCircle
              size={44}
              strokeWidth={1.4}
              className="text-primary"
            />
            <span className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-xl border border-border bg-surface text-primary shadow-sm backdrop-blur-xl">
              <Sparkles size={16} />
            </span>
          </div>

          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/75 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase shadow-xs backdrop-blur-xl">
            <span className="size-1.5 rounded-full bg-status" />
            Personal & Encrypted
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            A quiet space for what matters.
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Select a conversation from the left to start catching up, or reach
            out to someone new.
          </p>

          <Button
            size="default"
            className="mt-7 gap-2 shadow-md hover:scale-[1.02]"
            onClick={onNew}
          >
            <SquarePen size={16} />
            New message
          </Button>

          {/* Feature Highlights Grid */}
          <div className="mt-12 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-2xl border border-border/70 bg-surface/60 p-3.5 shadow-xs backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Zap size={14} className="text-primary" />
                <span>Instant Sync</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Sub-millisecond WebSocket delivery.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-surface/60 p-3.5 shadow-xs backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ShieldCheck size={14} className="text-primary" />
                <span>Zero Ads</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                No algorithms or telemetry clutter.
              </p>
            </div>
          </div>

          <span className="mt-12 text-xs text-muted-foreground">
            Slow down. Stay close.
          </span>
        </div>
      </section>
    );
  }

  return <Conversation key={activeId} id={activeId} />;
}

function Conversation({ id }) {
  const profile = useChat((state) => state.profile);
  const user = useChat((state) =>
    state.conversations.find((person) => person._id === id),
  );
  const messages = useChat((state) => state.messages[id] || EMPTY);
  const loading = useChat((state) => state.loading[id]);
  const error = useChat((state) => state.errors[id]);
  const hasMore = useChat((state) => state.hasMore[id]);
  const online = useChat((state) => state.onlineUsers.includes(id));
  const networkOnline = useChat((state) => state.networkOnline);
  const connection = useChat((state) => state.connection);

  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [details, setDetails] = useState(false);
  const [newBelow, setNewBelow] = useState(false);

  const scrollRef = useRef(null);
  const nearBottom = useRef(true);
  const scrollSnapshot = useRef(null);
  const lastId = messages.at(-1)?._id;

  const matches = query
    ? messages.filter((message) =>
        message.text?.toLowerCase().includes(query.toLowerCase()),
      )
    : messages;

  const scrollBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    setNewBelow(false);
  };

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    if (scrollSnapshot.current) {
      element.scrollTop =
        element.scrollHeight -
        scrollSnapshot.current.height +
        scrollSnapshot.current.top;
      scrollSnapshot.current = null;
    } else if (nearBottom.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, query]);

  useEffect(() => {
    if (!nearBottom.current && lastId) {
      const timer = setTimeout(() => setNewBelow(true), 0);
      return () => clearTimeout(timer);
    }
  }, [lastId]);

  async function loadOlder() {
    const element = scrollRef.current;
    scrollSnapshot.current = {
      top: element.scrollTop,
      height: element.scrollHeight,
    };
    await useChat.getState().loadMessages(id, true);
    if (useChat.getState().errors[id]) scrollSnapshot.current = null;
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-background/30"
      aria-label={`Conversation with ${user?.fullName || "contact"}`}
    >
      {/* Active Conversation Header */}
      <header className="safe-top z-10 flex min-h-[76px] shrink-0 items-center gap-3 border-b border-border/80 bg-surface/75 px-4 py-3.5 backdrop-blur-xl sm:px-6 lg:px-8">
        <IconButton
          label="Back to conversations"
          className="md:hidden"
          onClick={useChat.getState().clearSelection}
        >
          <ArrowLeft size={20} />
        </IconButton>

        <Avatar user={user} size="avatar-small" online={online} />

        <button
          className="min-w-0 -m-1 rounded-xl p-1.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setDetails(true)}
          aria-haspopup="dialog"
          aria-label={`View conversation details for ${user?.fullName || "contact"}`}
        >
          <strong className="block truncate text-sm font-semibold text-foreground">
            {user?.fullName}
          </strong>
          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full",
                online
                  ? "bg-status shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                  : "bg-muted-foreground/60",
              )}
            />
            {online ? "Online now" : "Offline"}
            <ChevronDown size={11} className="text-muted-foreground/80" />
          </span>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <IconButton
            label="Search this conversation"
            className={searching ? "bg-accent text-accent-foreground" : ""}
            onClick={() => {
              setSearching(!searching);
              setQuery("");
            }}
          >
            <Search size={19} />
          </IconButton>
          <IconButton
            label="Conversation details"
            onClick={() => setDetails(true)}
          >
            <Info size={19} />
          </IconButton>
        </div>
      </header>

      {/* In-Chat Search Bar */}
      <AnimatePresence>
        {searching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 border-b border-border/80 bg-surface/70 px-4 py-2 backdrop-blur-xl sm:px-7"
          >
            <Search size={16} className="text-muted-foreground" />
            <Input
              className="h-9 border-0 bg-transparent shadow-none text-xs focus-visible:ring-0"
              autoFocus
              aria-label="Search loaded messages"
              placeholder="Search loaded messages…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {query && `${matches.length} found`}
            </span>
            <IconButton
              label="Close message search"
              onClick={() => {
                setSearching(false);
                setQuery("");
              }}
            >
              <X size={15} />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection & Network Status Banner */}
      {(!networkOnline || connection !== "connected") && (
        <div
          className="flex shrink-0 items-center justify-center gap-2 border-b border-accent/40 bg-accent/60 px-4 py-2 text-xs font-medium text-accent-foreground backdrop-blur-md"
          role="status"
        >
          {!networkOnline ? (
            <WifiOff size={14} />
          ) : (
            <LoaderCircle size={14} className="animate-spin" />
          )}
          <span>
            {!networkOnline
              ? "You’re offline. Your open messages are still here."
              : "Reconnecting to live updates…"}
          </span>
          {networkOnline && (
            <button
              onClick={useChat.getState().refresh}
              className="font-bold underline underline-offset-4 hover:opacity-80"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Messages Stream Container */}
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-7 lg:px-10"
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current;
          nearBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 100;
          if (nearBottom.current) setNewBelow(false);
        }}
      >
        {/* Conversation Start Avatar */}
        <div className="flex flex-col items-center pb-8 pt-4 text-center">
          <Avatar user={user} size="avatar-large" />
          <h2 className="mt-3 text-base font-bold text-foreground">
            {user?.fullName}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            This is the beginning of your conversation.
          </p>
        </div>

        {/* Load Earlier Messages Button */}
        {hasMore && (
          <button
            className="mx-auto mb-6 block rounded-full border border-border/80 bg-surface/80 px-4 py-2 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-muted disabled:opacity-50"
            onClick={loadOlder}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load earlier messages"}
          </button>
        )}

        {/* Error Notice */}
        {error && (
          <ErrorNotice
            message={error}
            onRetry={() => useChat.getState().loadMessages(id)}
          />
        )}

        {/* Loading Spinner or Empty Messages */}
        {loading && !messages.length ? (
          <Spinner label="Loading your conversation…" />
        ) : !messages.length && !error ? (
          <div className="flex flex-col items-center gap-4 py-12 text-sm text-muted-foreground">
            <span>Every conversation starts somewhere.</span>
            <Button
              variant="outline"
              size="small"
              className="gap-2 text-xs text-primary shadow-xs"
              onClick={() => {
                useChat.getState().setDraft(id, "Hey! How’s your day going?");
                document.getElementById("message-input")?.focus();
              }}
            >
              Say hello <MessageCircle size={14} />
            </Button>
          </div>
        ) : (
          <div
            className="mx-auto max-w-[880px]"
            role="log"
            aria-label="Messages"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {matches.map((message, index) => {
              const mine = message.senderId === profile._id;
              const previous = matches[index - 1];
              const showDay =
                !previous || dayLabel(previous) !== dayLabel(message);
              const grouped =
                previous && previous.senderId === message.senderId && !showDay;

              return (
                <Fragment key={message._id}>
                  {/* Day Divider Pill */}
                  {showDay && (
                    <div className="flex items-center gap-4 py-6 text-center text-[11px] font-medium text-muted-foreground before:h-px before:flex-1 before:bg-border/60 after:h-px after:flex-1 after:bg-border/60">
                      <span className="rounded-full border border-border/80 bg-surface/75 px-3 py-1 shadow-xs backdrop-blur-md">
                        {dayLabel(message)}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble Item */}
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "flex flex-col",
                      mine ? "items-end" : "items-start",
                      grouped ? "mt-1.5" : "mt-4",
                    )}
                  >
                    <div
                      className={cn(
                        "relative max-w-[85%] overflow-hidden rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-xs transition-shadow sm:max-w-[72%] sm:text-sm",
                        mine
                          ? "rounded-br-xs bg-primary text-primary-foreground shadow-[0_2px_12px_-3px_rgba(36,82,57,0.3)] dark:shadow-[0_2px_12px_-3px_rgba(52,211,153,0.25)]"
                          : "rounded-bl-xs border border-border/80 bg-surface/90 text-foreground backdrop-blur-md",
                        message.file &&
                          "border border-border/80 bg-surface/90 p-2 text-foreground backdrop-blur-xl",
                        message.status === "failed" &&
                          "border-destructive/40 bg-destructive/5 text-foreground",
                      )}
                    >
                      {/* Attached Photo */}
                      {message.image && (
                        <a
                          href={message.image}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-xl text-inherit"
                        >
                          <img
                            className="max-h-84 min-h-16 max-w-full rounded-xl object-contain transition-transform duration-200 hover:scale-[1.01]"
                            src={message.image}
                            alt={`Photo shared by ${mine ? "you" : user?.fullName}`}
                            loading="lazy"
                            onLoad={() => {
                              if (nearBottom.current && scrollRef.current) {
                                scrollRef.current.scrollTop =
                                  scrollRef.current.scrollHeight;
                              }
                            }}
                            onError={(event) => {
                              event.currentTarget.alt =
                                "Photo unavailable. Open to retry.";
                            }}
                          />
                        </a>
                      )}

                      {/* Attached Video */}
                      {message.video && (
                        <video
                          src={message.video}
                          controls
                          preload="metadata"
                          className="max-h-84 max-w-full rounded-xl"
                          aria-label="Shared video"
                        />
                      )}

                      {/* Other Attachments */}
                      {message.file && !message.image && !message.video && (
                        <PendingAttachment
                          message={message}
                          online={networkOnline}
                          onRetry={() =>
                            useChat
                              .getState()
                              .send(id, message.text, message.file, message)
                          }
                        />
                      )}

                      {/* Text Content */}
                      {message.text && (
                        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] pt-0.5">
                          {message.text}
                        </p>
                      )}
                    </div>

                    {/* Meta info: Timestamp and Sent State */}
                    <div className="flex items-center gap-1.5 px-1.5 pt-1 text-[11px] text-muted-foreground">
                      <time dateTime={messageDate(message)?.toISOString()}>
                        {timeLabel(message)}
                      </time>
                      {mine &&
                        !message.file &&
                        (message.status === "sending" ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <LoaderCircle size={10} className="animate-spin" />
                            <span>Sending</span>
                          </span>
                        ) : message.status === "failed" ? (
                          <button
                            disabled={!networkOnline}
                            title={message.error}
                            className="font-medium text-destructive underline hover:opacity-80"
                            onClick={() =>
                              useChat
                                .getState()
                                .send(id, message.text, message.file, message)
                            }
                          >
                            Not sent · Retry
                          </button>
                        ) : (
                          <span className="flex items-center gap-0.5 text-muted-foreground">
                            <Check size={12} strokeWidth={2.5} />
                            <span>Sent</span>
                          </span>
                        ))}
                    </div>

                    {message.status === "failed" && !message.file && (
                      <span
                        className="max-w-[85%] pt-1 text-right text-xs text-destructive"
                        role="alert"
                      >
                        {message.error}
                      </span>
                    )}
                  </motion.div>
                </Fragment>
              );
            })}

            {query && !matches.length && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No messages match “{query}”.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Scroll-to-Bottom Action */}
      {newBelow && (
        <button
          className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-4 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur-xl transition-transform hover:scale-105"
          onClick={scrollBottom}
        >
          Latest messages <ArrowDown size={14} />
        </button>
      )}

      {/* Message Composer */}
      <Composer
        id={id}
        onSend={() => {
          nearBottom.current = true;
        }}
      />

      {/* Conversation Details Dialog */}
      {details && (
        <Modal title="Conversation details" onClose={() => setDetails(false)}>
          <div className="flex flex-col items-center py-4 text-center">
            <Avatar user={user} size="avatar-large" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {user?.fullName}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {online ? "Online now" : "Currently offline"}
            </p>
          </div>

          <div className="mt-6 border-t border-border/80 pt-6">
            <h4 className="text-sm font-semibold text-foreground">
              Shared in this conversation
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              {
                messages.filter((message) => message.image || message.video)
                  .length
              }{" "}
              photos and videos shared
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {messages
                .filter((message) => message.image)
                .map((message) => (
                  <a
                    href={message.image}
                    target="_blank"
                    rel="noreferrer"
                    key={message._id}
                    className="overflow-hidden rounded-xl border border-border/80"
                  >
                    <img
                      src={message.image}
                      alt="Shared photo"
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform hover:scale-105"
                    />
                  </a>
                ))}
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Message status confirms the server safely saved and synced your
              message.
            </p>
          </div>
        </Modal>
      )}
    </motion.section>
  );
}

const EMOJI_CATEGORIES = [
  {
    id: "quick",
    name: "Quick",
    items: [
      ["😊", "Smiling face"],
      ["❤️", "Heart"],
      ["👍", "Thumbs up"],
      ["😂", "Laughing face"],
      ["🎉", "Celebration"],
      ["👋", "Wave"],
      ["☀️", "Sun"],
      ["✨", "Sparkles"],
      ["☕", "Coffee"],
      ["🌿", "Plant"],
    ],
  },
  {
    id: "warmth",
    name: "Warmth",
    items: [
      ["😊", "Smiling face"],
      ["🥰", "Loving smile"],
      ["😌", "Calm and peaceful"],
      ["✨", "Sparkles"],
      ["💛", "Warm heart"],
      ["☕", "Coffee"],
      ["🌿", "Plant"],
      ["🌸", "Cherry blossom"],
      ["🫶", "Heart hands"],
      ["🫂", "Warm hug"],
    ],
  },
  {
    id: "joy",
    name: "Joy",
    items: [
      ["😂", "Laughing face"],
      ["🥳", "Celebration"],
      ["🎉", "Party popper"],
      ["🎈", "Party balloon"],
      ["🥂", "Clinking glasses"],
      ["🎶", "Musical notes"],
      ["☀️", "Sun"],
      ["🌈", "Rainbow"],
      ["🍰", "Sweet treat"],
      ["🌟", "Glowing star"],
    ],
  },
];

function Composer({ id, onSend }) {
  const text = useChat((state) => state.drafts[id] || "");
  const online = useChat((state) => state.networkOnline);
  const [attachment, setAttachment] = useState(null);
  const [emojis, setEmojis] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState("quick");
  const inputRef = useRef(null);

  const recipient = useChat(
    (state) =>
      state.conversations.find((person) => person._id === id)?.fullName,
  );

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }, [text]);

  function send(event) {
    event?.preventDefault();
    if (!text.trim() || !online) return;
    onSend();
    useChat.getState().send(id, text.trim());
    useChat.getState().setDraft(id, "");
    setEmojis(false);
    inputRef.current?.focus();
  }

  return (
    <div className="safe-bottom z-10 shrink-0 border-t border-border/80 bg-surface/65 px-4 pt-3 backdrop-blur-xl sm:px-6 sm:pt-4 lg:px-8">
      {attachment && (
        <AttachmentUpload
          initialFile={attachment.file}
          initialCaption={text}
          recipient={recipient}
          online={online}
          onClose={() => setAttachment(null)}
          onSend={(file, caption) => {
            onSend();
            useChat.getState().send(id, caption, file);
            useChat.getState().setDraft(id, "");
            setAttachment(null);
            inputRef.current?.focus();
          }}
        />
      )}

      <form
        className="flex items-end gap-2 rounded-3xl border border-border/80 bg-surface/85 p-2 shadow-lg backdrop-blur-2xl transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10"
        onSubmit={send}
      >
        <IconButton
          label="Attach a photo or video"
          onClick={() => setAttachment({})}
          className="size-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Paperclip size={18} />
        </IconButton>

        <Popover.Root open={emojis} onOpenChange={setEmojis}>
          <Popover.Trigger asChild>
            <IconButton
              label="Choose an emoji"
              className={cn(
                "size-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
                emojis && "bg-accent text-accent-foreground",
              )}
            >
              <Smile size={18} />
            </IconButton>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              align="end"
              sideOffset={12}
              aria-label="Emoji picker"
              className="z-[80] w-72 rounded-2xl border border-border/80 bg-surface/95 p-3 shadow-xl backdrop-blur-2xl animate-popover"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                inputRef.current?.focus();
              }}
            >
              <div className="mb-2 flex gap-1 border-b border-border/70 pb-2">
                {EMOJI_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setEmojiCategory(cat.id)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      emojiCategory === cat.id
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1.5 pt-1 text-xl">
                {EMOJI_CATEGORIES.find(
                  (c) => c.id === emojiCategory,
                )?.items.map(([symbol, label]) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    title={label}
                    onClick={() => {
                      const input = inputRef.current;
                      const start = input?.selectionStart ?? text.length;
                      const next =
                        text.slice(0, start) + symbol + text.slice(start);
                      useChat.getState().setDraft(id, next.slice(0, 5000));
                      setEmojis(false);
                      input?.focus();
                    }}
                    className="flex size-9 items-center justify-center rounded-xl transition-transform hover:scale-115 hover:bg-muted active:scale-95 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <Textarea
          className="max-h-[140px] min-h-10 py-2.5 text-sm sm:text-sm"
          id="message-input"
          ref={inputRef}
          rows={1}
          maxLength={5000}
          aria-label="Message"
          placeholder="Write a message…"
          value={text}
          onChange={(event) =>
            useChat.getState().setDraft(id, event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              send();
            }
          }}
        />

        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={!text.trim() || !online}
          className="size-9 rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95 disabled:opacity-40"
        >
          <ArrowUp size={16} strokeWidth={2.4} />
        </Button>
      </form>
    </div>
  );
}
