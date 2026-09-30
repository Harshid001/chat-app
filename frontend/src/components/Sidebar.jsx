import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Circle,
  MessageCircle,
  Search,
  Settings2,
  SquarePen,
  X,
} from "lucide-react";
import { useChat } from "../stores/chat";
import { Avatar, Brand, ErrorNotice, IconButton, Spinner } from "./ui";
import { InstallButton } from "./Pwa";
import { preview, timeLabel } from "../lib/format";

export default function Sidebar({ onNew, onSettings }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const state = useChat(
    useShallow(
      ({
        profile,
        conversations,
        activeId,
        onlineUsers,
        unread,
        listLoading,
        listError,
        loadConversations,
        selectConversation,
        connection,
        networkOnline,
      }) => ({
        profile,
        conversations,
        activeId,
        onlineUsers,
        unread,
        listLoading,
        listError,
        loadConversations,
        selectConversation,
        connection,
        networkOnline,
      }),
    ),
  );
  const unreadCount = Object.values(state.unread).reduce(
    (sum, count) => sum + count,
    0,
  );
  const conversations = state.conversations.filter(
    (user) =>
      user.fullName.toLowerCase().includes(query.toLowerCase()) &&
      (filter !== "unread" || state.unread[user._id]),
  );
  return (
    <aside
      className={`sidebar glass ${state.activeId ? "mobile-hidden" : ""}`}
      aria-label="Conversations"
    >
      <div className="sidebar-top">
        <Brand small />
        <span className="workspace-label">YOUR SPACE</span>
      </div>
      <div className="sidebar-heading">
        <div>
          <h1>
            Messages<span className="heading-dot">.</span>
          </h1>
          <p>A little hello goes a long way.</p>
        </div>
        <IconButton
          className="compose-button"
          label="New message"
          onClick={onNew}
        >
          <SquarePen size={20} />
        </IconButton>
      </div>
      <div className="search-field">
        <Search size={17} />
        <input
          aria-label="Search conversations"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conversations"
        />
        {query && (
          <IconButton label="Clear search" onClick={() => setQuery("")}>
            <X size={15} />
          </IconButton>
        )}
      </div>
      <div className="conversation-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All messages <span>{state.conversations.length}</span>
        </button>
        <button
          className={filter === "unread" ? "active" : ""}
          onClick={() => setFilter("unread")}
        >
          Unread {unreadCount > 0 && <span>{unreadCount}</span>}
        </button>
      </div>
      <div className="conversation-list">
        {state.listError && (
          <ErrorNotice
            message={state.listError}
            onRetry={state.loadConversations}
          />
        )}
        {state.listLoading && !state.conversations.length ? (
          <Spinner label="Finding your conversations…" />
        ) : conversations.length ? (
          conversations.map((user) => (
            <button
              key={user._id}
              className={`conversation-row ${state.activeId === user._id ? "selected" : ""}`}
              onClick={() => state.selectConversation(user)}
              aria-current={state.activeId === user._id ? "true" : undefined}
            >
              <Avatar
                key={user.profilePic}
                user={user}
                online={state.onlineUsers.includes(user._id)}
              />
              <span className="conversation-copy">
                <span className="conversation-title">
                  <strong>{user.fullName}</strong>
                  <time>{timeLabel(user.lastMessage)}</time>
                </span>
                <span className="conversation-preview-text">
                  <span>
                    {user.lastMessage?.senderId === state.profile?._id
                      ? "You: "
                      : ""}
                    {preview(user.lastMessage)}
                  </span>
                  {state.unread[user._id] > 0 && (
                    <span className="unread-badge">
                      {state.unread[user._id] > 99
                        ? "99+"
                        : state.unread[user._id]}
                    </span>
                  )}
                </span>
              </span>
            </button>
          ))
        ) : (
          <div className="sidebar-empty">
            <MessageCircle size={28} />
            <h3>
              {query
                ? "No conversations found"
                : filter === "unread"
                  ? "You’re all caught up"
                  : "Make the first move"}
            </h3>
            <p>
              {query
                ? "Try a different name."
                : filter === "unread"
                  ? "Your unread messages will appear here."
                  : "A good conversation starts with hello."}
            </p>
            {!query && filter === "all" && (
              <button className="text-button" onClick={onNew}>
                Start a conversation <SquarePen size={15} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="sidebar-bottom">
        <InstallButton />
        <div className="account-row">
          <button className="account-button" onClick={onSettings}>
            <Avatar user={state.profile} size="avatar-small" />
            <span>
              <strong>{state.profile?.fullName}</strong>
              <small>
                <Circle
                  size={7}
                  fill="currentColor"
                  className={
                    state.connection === "connected" ? "text-green" : ""
                  }
                />
                {!state.networkOnline
                  ? "Offline"
                  : state.connection === "connected"
                    ? "Connected"
                    : "Connecting"}
              </small>
            </span>
          </button>
          <IconButton label="Account and appearance" onClick={onSettings}>
            <Settings2 size={19} />
          </IconButton>
        </div>
      </div>
    </aside>
  );
}
