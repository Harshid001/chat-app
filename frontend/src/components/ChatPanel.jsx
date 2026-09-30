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
  ImagePlus,
  Info,
  LoaderCircle,
  MessageCircle,
  Keyboard,
  Paperclip,
  Search,
  Smile,
  SquarePen,
  WifiOff,
  X,
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

const EMPTY = [];
export default function ChatPanel({ onNew }) {
  const activeId = useChat((state) => state.activeId);
  if (!activeId)
    return (
      <section className="relative hidden min-w-0 flex-1 flex-col items-center justify-center bg-background/35 p-8 text-center md:flex">
        <div className="relative mb-8 flex size-28 items-center justify-center rounded-[32px] border border-border/60 bg-surface/60 shadow-xs backdrop-blur-xl">
          <MessageCircle size={42} strokeWidth={1.3} className="text-primary" />
          <span className="absolute -right-4 bottom-2 flex size-11 items-center justify-center rounded-2xl border bg-accent/70 text-accent-foreground shadow-sm backdrop-blur-xl">
            <Smile size={23} strokeWidth={1.5} />
          </span>
        </div>
        <span className="mb-4 rounded-full border bg-surface/60 px-3 py-1.5 text-[10px] font-medium tracking-wide text-muted-foreground">
          A SPACE FOR YOUR PEOPLE
        </span>
        <h2 className="text-2xl font-medium tracking-tight">
          A good day starts with hello.
        </h2>
        <p className="mt-3 max-w-64 text-sm leading-6 text-muted-foreground">
          Pick a conversation, or reach out to someone new.
        </p>
        <Button className="mt-7" onClick={onNew}>
          <SquarePen size={16} />
          New message
        </Button>
        <span className="absolute bottom-7 text-[11px] text-muted-foreground">
          Stay close, even from a little further away.
        </span>
      </section>
    );
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
    } else if (nearBottom.current) element.scrollTop = element.scrollHeight;
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
      className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-background/25"
      aria-label={`Conversation with ${user?.fullName || "contact"}`}
    >
      <header className="safe-top z-10 flex min-h-[81px] shrink-0 items-center gap-3 border-b bg-surface/65 px-3 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <IconButton
          label="Back to conversations"
          className="md:hidden"
          onClick={useChat.getState().clearSelection}
        >
          <ArrowLeft size={21} />
        </IconButton>
        <Avatar user={user} size="avatar-small" online={online} />
        <button
          className="min-w-0 text-left [&>strong]:block [&>strong]:truncate [&>strong]:text-sm [&>strong]:font-semibold [&>span]:mt-1 [&>span]:flex [&>span]:items-center [&>span]:gap-1.5 [&>span]:text-[11px] [&>span]:text-muted-foreground"
          onClick={() => setDetails(true)}
        >
          <strong>{user?.fullName}</strong>
          <span>
            {online ? "Online now" : "Offline"}
            <ChevronDown size={11} />
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
            <Search size={20} />
          </IconButton>
          <IconButton
            label="Conversation details"
            onClick={() => setDetails(true)}
          >
            <Info size={20} />
          </IconButton>
        </div>
      </header>
      <AnimatePresence>
        {searching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 border-b bg-surface/50 px-4 py-2 text-muted-foreground sm:px-7 [&>span]:shrink-0 [&>span]:text-xs"
          >
            <Search size={16} />
            <Input
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              autoFocus
              aria-label="Search loaded messages"
              placeholder="Search loaded messages…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span>{query && `${matches.length} found`}</span>
            <IconButton
              label="Close message search"
              onClick={() => {
                setSearching(false);
                setQuery("");
              }}
            >
              <X size={16} />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>
      {(!networkOnline || connection !== "connected") && (
        <div
          className="flex shrink-0 items-center justify-center gap-2 border-b bg-accent/55 px-4 py-2.5 text-xs text-accent-foreground [&>button]:font-semibold [&>button]:underline [&>button]:underline-offset-4"
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
            <button onClick={useChat.getState().refresh}>Retry</button>
          )}
        </div>
      )}
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
        <div className="flex flex-col items-center pb-8 pt-3 text-center [&>h2]:mt-3 [&>h2]:text-sm [&>h2]:font-semibold [&>p]:mt-1.5 [&>p]:text-xs [&>p]:text-muted-foreground">
          <Avatar user={user} size="avatar-large" />
          <h2>{user?.fullName}</h2>
          <p>This is the beginning of your conversation.</p>
        </div>
        {hasMore && (
          <button
            className="mx-auto mb-5 block rounded-full border bg-surface/70 px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            onClick={loadOlder}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load earlier messages"}
          </button>
        )}
        {error && (
          <ErrorNotice
            message={error}
            onRetry={() => useChat.getState().loadMessages(id)}
          />
        )}
        {loading && !messages.length ? (
          <Spinner label="Loading your conversation…" />
        ) : !messages.length && !error ? (
          <div className="flex flex-col items-center gap-4 py-10 text-sm text-muted-foreground [&>button]:flex [&>button]:items-center [&>button]:gap-2 [&>button]:rounded-full [&>button]:border [&>button]:bg-surface/70 [&>button]:px-4 [&>button]:py-2.5 [&>button]:text-xs [&>button]:text-primary">
            <span>Every conversation starts somewhere.</span>
            <button
              onClick={() => {
                useChat.getState().setDraft(id, "Hey! How’s your day going?");
                document.getElementById("message-input")?.focus();
              }}
            >
              Say hello <MessageCircle size={14} />
            </button>
          </div>
        ) : (
          <div
            className="mx-auto max-w-[920px]"
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
                  {showDay && (
                    <div className="flex items-center gap-4 py-5 text-center text-[10px] font-medium text-muted-foreground before:h-px before:flex-1 before:bg-border/60 after:h-px after:flex-1 after:bg-border/60 [&>span]:rounded-full [&>span]:border [&>span]:bg-surface/50 [&>span]:px-3 [&>span]:py-1.5">
                      <span>{dayLabel(message)}</span>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col",
                      mine ? "items-end" : "items-start",
                      grouped ? "mt-2" : "mt-5",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] overflow-hidden rounded-[22px] border px-4 py-3 text-[13px] leading-[1.75] sm:max-w-[75%] sm:text-sm [&>p]:whitespace-pre-wrap [&>p]:break-words [&>p]:[overflow-wrap:anywhere] [&>a+p]:mt-2 [&>video+p]:mt-2",
                        mine
                          ? "rounded-br-md border-primary/10 bg-primary text-primary-foreground"
                          : "rounded-bl-md border-border/80 bg-surface/80 shadow-xs backdrop-blur-sm",
                        message.status === "failed" &&
                          "ring-1 ring-destructive",
                      )}
                    >
                      {message.image && (
                        <a
                          href={message.image}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-inherit"
                        >
                          <img
                            className="max-h-80 min-h-16 max-w-full rounded-2xl object-contain"
                            src={message.image}
                            alt={`Photo shared by ${mine ? "you" : user?.fullName}`}
                            loading="lazy"
                            onLoad={() => {
                              if (nearBottom.current && scrollRef.current)
                                scrollRef.current.scrollTop =
                                  scrollRef.current.scrollHeight;
                            }}
                            onError={(event) => {
                              event.currentTarget.alt =
                                "Photo unavailable. Open to retry.";
                            }}
                          />
                        </a>
                      )}
                      {message.video && (
                        <video
                          src={message.video}
                          controls
                          preload="metadata"
                          className="max-h-80 max-w-full rounded-2xl"
                          aria-label="Shared video"
                        />
                      )}
                      {message.file && !message.image && !message.video && (
                        <span className="mb-1 flex items-center gap-2 break-all text-xs">
                          <ImagePlus size={16} />
                          {message.file.name}
                        </span>
                      )}
                      {message.text && <p>{message.text}</p>}
                    </div>
                    <div className="flex items-center gap-1 px-1 pt-1.5 text-[10px] text-muted-foreground [&>button]:rounded-full [&>button]:px-1 [&>button]:text-destructive [&>button]:underline">
                      <time dateTime={messageDate(message)?.toISOString()}>
                        {timeLabel(message)}
                      </time>
                      {mine &&
                        (message.status === "sending" ? (
                          <>
                            <LoaderCircle size={10} className="animate-spin" />
                            <span>Sending</span>
                          </>
                        ) : message.status === "failed" ? (
                          <button
                            disabled={!networkOnline}
                            title={message.error}
                            onClick={() =>
                              useChat
                                .getState()
                                .send(id, message.text, message.file, message)
                            }
                          >
                            Not sent · Retry
                          </button>
                        ) : (
                          <>
                            <Check size={11} />
                            <span>Sent</span>
                          </>
                        ))}
                    </div>
                    {message.status === "failed" && (
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
      {newBelow && (
        <button
          className="absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-surface/85 px-4 py-2.5 text-xs shadow-sm backdrop-blur-xl"
          onClick={scrollBottom}
        >
          Latest messages <ArrowDown size={14} />
        </button>
      )}
      <Composer
        id={id}
        onSend={() => {
          nearBottom.current = true;
        }}
      />
      {details && (
        <Modal title="Conversation details" onClose={() => setDetails(false)}>
          <div className="flex flex-col items-center py-4 text-center [&>h3]:mt-4 [&>h3]:text-lg [&>h3]:font-semibold [&>p]:mt-1 [&>p]:text-xs [&>p]:text-muted-foreground">
            <Avatar user={user} size="avatar-large" />
            <h3>{user?.fullName}</h3>
            <p>{online ? "Online now" : "Currently offline"}</p>
          </div>
          <div className="mt-5 border-t pt-5 [&>h3]:text-sm [&>h3]:font-medium [&>p]:mt-2 [&>p]:text-xs [&>p]:leading-relaxed [&>p]:text-muted-foreground">
            <h3>Shared in this conversation</h3>
            <p>
              {
                messages.filter((message) => message.image || message.video)
                  .length
              }{" "}
              photos and videos in loaded messages
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 [&_img]:aspect-square [&_img]:w-full [&_img]:rounded-xl [&_img]:object-cover">
              {messages
                .filter((message) => message.image)
                .map((message) => (
                  <a
                    href={message.image}
                    target="_blank"
                    rel="noreferrer"
                    key={message._id}
                  >
                    <img
                      src={message.image}
                      alt="Shared photo"
                      loading="lazy"
                    />
                  </a>
                ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Message status confirms the server saved your message. Read
              receipts aren’t available.
            </p>
          </div>
        </Modal>
      )}
    </motion.section>
  );
}

function Composer({ id, onSend }) {
  const text = useChat((state) => state.drafts[id] || "");
  const online = useChat((state) => state.networkOnline);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState("");
  const [emojis, setEmojis] = useState(false);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const timer = setTimeout(() => setFileUrl(url), 0);
    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    };
  }, [file]);
  useEffect(() => {
    const input = inputRef.current;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }, [text]);
  function chooseFile(selected) {
    if (!selected) return;
    if (
      !/^(image\/(jpeg|png|gif|webp|avif)|video\/(mp4|webm|quicktime))$/.test(
        selected.type,
      )
    ) {
      setError("Choose a JPG, PNG, GIF, WebP, AVIF, MP4, WebM, or MOV file.");
      return;
    }
    if (selected.size > 25 * 1024 * 1024) {
      setError("Choose a file smaller than 25 MB.");
      return;
    }
    setFileUrl("");
    setFile(selected);
    setError("");
  }
  function send(event) {
    event?.preventDefault();
    if ((!text.trim() && !file) || !online) return;
    onSend();
    useChat.getState().send(id, text.trim(), file);
    useChat.getState().setDraft(id, "");
    setFile(null);
    setEmojis(false);
    setError("");
    inputRef.current.focus();
  }
  return (
    <div className="safe-bottom z-10 shrink-0 border-t border-border/60 bg-surface/50 px-3 pt-3 backdrop-blur-xl sm:px-6 sm:pt-4 lg:px-8">
      {error && <ErrorNotice message={error} />}
      {file && (
        <div className="mb-3 flex max-w-sm items-center gap-3 rounded-2xl border bg-surface/80 p-3 [&>img]:size-11 [&>img]:rounded-lg [&>img]:object-cover [&>span]:min-w-0 [&>span]:flex-1 [&_strong]:block [&_strong]:truncate [&_strong]:text-xs [&_strong]:font-medium [&_small]:mt-1 [&_small]:block [&_small]:text-[11px] [&_small]:text-muted-foreground">
          {file.type.startsWith("image/") && fileUrl ? (
            <img src={fileUrl} alt="Attachment preview" />
          ) : (
            <ImagePlus size={24} />
          )}
          <span>
            <strong>{file.name}</strong>
            <small>{(file.size / 1024 / 1024).toFixed(1)} MB</small>
          </span>
          <IconButton
            label="Remove attachment"
            onClick={() => {
              setFile(null);
              setFileUrl("");
            }}
          >
            <X size={17} />
          </IconButton>
        </div>
      )}
      <form
        className="flex items-end gap-1 rounded-[28px] border bg-surface/75 p-2 shadow-xs backdrop-blur-xl transition-shadow focus-within:border-ring/70 focus-within:ring-2 focus-within:ring-ring/10 sm:gap-2"
        onSubmit={send}
      >
        <input
          type="file"
          ref={fileRef}
          className="sr-only"
          tabIndex={-1}
          aria-label="Attach a photo or video"
          accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
          onChange={(event) => {
            chooseFile(event.target.files[0]);
            event.target.value = "";
          }}
        />
        <IconButton
          label="Attach a photo or video"
          onClick={() => fileRef.current.click()}
        >
          <Paperclip size={20} />
        </IconButton>
        <Textarea
          className="max-h-[140px] min-h-10 py-2"
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
              !event.nativeEvent.isComposing &&
              !window.matchMedia("(pointer: coarse)").matches
            )
              send(event);
          }}
          onPaste={(event) => {
            const pastedFile = event.clipboardData.files[0];
            if (pastedFile) {
              event.preventDefault();
              chooseFile(pastedFile);
            }
          }}
        />
        <Popover.Root open={emojis} onOpenChange={setEmojis}>
          <Popover.Trigger asChild>
            <IconButton label="Choose an emoji" aria-expanded={emojis}>
              <Smile size={21} />
            </IconButton>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              align="end"
              sideOffset={12}
              aria-label="Emoji"
              className="z-40 grid grid-cols-4 gap-1 rounded-2xl border bg-surface/90 p-2 shadow-lg outline-none backdrop-blur-2xl animate-popover"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                inputRef.current?.focus();
              }}
            >
              {[
                ["😊", "Smiling face"],
                ["❤️", "Heart"],
                ["👍", "Thumbs up"],
                ["😂", "Laughing face"],
                ["🎉", "Celebration"],
                ["👋", "Wave"],
                ["☀️", "Sun"],
                ["✨", "Sparkles"],
              ].map(([emoji, name]) => (
                <button
                  type="button"
                  className="flex size-11 items-center justify-center rounded-xl text-2xl transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  key={name}
                  aria-label={name}
                  onClick={() => {
                    useChat
                      .getState()
                      .setDraft(id, `${text}${emoji}`.slice(0, 5000));
                    setEmojis(false);
                    inputRef.current.focus();
                  }}
                >
                  {emoji}
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <button
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-muted disabled:text-muted-foreground"
          type="submit"
          aria-label="Send message"
          disabled={(!text.trim() && !file) || !online}
        >
          <ArrowUp size={21} strokeWidth={2.5} />
        </button>
      </form>
      <div className="flex min-h-7 items-center justify-between gap-2 px-3 pt-2 text-[10px] text-muted-foreground">
        <span>
          {!online
            ? "Reconnect to send. Your draft is safe in this session."
            : "Just you and your conversation."}
        </span>
        {text.length > 4500 ? (
          <span>{text.length}/5000</span>
        ) : (
          <span className="hidden items-center gap-1.5 sm:flex">
            <Keyboard size={12} /> Shift + Enter for a new line
          </span>
        )}
      </div>
    </div>
  );
}
