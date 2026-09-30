import { create } from "zustand";
import { io } from "socket.io-client";
import {
  api,
  errorMessage,
  attachmentErrorMessage,
  getSessionToken,
  serverUrl,
} from "../lib/api";

let socket;
let epoch = 0;
const requests = new Set();
async function request(config) {
  const controller = new AbortController();
  requests.add(controller);
  try {
    return await api({ ...config, signal: controller.signal });
  } finally {
    requests.delete(controller);
  }
}
const initial = () => ({
  profile: null,
  conversations: [],
  users: [],
  messages: {},
  activeId: null,
  drafts: {},
  unread: {},
  onlineUsers: [],
  connection: "disconnected",
  booting: false,
  bootError: "",
  listLoading: false,
  listError: "",
  usersLoading: false,
  usersError: "",
  loading: {},
  errors: {},
  hasMore: {},
  networkOnline: navigator.onLine,
});
export function mergeMessages(existing, incoming) {
  const merged = [...existing];
  for (const message of incoming) {
    const index = merged.findIndex(
      (item) =>
        item._id === message._id ||
        (message.clientMessageId &&
          item.clientMessageId === message.clientMessageId),
    );
    if (index < 0) merged.push(message);
    else merged[index] = { ...message, status: undefined };
  }
  return merged.sort((a, b) => {
    if (a.createdAt && b.createdAt)
      return new Date(a.createdAt) - new Date(b.createdAt);
    return String(a._id).localeCompare(String(b._id));
  });
}

