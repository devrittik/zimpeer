import { useEffect, useMemo, useRef, useState } from "react";
import ControlGuard from "./ControlGuard";
import { useChatStore } from "../store/useChatStore";
import styles from "../styles/chatPanel.module.css";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

function formatCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes = 0) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function truncateFileName(name = "", maxBaseLength = 24) {
  if (!name) return "";

  const lastDotIndex = name.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === name.length - 1) {
    return name.length > maxBaseLength ? `${name.slice(0, maxBaseLength)}...` : name;
  }

  const base = name.slice(0, lastDotIndex);
  const extension = name.slice(lastDotIndex);

  if (base.length <= maxBaseLength) {
    return name;
  }

  return `${base.slice(0, maxBaseLength)}...${extension}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PaperclipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 15h6" />
    <path d="M9 11h3" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ChatPanel = ({ socket, displayName, currentUsername, chatLocked, fileLocked, isHost, participantCount: participantCountProp }) => {
  const [input, setInput] = useState("");
  const [downloadedFiles, setDownloadedFiles] = useState({});
  const [pendingFile, setPendingFile] = useState(null);
  const listRef = useRef(null);
  const fileInputRef = useRef(null);

  const { messages, addMessage } = useChatStore();

  const participantCount = useMemo(() => {
    if (typeof participantCountProp === "number") {
      return Math.max(participantCountProp, 1);
    }

    const senders = new Set(messages.map((msg) => msg.sender).filter(Boolean));
    return Math.max(senders.size, 1);
  }, [messages, participantCountProp]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendPayload = (payload) => {
    if (!socket) return;
    if (chatLocked && !isHost) return;
    if (payload.type === "file" && fileLocked && !isHost) return;

    addMessage(payload, true, true);
    socket.emit("chat-message", payload);
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed && !pendingFile) return;

    if (pendingFile) {
      sendPayload({
        id: Date.now(),
        type: "file",
        data: trimmed || pendingFile.name,
        sender: displayName,
        senderUsername: currentUsername,
        senderId: socket?.id,
        time: formatCurrentTime(),
        createdAt: new Date().toISOString(),
        file: pendingFile,
      });

      setPendingFile(null);
      setInput("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    sendPayload({
      id: Date.now(),
      type: "text",
      data: trimmed,
      sender: displayName,
      senderUsername: currentUsername,
      senderId: socket?.id,
      time: formatCurrentTime(),
      createdAt: new Date().toISOString(),
    });

    setInput("");
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileUrl = await readFileAsDataUrl(file);

      setPendingFile({
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
      });
    } catch (error) {
      console.error("Failed to read file for chat:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleDownloadFile = (messageId, file) => {
    if (!file?.url) return;

    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name || "attachment";
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedFiles((prev) => ({
      ...prev,
      [messageId]: true,
    }));
  };

  const removePendingFile = () => {
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.chatRoom}>
      <div className={styles.chatHeader}>
        <div className={styles.headerAvatar}>
          <span className={styles.headerAvatarIcon}>
            <ChatIcon />
          </span>
        </div>
        <div className={styles.headerInfo}>
          <p className={styles.headerTitle}>Meeting Chat</p>
          <p className={styles.headerSubtitle}>
            <span className={styles.onlineDot} />
            {participantCount} participant{participantCount === 1 ? "" : "s"} active
          </p>
        </div>
      </div>

      <div className={styles.messageList} ref={listRef}>
        <div className={styles.dateDivider}>
          <div className={styles.dateDividerLine} />
          <span className={styles.dateDividerText}>Today</span>
          <div className={styles.dateDividerLine} />
        </div>

        {messages.map((msg, index) => {
          const isSelf = currentUsername
            ? (msg.senderUsername === currentUsername || (!msg.senderUsername && msg.sender === displayName))
            : msg.senderId === socket?.id;
          const prevMsg = messages[index - 1];
          const showAvatar = !isSelf && (!prevMsg || prevMsg.senderId !== msg.senderId);
          const showName = !isSelf && (!prevMsg || prevMsg.senderId !== msg.senderId);

          return (
            <div
              key={msg.id ?? `${msg.senderId}-${index}`}
              className={`${styles.messageRow} ${isSelf ? styles.self : styles.other}`}
              style={{ marginTop: showName && !isSelf ? 10 : 2 }}
            >
              {!isSelf &&
                (showAvatar ? (
                  <div className={styles.avatar}>{getInitials(msg.sender)}</div>
                ) : (
                  <div className={styles.avatarSpacer} />
                ))}

              <div className={styles.bubbleWrapper}>
                {showName && <span className={styles.senderName}>{msg.sender}</span>}
                <div className={`${styles.bubble} ${isSelf ? styles.self : styles.other}`}>
                  {msg.type === "file" && msg.file ? (
                    <div className={styles.fileMessage}>
                      <div className={styles.fileCard}>
                        <span className={styles.fileIcon}>
                          <FileIcon />
                        </span>
                        <span className={styles.fileMeta}>
                          <span className={styles.fileName} title={msg.file.name}>
                            {truncateFileName(msg.file.name)}
                          </span>
                          <span className={styles.fileSize}>{formatFileSize(msg.file.size)}</span>
                        </span>
                        <button
                          type="button"
                          className={`${styles.downloadBtn} ${downloadedFiles[msg.id] ? styles.downloaded : ""}`}
                          onClick={() => handleDownloadFile(msg.id, msg.file)}
                          title={downloadedFiles[msg.id] ? "Downloaded" : "Download file"}
                          aria-label={downloadedFiles[msg.id] ? "Downloaded" : "Download file"}
                        >
                          {downloadedFiles[msg.id] ? <CheckIcon /> : <DownloadIcon />}
                        </button>
                      </div>
                      {msg.data && msg.data !== msg.file.name && (
                        <p className={styles.fileCaption}>{msg.data}</p>
                      )}
                    </div>
                  ) : (
                    msg.data
                  )}
                </div>
                <span className={styles.messageTime}>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.chattingArea}>
        <ControlGuard isLocked={chatLocked} isHost={isHost}>
          <div className={styles.composerWrap}>
            {chatLocked && !isHost && (
              <div className={styles.lockedBanner}>
                <LockIcon />
                Chat is currently locked by the host.
              </div>
            )}

            {pendingFile && (
              <div className={styles.filePreview}>
                <div className={styles.filePreviewMeta}>
                  <span className={styles.fileIcon}>
                    <FileIcon />
                  </span>
                  <span className={styles.fileMeta}>
                    <span className={styles.fileName} title={pendingFile.name}>
                      {truncateFileName(pendingFile.name)}
                    </span>
                    <span className={styles.fileSize}>{formatFileSize(pendingFile.size)}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.previewCloseBtn}
                  onClick={removePendingFile}
                  title="Remove file"
                  aria-label="Remove file"
                >
                  <CloseIcon />
                </button>
              </div>
            )}

            {fileLocked && !chatLocked && !isHost && (
              <div className={styles.fileLockHint}>
                <LockIcon />
                File sharing is disabled by the host.
              </div>
            )}

            <div className={styles.inputRow}>
              <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />
              <button
                type="button"
                className={styles.attachBtn}
                title={fileLocked && !isHost ? "File sending disabled by host" : "Attach file"}
                onClick={() => fileInputRef.current?.click()}
                disabled={(fileLocked || chatLocked) && !isHost}
              >
                <PaperclipIcon />
              </button>
              <input
                className={styles.textInput}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={pendingFile ? "Add a message with your file..." : "Type a message..."}
                disabled={chatLocked && !isHost}
              />
              <button
                type="button"
                className={styles.sendBtn}
                onClick={sendMessage}
                disabled={
                  !input.trim() && !pendingFile
                    ? true
                    : ((chatLocked || (pendingFile && fileLocked)) && !isHost)
                }
                title="Send"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </ControlGuard>
      </div>
    </div>
  );
};

export default ChatPanel;
