import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { Alert, Badge, Box, IconButton, Snackbar, Tooltip, Typography, Menu, Divider} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from '@mui/icons-material/CallEnd';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import Navbar from "../components/Navbar.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import HostControls from "../components/HostControls.jsx";
import VideoTile from "../components/VideoTile.jsx";
import ControlGuard from "../components/ControlGuard.jsx";
import Card from "../components/UI/Card.jsx";
import Button from "../components/UI/Button.jsx";
import Input from "../components/UI/Input.jsx";
import styles from "../styles/videoMeet.module.css";
import { AuthContext } from "../contexts/AuthContext";
import { useChatStore } from "../store/useChatStore.js";
import { generateInviteText } from "../utils/generateInviteText.jsx";
import { SERVER_URL } from "../config/env";

// const SERVER_URL = process.env.SERVER_URL;

const ICE_CONFIG = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const getTokenState = (token) => {
    if (!token) {
        return { isGuest: true, isExpired: false, isInvalid: false };
    }

    try {
        const decoded = jwtDecode(token);
        return {
            isGuest: decoded?.isGuest === true,
            isExpired: decoded?.exp ? decoded.exp * 1000 <= Date.now() : false,
            isInvalid: false,
        };
    } catch {
        return { isGuest: false, isExpired: true, isInvalid: true };
    }
};

const controlButtonSx = (activeColor) => ({
    color: "white",
    backgroundColor: activeColor,
    width: { xs: 42, sm: 44, md: "auto" },
    height: { xs: 42, sm: 44, md: "auto" },
    padding: { xs: 1.15, sm: 1.25, md: 1.5 },
    borderRadius: 2,
    "& .MuiSvgIcon-root": {
        fontSize: { xs: "1.15rem", sm: "1.2rem", md: "1.5rem" },
    },
    "&:hover": {
        backgroundColor: activeColor.replace("0.9", "1"),
        transform: "scale(1.1)",
    },
    "&.Mui-disabled": {
        color: "rgba(226, 232, 240, 0.55)",
        backgroundColor: "rgba(51, 65, 85, 0.78)",
    },
    transition: "all 0.2s ease",
});

const hostDangerButtonSx = {
    color: "white",
    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)",
    width: { xs: 42, sm: 44, md: "auto" },
    height: { xs: 42, sm: 44, md: "auto" },
    padding: { xs: 1.15, sm: 1.25, md: 1.5 },
    borderRadius: 2,
    boxShadow: "0 10px 24px rgba(239, 68, 68, 0.22)",
    "& .MuiSvgIcon-root": {
        fontSize: { xs: "1.15rem", sm: "1.2rem", md: "1.5rem" },
    },
    "&:hover": {
        background: "linear-gradient(135deg, rgba(239, 68, 68, 1) 0%, rgba(220, 38, 38, 1) 100%)",
        transform: "scale(1.1)",
    },
    "&.Mui-disabled": {
        color: "rgba(226, 232, 240, 0.55)",
        background: "rgba(71, 85, 105, 0.9)",
        boxShadow: "none",
    },
    transition: "all 0.2s ease",
};

