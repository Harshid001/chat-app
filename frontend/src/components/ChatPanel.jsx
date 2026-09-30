import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  Plus,
  Search,
  Smile,
  SquarePen,
  WifiOff,
  X,
} from "lucide-react";
import { useChat } from "../stores/chat";
import { dayLabel, messageDate, timeLabel } from "../lib/format";
import { Avatar, ErrorNotice, IconButton, Modal, Spinner } from "./ui";

const EMPTY = [];
export default function ChatPanel({ onNew }) {
  const activeId = useChat((state) => state.activeId);
  if (!activeId)
    return (
      <section className="chat-empty">
        <div className="empty-illustration">
          <span className="empty-ring" />
          <MessageCircle size={47} strokeWidth={1.4} />
          <span className="empty-spark">
            <Plus size={17} />
          </span>
        </div>
        <div className="eyebrow">ROOM FOR A LITTLE HELLO</div>
        <h2>Your people. Your conversations.</h2>
        <p>
          Pick up where you left off,
          <br />
          or start something new.
        </p>
        <button className="primary-button" onClick={onNew}>
          <SquarePen size={17} /> New message
        </button>
        <span className="empty-footnote">Small moments, shared.</span>
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
      behavior: "smooth",
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
  }, [messages]);
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
    <section
      className="chat-panel"
      aria-label={`Conversation with ${user?.fullName || "contact"}`}
    >
      <header className="chat-header glass">
        <IconButton
          label="Back to conversations"
          className="mobile-back"
          onClick={useChat.getState().clearSelection}
        >
          <ArrowLeft size={21} />
        </IconButton>
        <Avatar user={user} size="avatar-small" online={online} />
        <button className="contact-heading" onClick={() => setDetails(true)}>
          <strong>{user?.fullName}</strong>
          <span>
            {online ? "Online now" : "A space for your conversation"}
            <ChevronDown size={11} />
          </span>
        </button>
        <div className="chat-header-actions">
          <IconButton
            label="Search this conversation"
            className={searching ? "is-active" : ""}
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
      {searching && (
        <div className="message-search">
          <Search size={16} />
          <input
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
        </div>
      )}
      {(!networkOnline || connection !== "connected") && (
        <div className="connection-banner" role="status">
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
        className="message-scroll"
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current;
          nearBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 100;
          if (nearBottom.current) setNewBelow(false);
        }}
      >
        <div className="conversation-beginning">
          <Avatar user={user} size="avatar-large" />
          <h2>{user?.fullName}</h2>
          <p>A little hello could be the start of something good.</p>
        </div>
        {hasMore && (
          <button className="load-older" onClick={loadOlder} disabled={loading}>
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
          <div className="first-message">
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
            className="message-list"
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
                    <div className="date-separator">
                      <span>{dayLabel(message)}</span>
                    </div>
                  )}
                  <div
                    className={`message-row ${mine ? "mine" : "theirs"} ${grouped ? "grouped" : ""}`}
                  >
                    <div
                      className={`message-bubble ${message.status === "failed" ? "failed" : ""}`}
                    >
                      {message.image && (
                        <a
                          href={message.image}
                          target="_blank"
                          rel="noreferrer"
                          className="message-image-link"
                        >
                          <img
                            className="message-image"
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
                          className="message-video"
                          aria-label="Shared video"
                        />
                      )}
                      {message.file && !message.image && !message.video && (
                        <span className="pending-attachment">
                          <ImagePlus size={16} />
                          {message.file.name}
                        </span>
                      )}
                      {message.text && <p>{message.text}</p>}
                    </div>
                    <div className="message-meta">
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
                      <span className="message-error" role="alert">
                        {message.error}
                      </span>
                    )}
                  </div>
                </Fragment>
              );
            })}
            {query && !matches.length && (
              <div className="no-messages">No messages match “{query}”.</div>
            )}
          </div>
        )}
      </div>
      {newBelow && (
        <button className="new-below" onClick={scrollBottom}>
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
          <div className="profile-card">
            <Avatar user={user} size="avatar-large" />
            <h3>{user?.fullName}</h3>
            <p>{online ? "Online now" : "Currently offline"}</p>
          </div>
          <div className="settings-section">
            <h3>Shared in this conversation</h3>
            <p>
              {
                messages.filter((message) => message.image || message.video)
                  .length
              }{" "}
              photos and videos in loaded messages
            </p>
            <div className="shared-media">
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
            <p className="privacy-note">
              Message status confirms the server saved your message. Read
              receipts aren’t available.
            </p>
          </div>
        </Modal>
      )}
    </section>
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
  const emojiRef = useRef(null);
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
  useEffect(() => {
    if (!emojis) return;
    const close = (event) => {
      if (!emojiRef.current?.contains(event.target)) setEmojis(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") setEmojis(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [emojis]);
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
    <div className="composer-area glass">
      {error && <ErrorNotice message={error} />}
      {file && (
        <div className="attachment-preview">
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
      <form className="composer" onSubmit={send}>
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
          <Plus size={23} />
        </IconButton>
        <textarea
          id="message-input"
          ref={inputRef}
          rows={1}
          maxLength={5000}
          aria-label="Message"
          placeholder="A thought, a little hello…"
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
        <div ref={emojiRef} className="emoji-container">
          <IconButton
            label="Choose an emoji"
            aria-expanded={emojis}
            onClick={() => setEmojis(!emojis)}
          >
            <Smile size={21} />
          </IconButton>
          {emojis && (
            <div className="emoji-picker" role="group" aria-label="Emoji">
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
            </div>
          )}
        </div>
        <button
          className="send-button"
          type="submit"
          aria-label="Send message"
          disabled={(!text.trim() && !file) || !online}
        >
          <ArrowUp size={21} strokeWidth={2.5} />
        </button>
      </form>
      <div className="composer-caption">
        <span>
          {!online
            ? "Reconnect to send. Your draft is safe in this session."
            : "A little closer, one message at a time."}
        </span>
        {text.length > 4500 ? (
          <span>{text.length}/5000</span>
        ) : (
          <span className="keyboard-tip">
            Return to send <span>↵</span>
          </span>
        )}
      </div>
    </div>
  );
}