export const useChat = create((set, get) => ({
  ...initial(),
  async initialize() {
    if (!navigator.onLine) return;
    const run = ++epoch;
    set({ booting: true, bootError: "" });
    try {
      const { data } = await request({ url: "/auth/check" });
      if (run !== epoch) return;
      if (!data?._id) throw new Error("Invalid profile");
      set({ profile: data, booting: false });
      await get().loadConversations();
      if (run === epoch) get().connect();
    } catch (error) {
      if (run === epoch)
        set({ booting: false, bootError: errorMessage(error) });
    }
  },
  reset() {
    epoch++;
    requests.forEach((controller) => controller.abort());
    socket?.removeAllListeners();
    socket?.disconnect();
    socket = null;
    set(initial());
  },
  async loadConversations() {
    const run = epoch;
    set({ listLoading: true, listError: "" });
    try {
      const { data } = await request({ url: "/messages/conversations" });
      if (run === epoch)
        set((state) => ({
          conversations: [
            ...data,
            ...state.conversations.filter(
              (item) => !data.some((other) => other._id === item._id),
            ),
          ],
          listLoading: false,
        }));
    } catch (error) {
      if (run === epoch)
        set({ listLoading: false, listError: errorMessage(error) });
    }
  },
  async loadUsers() {
    const run = epoch;
    set({ usersLoading: true, usersError: "" });
    try {
      const { data } = await request({ url: "/messages/users" });
      if (run === epoch) set({ users: data, usersLoading: false });
    } catch (error) {
      if (run === epoch)
        set({ usersLoading: false, usersError: errorMessage(error) });
    }
  },
  selectConversation(user) {
    set((state) => ({
      activeId: user._id,
      unread: { ...state.unread, [user._id]: 0 },
      conversations: state.conversations.some((item) => item._id === user._id)
        ? state.conversations
        : [user, ...state.conversations],
    }));
    get().loadMessages(user._id);
  },
  clearSelection: () => set({ activeId: null }),
  setDraft: (id, text) =>
    set((state) => ({ drafts: { ...state.drafts, [id]: text } })),
  async loadMessages(id, older = false) {
    if (get().loading[id]) return;
    const run = epoch;
    const existing = get().messages[id] || [];
    const before = older
      ? existing.find((message) => !message.status)?._id
      : undefined;
    set((state) => ({
      loading: { ...state.loading, [id]: true },
      errors: { ...state.errors, [id]: "" },
    }));
    try {
      const { data } = await request({
        url: `/messages/${id}`,
        params: before ? { before } : {},
      });
      if (run !== epoch) return;
      const messages = Array.isArray(data) ? data : data.messages;
      set((state) => ({
        messages: {
          ...state.messages,
          [id]: mergeMessages(state.messages[id] || [], messages),
        },
        loading: { ...state.loading, [id]: false },
        hasMore: {
          ...state.hasMore,
          [id]:
            older || !existing.length
              ? Boolean(data.hasMore)
              : state.hasMore[id],
        },
      }));
    } catch (error) {
      if (run === epoch)
        set((state) => ({
          loading: { ...state.loading, [id]: false },
          errors: { ...state.errors, [id]: errorMessage(error) },
        }));
    }
  },
  receive(message) {
    const state = get();
    if (!state.profile) return;
    const mine = message.senderId === state.profile._id;
    const id = mine ? message.receiverId : message.senderId;
    const exists = (state.messages[id] || []).some(
      (item) =>
        item._id === message._id ||
        (message.clientMessageId &&
          item.clientMessageId === message.clientMessageId),
    );
    const conversation =
      state.conversations.find((item) => item._id === id) ||
      state.users.find((item) => item._id === id);
    set({
      messages: {
        ...state.messages,
        [id]: mergeMessages(state.messages[id] || [], [message]),
      },
      unread: {
        ...state.unread,
        [id]:
          !mine && !exists && (state.activeId !== id || document.hidden)
            ? (state.unread[id] || 0) + 1
            : state.unread[id] || 0,
      },
      ...(conversation
        ? {
            conversations: [
              { ...conversation, lastMessage: message },
              ...state.conversations.filter((item) => item._id !== id),
            ],
          }
        : {}),
    });
    if (!conversation) get().loadConversations();
  },
  async send(id, text, file, retryMessage) {
    if (!get().profile || !navigator.onLine) return false;
    const run = epoch;
    const clientMessageId =
      retryMessage?.clientMessageId || crypto.randomUUID();
    if (
      (get().messages[id] || []).some(
        (message) =>
          message.clientMessageId === clientMessageId &&
          message.status === "sending",
      )
    )
      return false;
    const optimistic = {
      _id: clientMessageId,
      clientMessageId,
      senderId: get().profile._id,
      receiverId: id,
      text,
      createdAt: new Date().toISOString(),
      status: "sending",
      uploadProgress: 0,
      file,
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [id]: [
          ...(state.messages[id] || []).filter(
            (message) => message.clientMessageId !== clientMessageId,
          ),
          optimistic,
        ],
      },
    }));
    try {
      let body = { text, clientMessageId };
      if (file) {
        body = new FormData();
        body.append("text", text);
        body.append("clientMessageId", clientMessageId);
        body.append("media", file);
      }
      const { data } = await request({
        method: "POST",
        url: `/messages/send/${id}`,
        data: body,
        timeout: file ? 90000 : 30000,
        onUploadProgress: file
          ? (event) => {
              if (run !== epoch) return;
              const progress = event.total
                ? Math.min(100, Math.round((event.loaded / event.total) * 100))
                : 0;
              set((state) => ({
                messages: {
                  ...state.messages,
                  [id]: (state.messages[id] || []).map((message) =>
                    message.clientMessageId === clientMessageId &&
                    message.status === "sending"
                      ? { ...message, uploadProgress: progress }
                      : message,
                  ),
                },
              }));
            }
          : undefined,
      });
      if (run !== epoch) return false;
      get().receive(data.newMessage);
      return true;
    } catch (error) {
      if (run === epoch)
        set((state) => ({
          messages: {
            ...state.messages,
            [id]: (state.messages[id] || []).map((message) =>
              message.clientMessageId === clientMessageId && message.status
                ? {
                    ...message,
                    status: "failed",
                    error: file
                      ? attachmentErrorMessage(error)
                      : errorMessage(error),
                  }
                : message,
            ),
          },
        }));
      return false;
    }
  },
  connect() {
    if (socket) {
      socket.connect();
      return;
    }
    set({ connection: "connecting" });
    socket = io(serverUrl || window.location.origin, {
      autoConnect: false,
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      auth: async (callback) => {
        try {
          callback({ token: await getSessionToken() });
        } catch {
          callback({ token: null });
        }
      },
    });
    socket.on("connect", () => {
      set({ connection: "connected" });
      get().loadConversations();
      if (get().activeId) get().loadMessages(get().activeId);
    });
    socket.on("getOnlineUsers", (users) => {
      if (Array.isArray(users)) set({ onlineUsers: users });
    });
    socket.on("newMessage", (message) => {
      if (message?._id && message.senderId && message.receiverId)
        get().receive(message);
    });
    socket.on("connect_error", () =>
      set({ connection: "error", onlineUsers: [] }),
    );
    socket.on("disconnect", (reason) => {
      set({ connection: "disconnected", onlineUsers: [] });
      if (reason === "io server disconnect") socket?.connect();
    });
    socket.io.on("reconnect_attempt", () => set({ connection: "connecting" }));
    socket.connect();
  },
  refresh() {
    if (!get().profile || !navigator.onLine) return;
    get().loadConversations();
    if (get().activeId) {
      set((state) => ({ unread: { ...state.unread, [state.activeId]: 0 } }));
      get().loadMessages(get().activeId);
    }
    if (!socket?.connected) get().connect();
  },
  setNetworkOnline(online) {
    set({ networkOnline: online });
    if (online) get().refresh();
  },
}));
