import { create } from "zustand";

const formatTime = (value) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeMessage = (msg = {}) => ({
  id:
    msg.id ??
    `${msg.senderId || "unknown"}-${msg.time || msg.createdAt || Date.now()}-${msg.data || msg.file?.name || "message"}`,
  type: msg.type || (msg.file ? "file" : "text"),
  data: msg.data || "",
  sender: msg.sender || "Unknown",
  senderUsername: msg.senderUsername || "",
  senderId: msg.senderId || "",
  time: msg.time || formatTime(msg.createdAt),
  createdAt: msg.createdAt || new Date().toISOString(),
  file: msg.file
    ? {
        name: msg.file.name,
        size: msg.file.size,
        type: msg.file.type,
        url: msg.file.url,
      }
    : null,
});

export const useChatStore = create((set) => ({
  messages: [],
  newMessages: 0,

  addMessage: (msg, isSelf, isChatOpen) =>
    set((state) => ({
      messages: [...state.messages, normalizeMessage(msg)],
      newMessages:
        !isSelf && !isChatOpen
          ? (state.newMessages || 0) + 1
          : state.newMessages
    })),

  setMessages: (messages) =>
    set({
      messages: messages.map(normalizeMessage),
    }),

  resetUnread: () => set({ newMessages: 0 })
}));