export default function VideoMeet() {

    let { handleJoinCall, generateGuestToken, user } = useContext(AuthContext);
    const { addMessage, newMessages, resetUnread, clearChat } = useChatStore();

    // const { addToHistory } = useContext(AuthContext);
    const { roomId } = useParams();
    let routeTo = useNavigate();

    // UI STATE
    const [displayName, setDisplayName] = useState("");
    const [currentUsername, setCurrentUsername] = useState("");
    const [tempName, setTempName] = useState("");
    const [isHost, setIsHost] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [videos, setVideos] = useState([]);
    const [participants, setParticipants] = useState({});
    const [joinNotice, setJoinNotice] = useState(null);
    const visibleParticipantCount = videos.length;
    const totalParticipantCount = visibleParticipantCount + 1;
    const layoutCount = visibleParticipantCount;
    const participantBadgeCount = totalParticipantCount;
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    let [showModal, setModal] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    // let [message, setMessage] = useState("");
    // let [messages, setMessages] = useState([]);
    // let [newMessages, setNewMessages] = useState(null);
    let [audioLocked, setAudioLocked] = useState(false);
    let [videoLocked, setVideoLocked] = useState(false);
    let [chatLocked, setChatLocked] = useState(false);
    let [fileLocked, setFileLocked] = useState(false);
    const [meetingLocked, setMeetingLocked] = useState(false);
    const [chatEnabled, setChatEnabled] = useState(true);
    const [fileSendingEnabled, setFileSendingEnabled] = useState(true);
    const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
    const [hasRealVideo, setHasRealVideo] = useState(false);
    const [hasRealAudio, setHasRealAudio] = useState(false);
    const [shareMenuAnchor, setShareMenuAnchor] = useState(null);

    // REFS
    const socketRef = useRef(null);
    const connectionsRef = useRef({});
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const videoTrackRef = useRef(null);
    const audioTrackRef = useRef(null);
    const screenTrackRef = useRef(null);
    const showModalRef = useRef(showModal);
    const isHostRef = useRef(false);
    const currentUsernameRef = useRef("");
    const fileLockedRef = useRef(false);
    const joinNoticeTimeoutRef = useRef(null);
    const chatSessionStartedAtRef = useRef(Date.now());

    // TODO : isChrome === false

    // Black || Silence
    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();

        let dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume();

        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    useEffect(() => {
        const silentAudioTrack = silence();
        const blackVideoTrack = black();

        const fakeStream = new MediaStream([
            silentAudioTrack,
            blackVideoTrack
        ]);

        localStreamRef.current = fakeStream;

        audioTrackRef.current = silentAudioTrack;
        videoTrackRef.current = blackVideoTrack;

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = fakeStream;
        }

        setVideoEnabled(false);
        setAudioEnabled(false);

    }, []);

    useEffect(() => {
        if (!user) return;

        if (user.isGuest) {
            if (tempName) {
                setDisplayName(`${tempName} (Guest)`);
            }
        } else {
            if (user.name && user.username) {
                setDisplayName(`${user.name} (@${user.username})`);
            }
        }
    }, [user, tempName]);

    useEffect(() => {
        if (!showPreview && localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, [showPreview]);

    // Chat message handler is attached after socket is created in connect()

    useEffect(() => {
        showModalRef.current = showModal;
    }, [showModal]);

    useEffect(() => {
        isHostRef.current = isHost;
    }, [isHost]);

    useEffect(() => {
        currentUsernameRef.current = currentUsername;
    }, [currentUsername]);

    useEffect(() => {
        fileLockedRef.current = fileLocked;
    }, [fileLocked]);

    const showToast = (message, severity = "info") => {
        setToast({ open: true, message, severity });
    };

    const showJoinNotice = (message) => {
        setJoinNotice(message);

        if (joinNoticeTimeoutRef.current) {
            clearTimeout(joinNoticeTimeoutRef.current);
        }

        joinNoticeTimeoutRef.current = setTimeout(() => {
            setJoinNotice(null);
        }, 4000);
    };

    // PEER CONNECTION
    const createPeerConnection = (remoteId) => {
        const pc = new RTCPeerConnection(ICE_CONFIG);

        // DEBUG
        console.log("Creating PC for:", remoteId);
        console.log("screenTrackRef.current:", screenTrackRef.current);
        console.log("videoTrackRef.current:", videoTrackRef.current);
        console.log("isScreenSharing:", isScreenSharing);

        const currentVideoTrack = screenTrackRef.current || videoTrackRef.current;
        console.log("Using track:", currentVideoTrack);

        if (currentVideoTrack) {
            pc.addTrack(currentVideoTrack, localStreamRef.current);
        }

        if (audioTrackRef.current) {
            pc.addTrack(audioTrackRef.current, localStreamRef.current);
        }

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socketRef.current.emit(
                    "signal",
                    remoteId,
                    JSON.stringify({ ice: e.candidate })
                );
            }
        };

        pc.ontrack = (e) => {
            const stream = e.streams[0];
            setVideos((prev) => {
                if (prev.find((v) => v.socketId === remoteId)) return prev;
                return [...prev, { socketId: remoteId, stream }];
            });
        };

        return pc;
    };

    // SIGNALING
    const handleSignal = async (fromId, message) => {
        const data = JSON.parse(message);
        let pc = connectionsRef.current[fromId];

        if (!pc) {
            pc = connectionsRef.current[fromId] = createPeerConnection(fromId);
        }

        if (data.sdp) {
            if (data.sdp.type === "offer") {
                if (pc.signalingState !== "stable") {
                    console.warn("Ignoring offer in non-stable state:", pc.signalingState);
                    return;
                }

                await pc.setRemoteDescription(data.sdp);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socketRef.current.emit(
                    "signal",
                    fromId,
                    JSON.stringify({ sdp: pc.localDescription })
                );
                return;
            }

            if (data.sdp.type === "answer") {
                if (pc.signalingState !== "have-local-offer") {
                    console.warn("Ignoring answer in unexpected state:", pc.signalingState);
                    return;
                }

                await pc.setRemoteDescription(data.sdp);
            }
        }

        if (data.ice) {
            await pc.addIceCandidate(data.ice);
        }
    };

    // // Chat Message
    // let sendMessage = () => {

    //     console.log("SOCKET:", socketRef.current);

    //     if (chatLocked && !isHost) {
    //         return;
    //     }

    //     socketRef.current.emit("chat-message", message, displayName);
    //     setMessage("");
    // }

    // let addMessage = (msg) => {

    //     const { senderId } = msg;

    //     console.log("Add Message (VideoMeet.jsx) : ", msg);

    //     // setMessages((prev) => [...prev, { sender, data, senderId }]);

    //     if (!showModal && senderId !== socketRef.current.id) {
    //         setNewMessages((prev) => (prev || 0) + 1);
    //     }
    // };

    const connect = async () => { // JOIN

        clearChat();
        chatSessionStartedAtRef.current = Date.now();

        console.log("connect pushed");

        let token = localStorage.getItem("token");

        if (!token) {
            console.log("New Guest");
            token = await generateGuestToken();
        } else {
            const tokenState = getTokenState(token);

            if (tokenState.isExpired || tokenState.isInvalid) {
                if (tokenState.isGuest) {
                    console.log("Guest token expired => regenerating");
                    token = await generateGuestToken();
                } else {
                    showToast("Session expired, please login again", "error");
                    localStorage.removeItem("token");
                    setTimeout(() => routeTo("/auth"), 4500);
                    return;
                }
            }
        }

        let res;

        try {
            res = await handleJoinCall(roomId, token);

        } catch (err) {

            const status = err?.response?.status;
            const tokenState = getTokenState(token);

            if (status === 401 && tokenState.isGuest) {
                console.log("Guest token expired => regenerating");

                const newToken = await generateGuestToken();

                token = newToken;

                res = await handleJoinCall(roomId, newToken);

            } else if (status === 401) {
                console.log("joinCall failed: 401, scheduling auth redirect");
                showToast("Session expired, please login again", "error");
                localStorage.removeItem("token");
                setTimeout(() => routeTo("/auth"), 4500);
                return;

            } else if (status === 404) {
                console.log("joinCall failed: 404, scheduling home redirect");
                showToast("Meeting expired or does not exist", "error");
                setTimeout(() => routeTo("/home"), 4500);
                return;

            } else if (status === 403) {
                console.log("joinCall failed: 403 (meeting locked), scheduling home redirect");
                showToast("Meeting is locked by the host", "error");
                setTimeout(() => routeTo("/home"), 4500);
                return;

            } else {
                showToast("Unable to join meeting", "error");
                return;
            }
        }

        setIsHost(res?.isHost);
        setCurrentUsername(jwtDecode(token)?.username || "");
        setAudioLocked(Boolean(res?.controls?.audioLocked));
        setVideoLocked(Boolean(res?.controls?.videoLocked));
        setChatLocked(Boolean(res?.controls?.chatLocked));
        setChatEnabled(!res?.controls?.chatLocked);
        setFileLocked(Boolean(res?.controls?.fileLocked));
        setFileSendingEnabled(!res?.controls?.fileLocked);
        setMeetingLocked(Boolean(res?.controls?.meetingLocked));

        let retriedSocketAuth = false;

        socketRef.current = io(SERVER_URL, {
            auth: { token },
            autoConnect: true
        });

        socketRef.current.on("connect_error", async (error) => {
            const message = error?.message || "";
            const isAuthError = message === "Invalid token" || message === "No token";

            if (!isAuthError) {
                console.warn("Socket reconnect pending:", message || error);
                return;
            }

            if (retriedSocketAuth) {
                showToast("Unable to join meeting", "error");
                return;
            }

            retriedSocketAuth = true;
            const tokenState = getTokenState(token);

            if (tokenState.isGuest) {
                token = await generateGuestToken();
                socketRef.current.auth = { token };
                socketRef.current.connect();
                return;
            }

            showToast("Session expired, please login again", "error");
            localStorage.removeItem("token");
            setTimeout(() => routeTo("/auth"), 4500);
        });

        socketRef.current.on("connect", () => {
            console.log("Connected:", socketRef.current.id);

            socketRef.current.emit("join-call", { roomId, displayName }, (response) => {
                if (!response.success) {
                    socketRef.current?.disconnect();

                    if (response.message?.includes("expired")) {
                        showToast("Meeting expired", "error");
                        setTimeout(() => routeTo("/home"), 4500);
                        return;
                    }

                    showToast(response.message, "error");
                    return;
                }

                setTimeout(() => setShowPreview(false), 0);
            });

            socketRef.current.on("signal", handleSignal);

            socketRef.current.on("user-joined", async (joinedUser, clients = []) => {
                const joinedUserId = joinedUser?.id;

                if (joinedUserId && joinedUserId !== socketRef.current?.id) {
                    setParticipants((prev) => ({
                        ...prev,
                        [joinedUserId]: {
                            id: joinedUserId,
                            displayName: joinedUser?.displayName || "Participant",
                            username: joinedUser?.username || "",
                        },
                    }));

                    showJoinNotice(`${joinedUser?.displayName || "Participant"} joined the meeting`);
                }

                clients.forEach((client) => {
                    if (!connectionsRef.current[client.id]) {
                        connectionsRef.current[client.id] =
                            createPeerConnection(client.id);
                    }

                    setParticipants((prev) => ({
                        ...prev,
                        [client.id]: {
                            id: client.id,
                            displayName: client.displayName || "Participant",
                            username: client.username || "",
                        },
                    }));
                });

                if (clients.length > 0) {
                    for (const client of clients) {
                        const pc = connectionsRef.current[client.id];
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socketRef.current.emit(
                            "signal",
                            client.id,
                            JSON.stringify({ sdp: pc.localDescription })
                        );
                    }
                }
            });

            // Chat message handler
            const chatMessageHandler = (msg) => {
                // Determine if the incoming message is from the current user.
                // The original implementation attempted to skip adding
                // self‑messages because they are already added locally via
                // `sendPayload`. However, when a user rejoins the room the
                // socket id changes and the server re‑broadcasts all
                // messages, including the user’s own. The previous logic
                // incorrectly identified those messages as *not* from the
                // current user (due to the changed socket id) and then
                // skipped them, causing self‑messages to disappear after a
                // re‑join.
                //
                // To fix this, we always add the message to the store and
                // rely on `mergeMessages` to dedupe by id. This guarantees
                // that self‑messages are preserved across re‑joins.
                const messageCreatedAt = msg?.createdAt ? new Date(msg.createdAt).getTime() : null;
                const isHistoricalMessage =
                    typeof messageCreatedAt === "number" &&
                    !Number.isNaN(messageCreatedAt) &&
                    messageCreatedAt < chatSessionStartedAtRef.current;

                addMessage(msg, false, showModalRef.current || isHistoricalMessage);
            };

            socketRef.current.on("chat-message", chatMessageHandler);

            socketRef.current.on("user-left", (id) => {
                connectionsRef.current[id]?.close();
                delete connectionsRef.current[id];
                setParticipants((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
                setVideos((prev) => prev.filter((v) => v.socketId !== id));
            });

            socketRef.current.on("meeting-ended", () => {
                showToast("Meeting ended by host", "error");
                setTimeout(() => handleEndCall({ navigateOnly: true }), 4500);
            });

            socketRef.current.on("kicked", () => {
                showToast("You were removed from the meeting", "error");
                setTimeout(() => handleEndCall({ navigateOnly: true }), 4500);
            });

            socketRef.current.on("blocked", () => {
                showToast("You were blocked by the host", "error");
                setTimeout(() => handleEndCall({ navigateOnly: true }), 4500);
            });

            socketRef.current.on("lockMeeting", ({ locked }) => {
                setMeetingLocked(Boolean(locked));

                if (!isHostRef.current) {
                    showToast(locked ? "Meeting locked" : "Meeting unlocked", "info");
                }
            });

            socketRef.current.on("muteAll", () => {
                setAudioLocked(true);

                if (!isHostRef.current) {
                    disableMedia("audio");
                    showToast("Host muted all participants", "info");
                }
            });

            socketRef.current.on("toggleChat", ({ enabled }) => {
                setChatEnabled(Boolean(enabled));
                setChatLocked(!enabled);
                setFileSendingEnabled(Boolean(enabled) ? !fileLockedRef.current : false);

                if (!isHostRef.current) {
                    showToast(enabled ? "Chat enabled" : "Chat disabled", "info");
                }
            });

            socketRef.current.on("toggleFiles", ({ enabled }) => {
                setFileLocked(!enabled);
                setFileSendingEnabled(Boolean(enabled));

                if (!isHostRef.current) {
                    showToast(enabled ? "File sharing enabled" : "File sharing disabled", "info");
                }
            });

            socketRef.current.on("host-control", ({ type, value }) => {

                if (type === "audio-lock") {
                    setAudioLocked(value);

                    if (value && !isHostRef.current) {
                        disableMedia("audio");
                    }
                }

                if (type === "video-lock") {
                    setVideoLocked(value);

                    if (value && !isHostRef.current) {
                        disableMedia("video");
                        stopScreenShare();
                    }
                }

                if (type === "chat-lock") {
                    setChatLocked(value);
                    setChatEnabled(!value);

                    if (value) {
                        setFileSendingEnabled(false);
                    } else {
                        setFileSendingEnabled(!fileLockedRef.current);
                    }
                }

                if (type === "file-lock") {
                    setFileLocked(value);
                    setFileSendingEnabled(!value);
                }

                if (type === "meeting-lock") {
                    setMeetingLocked(value);
                }

            });
        });
    };

    // Call End
    let handleEndCall = ({ navigateOnly = false } = {}) => {
        if (!navigateOnly && isHostRef.current) {
            socketRef.current?.emit("end-meeting", roomId);
        }

        try {
            let tracks = localVideoRef.current?.srcObject?.getTracks?.() || [];
            tracks.forEach(track => track.stop());
        } catch (e) {
            console.log(e);
        }

        routeTo("/home");
    };

    // Media Enable
    const enableMedia = async (kind) => {
        const isVideo = kind === "video";

        if (isVideo) {
            if (videoLocked && !isHost) return;
        } else {
            if (audioLocked && !isHost) return;
        }

        const trackRef = isVideo ? videoTrackRef : audioTrackRef;

        const hasReal = isVideo ? hasRealVideo : hasRealAudio;

        // already real track
        if (hasReal) {
            trackRef.current.enabled = true;
            isVideo ? setVideoEnabled(true) : setAudioEnabled(true);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: isVideo,
                audio: !isVideo
            });

            const newTrack = isVideo
                ? stream.getVideoTracks()[0]
                : stream.getAudioTracks()[0];

            if (!localStreamRef.current) {
                localStreamRef.current = new MediaStream();
            }

            // remove fake track
            const oldTrack = trackRef.current;
            if (oldTrack) {
                localStreamRef.current.removeTrack(oldTrack);
                oldTrack.stop();
            }

            localStreamRef.current.addTrack(newTrack);

            Object.values(connectionsRef.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track && s.track.kind === kind);

                if (sender) {
                    sender.replaceTrack(newTrack);
                } else {
                    pc.addTrack(newTrack, localStreamRef.current);
                }
            });

            trackRef.current = newTrack;

            // force refresh
            localVideoRef.current.srcObject = null;
            localVideoRef.current.srcObject = localStreamRef.current;

            if (isVideo) {
                setVideoEnabled(true);
                setHasRealVideo(true);
            } else {
                setAudioEnabled(true);
                setHasRealAudio(true);
            }

        } catch (err) {
            showToast(`${kind} permission required`, "error");
        }
    };

    // Media Disable
    const disableMedia = (kind) => {
        const isVideo = kind === "video";
        const trackRef = isVideo ? videoTrackRef : audioTrackRef;

        if (trackRef.current) {
            trackRef.current.enabled = false;
        }

        isVideo ? setVideoEnabled(false) : setAudioEnabled(false);
    };

    // TOGGLES
    const toggleMedia = async (kind) => {
        const isVideo = kind === "video";
        const enabled = isVideo ? videoEnabled : audioEnabled;

        enabled ? disableMedia(kind) : await enableMedia(kind);
    };

    const startScreenShare = async () => {
        if (videoLocked && !isHost) {
            showToast("Screen sharing is disabled by the host", "warning");
            return;
        }

        // Feature detection – some mobile browsers do not support getDisplayMedia
        if (!navigator.mediaDevices?.getDisplayMedia) {
            showToast("Screen sharing is not supported on this device", "error");
            return;
        }

        try {
            // On mobile we only request video; audio is not needed for screen share
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            screenTrackRef.current = screenTrack;

            Object.values(connectionsRef.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === "video");
                if (sender) sender.replaceTrack(screenTrack);
            });

            localVideoRef.current.srcObject = screenStream;
            setIsScreenSharing(true);
            screenTrack.onended = stopScreenShare;
        } catch (err) {
            console.log("Screen share cancelled", err);
            setIsScreenSharing(false);
        }
    };

    const stopScreenShare = () => {
        if (!screenTrackRef.current) return;
        const cameraTrack = videoTrackRef.current;

        Object.values(connectionsRef.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === "video");
            if (sender) {
                sender.replaceTrack(cameraTrack);
            }
        });

        localVideoRef.current.srcObject = localStreamRef.current;

        screenTrackRef.current?.stop();
        screenTrackRef.current = null;

        setIsScreenSharing(false);
    };

    // CLEANUP
    useEffect(() => {
        const activeConnections = connectionsRef.current;

        return () => {
            clearChat();
            if (joinNoticeTimeoutRef.current) {
                clearTimeout(joinNoticeTimeoutRef.current);
            }
            socketRef.current?.disconnect();
            Object.values(activeConnections).forEach((pc) => pc.close());
            localStreamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, [clearChat]);

    // Handle opening the chat
    const handleToggleChat = () => {
        const nextOpen = !showModal;

        if (nextOpen) {
            resetUnread();
        }

        setModal(nextOpen);
    };

    const emitHostControl = (type, value) => {
        if (!socketRef.current) {
            showToast("Meeting connection unavailable", "error");
            return false;
        }

        socketRef.current.emit("host-control", { roomId, type, value });
        return true;
    };

    const handleToggleMeetingLock = () => {
        const nextLocked = !meetingLocked;

        if (!socketRef.current) {
            showToast("Meeting connection unavailable", "error");
            return;
        }

        setMeetingLocked(nextLocked);
        socketRef.current.emit("lockMeeting", { roomId, locked: nextLocked });
    };

    const handleToggleParticipantAudio = () => {
        emitHostControl("audio-lock", !audioLocked);
    };

    const handleToggleParticipantVideo = () => {
        emitHostControl("video-lock", !videoLocked);
    };

    const handleToggleParticipantChat = () => {
        const nextEnabled = !chatEnabled;

        if (!socketRef.current) {
            showToast("Meeting connection unavailable", "error");
            return;
        }

        setChatEnabled(nextEnabled);
        setChatLocked(!nextEnabled);

        if (!nextEnabled && showModalRef.current && !isHostRef.current) {
            setModal(true);
        }

        socketRef.current.emit("toggleChat", { roomId, enabled: nextEnabled });
    };

    const handleToggleFileSending = () => {
        if (!socketRef.current) {
            showToast("Meeting connection unavailable", "error");
            return;
        }

        const nextEnabled = !fileSendingEnabled;
        setFileLocked(!nextEnabled);
        setFileSendingEnabled(nextEnabled);
        socketRef.current.emit("toggleFiles", { roomId, enabled: nextEnabled });
    };

    const handleKickParticipant = (targetId, targetUsername) => {
        if (!socketRef.current || (!targetId && !targetUsername)) {
            showToast("Meeting connection unavailable", "error");
            return;
        }

        socketRef.current.emit("kick-user", { targetId, targetUsername, roomId });
        showToast("Participant removed from the meeting", "success");
    };

    const handleBlockParticipant = (targetId, targetUsername) => {
        if (!socketRef.current || (!targetId && !targetUsername)) {
            showToast("Meeting connection unavailable", "error");
            return;
        }

        socketRef.current.emit("block-user", { targetId, targetUsername, roomId });
        showToast("Participant blocked from rejoining", "warning");
    };

    // Copy handlers
    const handleCopyRoomUrl = () => {
        const meetingLink = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(meetingLink).then(() => {
            showToast("Room URL copied to clipboard", "success");
        }).catch(() => {
            showToast("Failed to copy room URL", "error");
        });
    };

    const handleShareMenuOpen = (event) => {
        // toggle behavior: if already open, close it
        if (shareMenuAnchor) {
            setShareMenuAnchor(null);
            return;
        }
        setShareMenuAnchor(event.currentTarget);
    };

    const handleShareMenuClose = () => {
        setShareMenuAnchor(null);
    };

    const handleCopyInviteText = () => {
        const meetingLink = `${window.location.origin}/room/${roomId}`;
        const inviteText = generateInviteText(roomId, meetingLink);
        navigator.clipboard.writeText(inviteText).then(() => {
            showToast("Invite text copied to clipboard", "success");
            handleShareMenuClose();
        }).catch(() => {
            showToast("Failed to copy invite text", "error");
        });
    };

    const handleShareSocial = (platform) => {
        const meetingLink = `${window.location.origin}/room/${roomId}`;
        const shortText = `Join a Zimpeer meeting\nMeeting ID: ${roomId}`;
        const inviteText = `${shortText}\n${meetingLink}`;

        const encodedText = encodeURIComponent(shortText);
        const encodedInviteText = encodeURIComponent(inviteText);
        const encodedUrl = encodeURIComponent(meetingLink);

        let shareUrl = "";

        switch (platform) {
            case "native":
                if (navigator.share) {
                    navigator.share({ title: "Zimpeer Meeting", text: inviteText, url: meetingLink })
                        .then(() => showToast("Shared", "success"))
                        .catch(() => showToast("Share cancelled", "info"));
                } else {
                    shareUrl = `sms:?body=${encodedInviteText}`;
                }
                break;
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(inviteText)}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(inviteText)}`;
                break;
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case "whatsapp":
                shareUrl = `https://api.whatsapp.com/send?text=${encodedInviteText}`;
                break;
            case "telegram":
                shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
                break;
            case "instagram":
                navigator.clipboard.writeText(inviteText).then(() => {
                    showToast("Invite copied — paste into Instagram", "info");
                    window.open("https://www.instagram.com/direct/inbox/", "_blank");
                }).catch(() => {
                    showToast("Failed to copy invite text", "error");
                });
                handleShareMenuClose();
                return;
            case "dm":
                if (navigator.share) {
                    navigator.share({ title: "Zimpeer Meeting", text: inviteText, url: meetingLink })
                        .then(() => showToast("Shared", "success"))
                        .catch(() => showToast("Share cancelled", "info"));
                } else {
                    shareUrl = `sms:?body=${encodedInviteText}`;
                }
                break;
            case "email":
                shareUrl = `mailto:?subject=${encodeURIComponent("Zimpeer Meeting Invitation")}&body=${encodedInviteText}`;
                break;
            default:
                break;
        }

        if (shareUrl) {
            if (platform === "email" || platform === "dm") {
                window.location.href = shareUrl;
            } else {
                window.open(shareUrl, "_blank", "width=600,height=600");
            }
        }

        handleShareMenuClose();
    };

    // UI
    return (
        <div>
            {showPreview ? (
                <Box
                    sx={{
                        minHeight: "100dvh",
                        display: "flex",
                        flexDirection: "column",
                        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1f2937 100%)",
                        position: "relative",
                        overflowX: "hidden",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
                            pointerEvents: "none",
                        },
                    }}
                >
                    <Navbar />

                    {/* Guest Banner */}
                    {user.isGuest && (
                        <Box
                            sx={{
                                position: { xs: "relative", sm: "absolute" },
                                top: { sm: 80, md: 88 },
                                left: { sm: "50%" },
                                transform: { sm: "translateX(-50%)" },
                                alignSelf: "center",
                                background: "rgba(99, 102, 241, 0.1)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(99, 102, 241, 0.2)",
                                borderRadius: "999px",
                                px: { xs: 1.75, sm: 2.5, md: 3 },
                                py: { xs: 1, sm: 1.25, md: 1.5 },
                                color: "#f8fafc",
                                fontSize: { xs: "0.75rem", sm: "0.82rem", md: "0.875rem" },
                                textAlign: "center",
                                mt: { xs: 1.5, sm: 0 },
                                maxWidth: { xs: "calc(100% - 24px)", sm: "unset" },
                                boxShadow: "0 8px 32px rgba(99, 102, 241, 0.15)",
                                zIndex: 100,
                            }}
                        >
                            You're in <strong>Guest mode</strong> • Sign in for full features
                        </Box>
                    )}

                    {/* Lobby Content */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: { xs: "column", md: "row" },
                            gap: { xs: 2, sm: 2.5, md: 4, lg: 6 },
                            flex: 1,
                            width: "100%",
                            maxWidth: 1180,
                            mx: "auto",
                            px: { xs: 1.5, sm: 2.5, md: 4 },
                            py: { xs: 1.5, sm: 2.5, md: 4 },
                            flexWrap: { xs: "nowrap", md: "nowrap" },
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        {/* Form Card */}
                        <Card>
                            <Box
                                component="form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    connect();
                                }}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: { xs: 2, sm: 2.5, md: 3 },
                                    width: "100%",
                                    minWidth: 0,
                                    maxWidth: 400,
                                }}
                            >
                                {/* Title */}
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        textAlign: "center",
                                        background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontSize: { xs: "1.35rem", sm: "1.6rem" },
                                        mb: { xs: 0.5, sm: 1 },
                                    }}
                                >
                                    Enter Lobby
                                </Typography>

                                {/* Display Name Field */}
                                {user.isGuest ? (
                                    <Input
                                        label="Display Name"
                                        value={tempName}
                                        required
                                        onChange={(e) => setTempName(e.target.value)}
                                        autoFocus
                                        placeholder="Enter your name"
                                        sx={{
                                            mt: 0,
                                            mb: 0,
                                            "& .MuiOutlinedInput-root": {
                                                color: "#f8fafc",
                                                minHeight: { xs: 48, sm: 54, md: 58 },
                                                "& fieldset": {
                                                    borderColor: "rgba(148, 163, 184, 0.3)",
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "rgba(99, 102, 241, 0.5)",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#6366f1",
                                                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                                                },
                                            },
                                            "& .MuiInputBase-input": {
                                                py: { xs: 1.45, sm: 1.65 },
                                                fontSize: { xs: "0.95rem", sm: "1rem" },
                                            },
                                            "& .MuiInputLabel-root": {
                                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                            },
                                        }}
                                    />
                                ) : (
                                    <Box sx={{ textAlign: "center" }}>
                                        <Typography
                                            sx={{
                                                color: "#94a3b8",
                                                fontSize: "0.875rem",
                                                mb: 1,
                                            }}
                                        >
                                            Joining as
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: "#f8fafc",
                                                fontWeight: 600,
                                                fontSize: "1rem",
                                            }}
                                        >
                                            {displayName}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Join Button */}
                                <Button
                                    type="submit"
                                    disabled={user.isGuest && !tempName.trim()}
                                    sx={{
                                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                        py: { xs: 1, sm: 1.15, md: 1.3 },
                                        minHeight: { xs: 46, sm: 50, md: 54 },
                                        fontSize: { xs: "0.95rem", sm: "1rem" },
                                        boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)",
                                        "&:hover": {
                                            boxShadow: "0 12px 24px rgba(99, 102, 241, 0.4)",
                                            transform: "translateY(-2px)",
                                        },
                                        "&:disabled": {
                                            background: "rgba(99, 102, 241, 0.4)",
                                            color: "#cbd5e1",
                                            boxShadow: "none",
                                        },
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {user.isGuest ? "Join as Guest" : "Join Meeting"}
                                </Button>

                                {/* Copy and Share Buttons */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: { xs: 1.25, sm: 1.5, md: 2 },
                                        mt: { xs: 0.5, sm: 1.25, md: 2 },
                                    }}
                                >
                                    {/* Copy URL Button */}
                                    <Tooltip title="Copy room URL to clipboard">
                                        <IconButton
                                            onClick={handleCopyRoomUrl}
                                            sx={{
                                                color: "#f8fafc",
                                                backgroundColor: "rgba(99, 102, 241, 0.2)",
                                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                                borderRadius: 1.5,
                                                width: { xs: 42, sm: 46, md: 48 },
                                                height: { xs: 42, sm: 46, md: 48 },
                                                padding: { xs: 0.85, sm: 1, md: 1.2 },
                                                "&:hover": {
                                                    backgroundColor: "rgba(99, 102, 241, 0.3)",
                                                    transform: "scale(1.08)",
                                                },
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            <ContentCopyIcon sx={{ fontSize: { xs: "1.05rem", sm: "1.15rem", md: "1.25rem" } }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Share Button */}
                                    <Tooltip title="Share meeting invite">
                                        <IconButton
                                            onClick={handleShareMenuOpen}
                                            sx={{
                                                color: "#f8fafc",
                                                backgroundColor: "rgba(139, 92, 246, 0.2)",
                                                border: "1px solid rgba(139, 92, 246, 0.3)",
                                                borderRadius: 1.5,
                                                width: { xs: 42, sm: 46, md: 48 },
                                                height: { xs: 42, sm: 46, md: 48 },
                                                padding: { xs: 0.85, sm: 1, md: 1.2 },
                                                "&:hover": {
                                                    backgroundColor: "rgba(139, 92, 246, 0.3)",
                                                    transform: "scale(1.08)",
                                                },
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            <ShareIcon sx={{ fontSize: { xs: "1.05rem", sm: "1.15rem", md: "1.25rem" } }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                {/* Share Menu */}
                                <Menu
                                    anchorEl={shareMenuAnchor}
                                    open={Boolean(shareMenuAnchor)}
                                    onClose={handleShareMenuClose}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                                    disableScrollLock={true}
                                    MenuListProps={{
                                        sx: {
                                            display: 'flex',
                                            gap: 1,
                                            alignItems: 'center',
                                            p: 1,
                                            flexWrap: 'nowrap',
                                            overflowX: 'auto',
                                            WebkitOverflowScrolling: 'touch',
                                        }
                                    }}
                                    PaperProps={{
                                        sx: {
                                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                                            backdropFilter: "blur(12px)",
                                            border: "1px solid rgba(99, 102, 241, 0.2)",
                                            borderRadius: 2,
                                            boxShadow: "0 12px 40px rgba(99, 102, 241, 0.25)",
                                            zIndex: 10000,
                                            maxWidth: "min(92vw, 640px)",
                                        }
                                    }}
                                >
                                    {/* Copy Invite Text Button */}
                                    <Tooltip title="Copy invite text">
                                        <IconButton
                                            onClick={handleCopyInviteText}
                                            size="medium"
                                            sx={{
                                                color: "#f8fafc",
                                                backgroundColor: "rgba(99, 102, 241, 0.15)",
                                                width: 48,
                                                height: 48,
                                                p: 1,
                                                "&:hover": {
                                                    backgroundColor: "rgba(99, 102, 241, 0.28)",
                                                },
                                            }}
                                        >
                                            <ContentCopyIcon sx={{ fontSize: "1.25rem" }} />
                                        </IconButton>
                                    </Tooltip>

                                    <Divider
                                        orientation="vertical"
                                        flexItem
                                        sx={{ borderColor: "rgba(99, 102, 241, 0.2)" }}
                                    />

                                    {/* Facebook Share Button */}
                                    <Tooltip title="Share on Facebook">
                                        <IconButton
                                            onClick={() => handleShareSocial("facebook")}
                                            size="medium"
                                            sx={{
                                                color: "#1877F2",
                                                backgroundColor: "rgba(24, 119, 242, 0.08)",
                                                width: 48,
                                                height: 48,
                                                p: 1,
                                                "&:hover": { backgroundColor: "rgba(24, 119, 242, 0.18)" },
                                            }}
                                        >
                                            <FacebookIcon sx={{ fontSize: "1.25rem" }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Twitter Share Button */}
                                    <Tooltip title="Share on Twitter">
                                        <IconButton
                                            onClick={() => handleShareSocial("twitter")}
                                            size="medium"
                                            sx={{
                                                color: "#1DA1F2",
                                                backgroundColor: "rgba(29, 161, 242, 0.08)",
                                                width: 48,
                                                height: 48,
                                                p: 1,
                                                "&:hover": { backgroundColor: "rgba(29, 161, 242, 0.18)" },
                                            }}
                                        >
                                            <TwitterIcon sx={{ fontSize: "1.25rem" }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* LinkedIn Share Button */}
                                    <Tooltip title="Share on LinkedIn">
                                        <IconButton
                                            onClick={() => handleShareSocial("linkedin")}
                                            size="medium"
                                            sx={{
                                                color: "#0A66C2",
                                                backgroundColor: "rgba(10, 102, 194, 0.08)",
                                                width: 48,
                                                height: 48,
                                                p: 1,
                                                "&:hover": { backgroundColor: "rgba(10, 102, 194, 0.18)" },
                                            }}
                                        >
                                            <LinkedInIcon sx={{ fontSize: "1.25rem" }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* WhatsApp Share Button */}
                                    <Tooltip title="Share on WhatsApp">
                                        <IconButton
                                            onClick={() => handleShareSocial("whatsapp")}
                                            size="medium"
                                            sx={{
                                                color: "#25D366",
                                                backgroundColor: "rgba(37, 211, 102, 0.08)",
                                                width: 48,
                                                height: 48,
                                                p: 1,
                                                "&:hover": { backgroundColor: "rgba(37, 211, 102, 0.18)" },
                                            }}
                                        >
                                            <WhatsAppIcon sx={{ fontSize: "1.25rem" }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Email Share Button */}
                                    <Tooltip title="Share via Email">
                                        <IconButton
                                            onClick={() => handleShareSocial("email")}
                                            size="medium"
                                            sx={{
                                                color: "#EA4335",
                                                backgroundColor: "rgba(234, 67, 53, 0.08)",
                                                width: 48,
                                                height: 48,
                                                p: 1,
                                                "&:hover": { backgroundColor: "rgba(234, 67, 53, 0.18)" },
                                            }}
                                        >
                                            <EmailIcon sx={{ fontSize: "1.25rem" }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Telegram Share Button */}
                                    <Tooltip title="Share on Telegram">
                                        <IconButton
                                            onClick={() => handleShareSocial("telegram")}
                                            size="medium"
                                            sx={{
                                                color: "#0088cc",
                                                backgroundColor: "rgba(0, 136, 204, 0.08)",
                                                width: 48,
                                                height: 48,
                                                p: 1,
                                                "&:hover": { backgroundColor: "rgba(0, 136, 204, 0.18)" },
                                            }}
                                        >
                                            <TelegramIcon sx={{ fontSize: "1.25rem" }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Instagram Share Button */}
                                    <Tooltip title="Share on Instagram">
                                        <IconButton
                                            onClick={() => handleShareSocial("instagram")}
                                            size="medium"
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                p: 1,
                                                background: "linear-gradient(45deg, #fd5949, #d6249f, #285AEB)",
                                                color: "white",
                                                "&:hover": { opacity: 0.95 },
                                            }}
                                        >
                                            <SendIcon sx={{ fontSize: "1.25rem" }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Direct Message Button */}
                                    <Tooltip title="Share via Direct Message">
                                        <IconButton
                                            onClick={() => handleShareSocial("dm")}
                                            size="medium"
                                            sx={{
                                                color: "#9CA3AF",
                                                backgroundColor: "rgba(156, 163, 175, 0.08)",
                                                width: 48,
                                                height: 48,
                                                p: 1,
                                                "&:hover": { backgroundColor: "rgba(156, 163, 175, 0.18)" },
                                            }}
                                        >
                                            <ChatBubbleIcon sx={{ fontSize: "1.25rem" }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Close Button */}
                                    <Divider
                                        orientation="vertical"
                                        flexItem
                                        sx={{ borderColor: "rgba(99, 102, 241, 0.2)", my: 0 }}
                                    />

                                    <IconButton
                                        onClick={handleShareMenuClose}
                                        size="small"
                                        sx={{
                                            color: "#94a3b8",
                                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                                            "&:hover": {
                                                backgroundColor: "rgba(99, 102, 241, 0.2)",
                                            },
                                        }}
                                    >
                                        <CloseIcon sx={{ fontSize: "1rem" }} />
                                    </IconButton>
                                </Menu>
                            </Box>
                        </Card>

                        {/* Preview Video Card */}
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                maxWidth: { xs: 400, md: 420 },
                                aspectRatio: "16 / 9",
                                borderRadius: 3,
                                overflow: "hidden",
                                border: "2px solid rgba(99, 102, 241, 0.3)",
                                boxShadow: "0 12px 40px rgba(99, 102, 241, 0.25)",
                                backgroundColor: "#1a1a1a",
                            }}
                        >
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transform: "scaleX(-1)",
                                    backgroundColor: "#1a1a1a",
                                }}
                            />

                            {/* Preview Controls */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: { xs: 10, sm: 12 },
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    display: "flex",
                                    gap: { xs: 0.75, sm: 1 },
                                    zIndex: 10,
                                }}
                            >
                                <Tooltip title={videoEnabled ? "Turn off camera" : "Turn on camera"}>
                                    <IconButton
                                        onClick={() => toggleMedia("video")}
                                        sx={{
                                            color: "white",
                                            backgroundColor: videoEnabled ? "rgba(99, 102, 241, 0.8)" : "rgba(239, 68, 68, 0.8)",
                                            width: { xs: 40, sm: 44, md: 46 },
                                            height: { xs: 40, sm: 44, md: 46 },
                                            "&:hover": {
                                                backgroundColor: videoEnabled ? "rgba(99, 102, 241, 1)" : "rgba(239, 68, 68, 1)",
                                            },
                                            "& .MuiSvgIcon-root": {
                                                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                                            },
                                        }}
                                    >
                                        {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={audioEnabled ? "Mute microphone" : "Unmute microphone"}>
                                    <IconButton
                                        onClick={() => toggleMedia("audio")}
                                        sx={{
                                            color: "white",
                                            backgroundColor: audioEnabled ? "rgba(99, 102, 241, 0.8)" : "rgba(239, 68, 68, 0.8)",
                                            width: { xs: 40, sm: 44, md: 46 },
                                            height: { xs: 40, sm: 44, md: 46 },
                                            "&:hover": {
                                                backgroundColor: audioEnabled ? "rgba(99, 102, 241, 1)" : "rgba(239, 68, 68, 1)",
                                            },
                                            "& .MuiSvgIcon-root": {
                                                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                                            },
                                        }}
                                    >
                                        {audioEnabled ? <MicIcon /> : <MicOffIcon />}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            ) : (
                <Box
                    className={styles.meetRoot}
                    sx={{
                        position: "relative",
                        width: "100%",
                        height: "100dvh",
                        minHeight: "100dvh",
                        maxHeight: "100dvh",
                        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1f2937 100%)",
                        overflow: "hidden",
                    }}
                >
                    {/*  VIDEO CANVAS  */}
                    <div className={styles.videoCanvas}>
                        <div
                            className={`${styles.videoGrid} ${layoutCount === 1
                                ? styles.one
                                : layoutCount === 2
                                    ? styles.two
                                    : layoutCount <= 4
                                        ? styles.four
                                        : styles.many
                                }`}
                        >
                            {videos.map(v => (
                                <VideoTile
                                    key={v.socketId}
                                    stream={v.stream}
                                    user={participants[v.socketId] || { id: v.socketId, username: "", displayName: "Participant" }}
                                    isHost={isHost}
                                    onKick={handleKickParticipant}
                                    onBlock={handleBlockParticipant}
                                />
                            ))}
                            {/* {videos.map(v => (
                                <div key={v.socketId} className={styles.videoTile}>
                                    <video
                                        autoPlay
                                        playsInline
                                        ref={el => el && (el.srcObject = v.stream)}
                                    />
                                </div>
                            ))} */}
                        </div>
                    </div>

                    {/*  LOCAL SELF VIDEO  */}
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={styles.selfVideo}
                    />

                    <Box
                        sx={{
                            position: "absolute",
                            right: { xs: 10, sm: 12, md: 20 },
                            bottom: {
                                xs: "calc(env(safe-area-inset-bottom, 0px) + 74px)",
                                sm: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
                                md: 56
                            },
                            top: { xs: "auto", md: "auto" },
                            zIndex: 12,
                            px: { xs: 1.1, md: 1.5 },
                            py: { xs: 0.5, md: 0.75 },
                            borderRadius: "999px",
                            background: "rgba(15, 23, 42, 0.78)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(99, 102, 241, 0.18)",
                            color: "#f8fafc",
                            fontSize: { xs: "0.68rem", sm: "0.74rem", md: "0.82rem" },
                            fontWeight: 600,
                            maxWidth: { xs: 156, sm: 152, md: "unset" },
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <span className={styles.onlineDot} /> {participantBadgeCount} participant{participantBadgeCount === 1 ? "" : "s"} active
                    </Box>

                    {joinNotice && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 20,
                                left: "50%",
                                transform: "translateX(-50%)",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 2,
                                py: 1.1,
                                borderRadius: 999,
                                background: "rgba(15, 23, 42, 0.88)",
                                backdropFilter: "blur(14px)",
                                border: "1px solid rgba(99, 102, 241, 0.2)",
                                color: "#f8fafc",
                                zIndex: 22,
                                maxWidth: "min(560px, calc(100vw - 32px))",
                                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.28)",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "0.92rem",
                                    fontWeight: 600,
                                    textAlign: "center",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {joinNotice}
                            </Typography>
                            <IconButton
                                onClick={() => setJoinNotice(null)}
                                sx={{
                                    color: "#cbd5e1",
                                    p: 0.5,
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}

                    {/*  CONTROLS  */}
                    <Box
                        className={styles.meetingControlBar}
                        sx={{
                            position: "absolute",
                            bottom: {
                                xs: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
                                sm: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
                                md: 30
                            },
                            left: { xs: 10, sm: "50%" },
                            right: { xs: 10, sm: "auto" },
                            transform: { xs: "none", sm: "translateX(-50%)" },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: { xs: 1, sm: 1.15, md: 2 },
                            rowGap: { xs: 1, sm: 1.15, md: 2 },
                            flexWrap: { xs: "wrap", md: "nowrap" },
                            zIndex: 20,
                            background: "rgba(15, 23, 42, 0.8)",
                            backdropFilter: "blur(12px)",
                            borderRadius: { xs: 2.5, md: 3 },
                            padding: { xs: 1, sm: 1.25, md: 2 },
                            width: { xs: "auto", sm: "calc(100vw - 24px)", md: "auto" },
                            maxWidth: { xs: 340, sm: 420, md: "calc(100vw - 24px)" },
                            boxSizing: "border-box",
                            border: "1px solid rgba(99, 102, 241, 0.2)",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        <ControlGuard isLocked={videoLocked} isHost={isHost}>
                            <Tooltip title={videoLocked && !isHost ? "Camera disabled by host" : videoEnabled ? "Turn off camera" : "Turn on camera"}>
                                <IconButton
                                    onClick={() => toggleMedia("video")}
                                    disabled={videoLocked && !isHost}
                                    sx={controlButtonSx(videoEnabled ? "rgba(99, 102, 241, 0.9)" : "rgba(239, 68, 68, 0.9)")}
                                >
                                    {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                                </IconButton>
                            </Tooltip>
                        </ControlGuard>

                        <Tooltip title="End call">
                            <IconButton
                                onClick={() => handleEndCall({ navigateOnly: true })}
                                sx={controlButtonSx("rgba(239, 68, 68, 0.9)")}
                            >
                                <CallEndIcon />
                            </IconButton>
                        </Tooltip>

                        <ControlGuard isLocked={audioLocked} isHost={isHost}>
                            <Tooltip title={audioLocked && !isHost ? "Microphone disabled by host" : audioEnabled ? "Mute microphone" : "Unmute microphone"}>
                                <IconButton
                                    onClick={() => toggleMedia("audio")}
                                    disabled={audioLocked && !isHost}
                                    sx={controlButtonSx(audioEnabled ? "rgba(99, 102, 241, 0.9)" : "rgba(239, 68, 68, 0.9)")}
                                >
                                    {audioEnabled ? <MicIcon /> : <MicOffIcon />}
                                </IconButton>
                            </Tooltip>
                        </ControlGuard>

                        <ControlGuard isLocked={videoLocked} isHost={isHost}>
                            <Tooltip title={videoLocked && !isHost ? "Screen sharing disabled by host" : isScreenSharing ? "Stop sharing" : "Share screen"}>
                                <IconButton
                                    onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                                    disabled={videoLocked && !isHost}
                                    sx={controlButtonSx(isScreenSharing ? "rgba(34, 197, 94, 0.9)" : "rgba(99, 102, 241, 0.9)")}
                                >
                                    {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                                </IconButton>
                            </Tooltip>
                        </ControlGuard>

                        <Badge badgeContent={newMessages} max={999} color='primary'>
                            <Tooltip title={chatLocked && !isHost ? "Open chat (sending disabled by host)" : "Open chat"}>
                                <IconButton
                                    onClick={handleToggleChat}
                                    sx={controlButtonSx(showModal ? "rgba(139, 92, 246, 0.9)" : "rgba(99, 102, 241, 0.9)")}
                                >
                                    <ChatIcon />
                                </IconButton>
                            </Tooltip>
                        </Badge>

                        <HostControls
                            isHost={isHost}
                            meetingLocked={meetingLocked}
                            audioLocked={audioLocked}
                            videoLocked={videoLocked}
                            chatEnabled={chatEnabled}
                            fileSendingEnabled={fileSendingEnabled}
                            disabled={!socketRef.current}
                            actionButtonSx={controlButtonSx("rgba(99, 102, 241, 0.9)")}
                            dangerButtonSx={hostDangerButtonSx}
                            onToggleMeetingLock={handleToggleMeetingLock}
                            onToggleParticipantAudio={handleToggleParticipantAudio}
                            onToggleParticipantVideo={handleToggleParticipantVideo}
                            onToggleChat={handleToggleParticipantChat}
                            onToggleFileSending={handleToggleFileSending}
                            onEndMeetingForAll={handleEndCall}
                        />
                    </Box>

                    {/* CHAT ROOM */}
                    {showModal && (
                        <ChatPanel
                            socket={socketRef.current}
                            displayName={displayName}
                            currentUsername={currentUsername}
                            chatLocked={chatLocked}
                            fileLocked={chatLocked || fileLocked}
                            isHost={isHost}
                            participantCount={totalParticipantCount}
                        />
                    )}

                    <Snackbar
                        open={toast.open}
                        autoHideDuration={toast.severity === "error" ? 4000 : 2600}
                        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Alert
                            severity={toast.severity}
                            variant="filled"
                            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                            sx={{
                                width: "100%",
                                ...(toast.severity === "error" && {
                                    backgroundColor: "#dc2626",
                                    color: "#fff"
                                })
                            }}
                        >
                            {toast.message}
                        </Alert>
                    </Snackbar>
                </Box>
            )}

            <Snackbar
                open={toast.open}
                autoHideDuration={toast.severity === "error" ? 4000 : 2600}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={toast.severity}
                    variant="filled"
                    onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                    sx={{
                        width: "100%",
                        ...(toast.severity === "error" && {
                            backgroundColor: "#dc2626",
                            color: "#fff"
                        })
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
