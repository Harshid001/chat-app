import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  ArrowUpRight,
  ChevronDown,
  MessageCircle,
  Search,
  SquarePen,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useChat } from "../stores/chat";
import {
  Avatar,
  Brand,
  Button,
  ErrorNotice,
  IconButton,
  Input,
  SegmentedControl,
  Spinner,
  ThemeMenu,
} from "./ui";
import { InstallButton } from "./Pwa";
import { preview, timeLabel } from "../lib/format";
import { cn } from "../lib/utils";

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
      aria-label="Conversations"
      className={cn(
        "flex min-h-0 w-full flex-1 flex-col bg-sidebar/80 backdrop-blur-2xl md:w-72 md:flex-none md:border-r lg:w-80 xl:w-[340px]",
        state.activeId && "hidden md:flex",
      )}
    >
      <div className="safe-top">
        <div className="flex items-center justify-between px-5 pb-5 pt-5 md:px-6 md:pt-7">
          <Brand small />
          <div className="md:hidden">
            <ThemeMenu />
          </div>
          <span className="hidden rounded-md border bg-surface px-2 py-1 text-[10px] font-medium tracking-wide text-muted-foreground md:inline-flex">
            PERSONAL
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 pb-5 md:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-.8px]">Messages</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Your everyday conversations.
          </p>
        </div>
        <IconButton
          label="New message"
          onClick={onNew}
          className="border bg-surface text-foreground shadow-xs"
        >
          <SquarePen size={18} />
        </IconButton>
      </div>
      <div className="relative mx-5 md:mx-6">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-3.5 z-10 text-muted-foreground"
        />
        <Input
          aria-label="Search conversations"
          placeholder="Search conversations"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="bg-background pl-10 pr-10"
        />
        {query && (
          <IconButton
            label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-1 top-0.5"
          >
            <X size={15} />
          </IconButton>
        )}
      </div>
      <SegmentedControl
        className="mx-5 my-4 md:mx-6"
        label="Filter conversations"
        value={filter}
        onChange={setFilter}
        options={[
          {
            value: "all",
            label: "All messages",
            count: state.conversations.length,
          },
          { value: "unread", label: "Unread", count: unreadCount },
        ]}
      />
      <div className="flex items-center justify-between px-6 pb-2 pt-2 text-[10px] font-medium uppercase tracking-[.1em] text-muted-foreground">
        <span>
          {filter === "unread"
            ? "Unread conversations"
            : "Recent conversations"}
        </span>
        <span>{conversations.length}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4">
        {state.listError && (
          <ErrorNotice
            message={state.listError}
            onRetry={state.loadConversations}
          />
        )}
        {state.listLoading && !state.conversations.length ? (
          <Spinner label="Loading conversations…" />
        ) : conversations.length ? (
          conversations.map((user) => (
            <button
              key={user._id}
              onClick={() => state.selectConversation(user)}
              aria-current={state.activeId === user._id ? "true" : undefined}
              className={cn(
                "group relative my-1 flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition-colors hover:bg-muted/70",
                state.activeId === user._id && "bg-accent hover:bg-accent",
              )}
            >
              {state.activeId === user._id && (
                <motion.span
                  layoutId="selected-conversation"
                  className="absolute left-0 h-7 w-[3px] rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 450, damping: 40 }}
                />
              )}
              <Avatar
                user={user}
                online={state.onlineUsers.includes(user._id)}
              />
              <span className="min-w-0 flex-1">
                <span className="mb-1.5 flex items-center gap-2">
                  <strong className="flex-1 truncate text-[13px] font-semibold">
                    {user.fullName}
                  </strong>
                  <time className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {timeLabel(user.lastMessage)}
                  </time>
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex-1 truncate text-xs leading-5 text-muted-foreground">
                    {user.lastMessage?.senderId === state.profile?._id
                      ? "You: "
                      : ""}
                    {preview(user.lastMessage)}
                  </span>
                  {state.unread[user._id] > 0 && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
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
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="mb-4 rounded-2xl border bg-surface p-3 text-muted-foreground">
              <MessageCircle size={23} strokeWidth={1.5} />
            </span>
            <h3 className="text-sm font-medium">
              {query
                ? "No conversations found"
                : filter === "unread"
                  ? "You’re all caught up"
                  : "A fresh start"}
            </h3>
            <p className="mt-2 max-w-52 text-xs leading-relaxed text-muted-foreground">
              {query
                ? "Try searching for another name."
                : filter === "unread"
                  ? "New messages will appear here."
                  : "Find a friend and start your first conversation."}
            </p>
            {!query && filter === "all" && (
              <Button
                variant="ghost"
                size="small"
                className="mt-4 text-primary"
                onClick={onNew}
              >
                Start a conversation
                <ArrowUpRight size={14} />
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="safe-bottom border-t px-4 pt-3">
        <InstallButton />
        <button
          onClick={onSettings}
          aria-label="Account and appearance"
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-muted"
        >
          <Avatar user={state.profile} size="avatar-small" />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-xs font-semibold">
              {state.profile?.fullName}
            </strong>
            <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  state.connection === "connected"
                    ? "bg-status"
                    : "bg-muted-foreground",
                )}
              />
              {!state.networkOnline
                ? "Offline"
                : state.connection === "connected"
                  ? "Connected"
                  : "Connecting"}
            </span>
          </span>
          <ChevronDown size={15} className="text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
}
