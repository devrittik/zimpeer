import { create } from "zustand";

const TIME_WITH_PERIOD_PATTERN = /^\d{1,2}:\d{2}\s?(AM|PM)$/i;
const TIME_24_HOUR_PATTERN = /^\d{1,2}:\d{2}$/;

const parseMessageDate = (msg = {}) => {
  if (msg.createdAt) {
    const createdAtDate = new Date(msg.createdAt);
    if (!Number.isNaN(createdAtDate.getTime())) {
      return createdAtDate;
    }
  }

  if (typeof msg.time === "string") {
    const rawTime = msg.time.trim();
    const baseDate = new Date();

    if (TIME_WITH_PERIOD_PATTERN.test(rawTime)) {
      const parsedDate = new Date(`${baseDate.toDateString()} ${rawTime.toUpperCase()}`);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    if (TIME_24_HOUR_PATTERN.test(rawTime)) {
      const [hours, minutes] = rawTime.split(":").map(Number);
      const parsedDate = new Date(baseDate);
      parsedDate.setHours(hours, minutes, 0, 0);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
  }

  return new Date();
};

const formatTime = (msg = {}) =>
  parseMessageDate(msg).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const buildMessageId = (msg = {}, timestamp) =>
  msg.id ??
  [
    msg.senderId || "unknown",
    msg.senderUsername || "",
    timestamp,
    msg.type || (msg.file ? "file" : "text"),
    msg.data || msg.file?.name || "message",
  ].join("-");

const normalizeMessage = (msg = {}) => {
  const parsedDate = parseMessageDate(msg);
  const normalizedCreatedAt = parsedDate.toISOString();
  const timestamp = parsedDate.getTime();

  return {
    id: buildMessageId(msg, timestamp),
    type: msg.type || (msg.file ? "file" : "text"),
    data: msg.data || "",
    sender: msg.sender || "Unknown",
    senderUsername: msg.senderUsername || "",
    senderId: msg.senderId || "",
    time: formatTime({ ...msg, createdAt: normalizedCreatedAt }),
    createdAt: normalizedCreatedAt,
    sortValue: timestamp,
    file: msg.file
      ? {
          name: msg.file.name,
          size: msg.file.size,
          type: msg.file.type,
          url: msg.file.url,
        }
      : null,
  };
};

const sortMessages = (messages) =>
  [...messages].sort((a, b) => {
    if (a.sortValue !== b.sortValue) {
      return a.sortValue - b.sortValue;
    }

    return String(a.id).localeCompare(String(b.id));
  });

const mergeMessages = (existingMessages = [], incomingMessages = []) => {
  const byId = new Map(existingMessages.map((message) => [message.id, message]));
  let addedCount = 0;

  incomingMessages.forEach((rawMessage) => {
    const normalizedMessage = normalizeMessage(rawMessage);
    const existingMessage = byId.get(normalizedMessage.id);

    if (!existingMessage) {
      byId.set(normalizedMessage.id, normalizedMessage);
      addedCount += 1;
      return;
    }

    byId.set(normalizedMessage.id, {
      ...existingMessage,
      ...normalizedMessage,
      file: normalizedMessage.file || existingMessage.file,
    });
  });

  return {
    messages: sortMessages([...byId.values()]),
    addedCount,
  };
};

export const useChatStore = create((set) => ({
  messages: [],
  newMessages: 0,

  addMessage: (msg, isSelf = false, isChatOpen = false) =>
    set((state) => {
      const { messages, addedCount } = mergeMessages(state.messages, [msg]);

      return {
        messages,
        newMessages:
          !isSelf && !isChatOpen && addedCount > 0
            ? (state.newMessages || 0) + addedCount
            : state.newMessages,
      };
    }),

  setMessages: (messages, resetUnread = false) =>
    set((state) => {
      const { messages: mergedMessages } = mergeMessages([], messages);

      return {
        messages: mergedMessages,
        newMessages: resetUnread ? 0 : state.newMessages,
      };
    }),

  resetUnread: () => set({ newMessages: 0 }),
  clearChat: () => set({ messages: [], newMessages: 0 }),
}));
