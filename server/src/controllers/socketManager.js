import { Server } from "socket.io";
import { Meeting } from "../models/meeting.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: new URL('../../.env', import.meta.url) });

let connections = {};
let messages = {};
let timeOnLine = {};
let participantMeta = {};
let roomUserSockets = {};
let activeMeetingByUsername = {};

const getRoomSocketsForUsername = (roomId, username) => {
    const socketIds = roomUserSockets[roomId]?.[username];
    return Array.isArray(socketIds) ? socketIds : [];
};

const buildDisplayName = (socket, incomingDisplayName) => {
    if (incomingDisplayName?.trim()) {
        return incomingDisplayName.trim();
    }

    if (socket.user?.isGuest) {
        return socket.user?.username || "Guest";
    }

    if (socket.user?.name && socket.user?.username) {
        return `${socket.user.name} (@${socket.user.username})`;
    }

    return socket.user?.username || "Participant";
};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: `${process.env.CLIENT_URL}`,
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });
    
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      console.log("Incoming Token : ",token);
      // next();
      if (!token) {return next(new Error("No token"));}

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log("user : ", user);
        socket.user = user;
        next();
      } catch {
        next(new Error("Invalid token"));
      }
    });

    io.on("connection", (socket) => {

        console.log("CLIENT CONNECTED:", socket.id);

        socket.on("join-call", async ({ roomId, displayName }, callback) => {
            
            socket.roomId = roomId;
            
            console.log("Room ID : ", roomId);

            const meeting = await Meeting.findOne({ meetingCode: roomId });

            if (!meeting || !meeting.isActive) {
                return callback({ success: false, message: "Meeting expired" });
            }

            const username = socket.user.username; 

            const alreadyExists = meeting.participants.find(
              (p) => p.username === username && !p.leftAt
            );

            const isHost = socket.user?.username === meeting.host;

            if (meeting.controls?.meetingLocked && !isHost) {
              return callback({ success: false, message: "Meeting is locked" });
            }
        
            if (!alreadyExists) {
                meeting.participants.push({
                    username,
                    joinedAt: new Date(),
                });
            
                await meeting.save();

            }else if(meeting.blockedUsers?.includes(username)){
                return callback({ success: false, message: "You are blocked" });
            }

            if (!connections[roomId]) {
                connections[roomId] = [];
            }

            if (!participantMeta[roomId]) {
                participantMeta[roomId] = {};
            }

            if (!roomUserSockets[roomId]) {
                roomUserSockets[roomId] = {};
            }

            const activeSocketIds = getRoomSocketsForUsername(roomId, username).filter(
                (socketId) => io.sockets.sockets.has(socketId)
            );

            roomUserSockets[roomId][username] = activeSocketIds;

            if (activeSocketIds.length > 0) {
                return callback({
                    success: false,
                    message: "You are already in this meeting from another tab or window",
                });
            }

            const activeMeetingCode = activeMeetingByUsername[username];

            if (activeMeetingCode && activeMeetingCode !== roomId) {
                return callback({
                    success: false,
                    message: "You are already in another active meeting",
                });
            }

            const clients = [...connections[roomId]]; // existing users

            socket.join(roomId);
            socket.displayName = buildDisplayName(socket, displayName);
            connections[roomId].push(socket.id);
            roomUserSockets[roomId][username] = [socket.id];
            activeMeetingByUsername[username] = roomId;
            participantMeta[roomId][socket.id] = {
                displayName: socket.displayName,
                username,
            };
            timeOnLine[socket.id] = new Date();

            callback({ success: true });

            // notify existing users
            clients.forEach((clientId) => {
                io.to(clientId).emit("user-joined", {
                    id: socket.id,
                    displayName: socket.displayName,
                });
            });

            // notify joiner with existing users
            io.to(socket.id).emit(
                "user-joined",
                {
                    id: socket.id,
                    displayName: socket.displayName,
                },
                clients.map((clientId) => ({
                    id: clientId,
                    displayName: participantMeta[roomId]?.[clientId]?.displayName || "Participant",
                    username: participantMeta[roomId]?.[clientId]?.username || "",
                }))
            );

            // send old messages
            if (messages[roomId]) {
                messages[roomId].forEach((msg) => {
                    io.to(socket.id).emit("chat-message", {
                        id: msg.id,
                        type: msg.type,
                        data: msg.data,
                        sender: msg.sender,
                        senderUsername: msg.senderUsername || "",
                        senderId: msg.senderId,
                        time: msg.time,
                        createdAt: msg.createdAt,
                        file: msg.file || null
                    });
                });
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", async (msg) => {

            console.log("CHAT EVENT HIT");

            const {
                id,
                type = "text",
                data,
                sender,
                senderUsername,
                senderId,
                time,
                createdAt,
                file
            } = msg;

            const roomId = socket.roomId;

            console.log("Room ID : ", roomId);

            const meeting = await Meeting.findOne({ meetingCode: roomId });

            if (meeting.controls?.chatLocked && socket.user?.username !== meeting.host) {
              return;
            }

            if (type === "file" && meeting.controls?.fileLocked && socket.user?.username !== meeting.host) {
              return;
            }

            if (!messages[roomId]) {
                    messages[roomId] = [];
            }
            
            messages[roomId].push({
                id: id || Date.now(),
                type,
                sender,
                senderUsername: senderUsername || socket.user?.username || "",
                data,
                senderId,
                time,
                createdAt: createdAt || new Date().toISOString(),
                file: file || null
            });

            io.to(roomId).emit("chat-message", msg);

        });

        socket.on("disconnect", async() => {

            var diffTime = Math.abs(timeOnLine[socket.id] - new Date());
            
            await Meeting.updateOne(
                {
                  "meetingCode" : socket.roomId,
                  "participants.username": socket.user?.username
                },
                {
                  $set: {
                    "participants.$.leftAt": new Date()
                  }
                }
            );

            for (const roomId in connections) {
              if (connections[roomId].includes(socket.id)) {
            
                connections[roomId] = connections[roomId].filter(id => id !== socket.id);
                delete participantMeta[roomId]?.[socket.id];
                if (socket.user?.username && roomUserSockets[roomId]?.[socket.user.username]) {
                  roomUserSockets[roomId][socket.user.username] =
                    roomUserSockets[roomId][socket.user.username].filter((id) => id !== socket.id);

                  if (roomUserSockets[roomId][socket.user.username].length === 0) {
                    delete roomUserSockets[roomId][socket.user.username];
                    if (activeMeetingByUsername[socket.user.username] === roomId) {
                      delete activeMeetingByUsername[socket.user.username];
                    }
                  }
                }
            
                socket.to(roomId).emit("user-left", socket.id);
            
                if (connections[roomId].length === 0) {
                  delete connections[roomId];
                  delete participantMeta[roomId];
                  delete roomUserSockets[roomId];
                }
              }
            };

            // var key;

            // for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
            //     for (let a = 0; a < v.length; ++a) {
            //         if (v[a] === socket.id) {

            //             key = k;
            //             for (let a = 0; a < connections[key].length; ++a) {
            //                 io.to(connections[key][a]).emit("user-left", socket.id);
            //             };

            //             var index = connections[key].indexOf(socket.id);
            //             connections[key].splice(index, 1);
            //             if (connections[key].length === 0) {
            //                 delete connections[key];
            //             };
            //         };
            //     };
            // };
        });

        socket.on("end-meeting", async (roomId) => {
          
          const meeting = await Meeting.findOne({ "meetingCode" : roomId });

          if (!meeting) return;

          if (socket.user?.username === meeting.host) {
            meeting.isActive = false;
            await meeting.save();
        
            io.to(roomId).emit("meeting-ended");
          }
        });

        socket.on("lockMeeting", async ({ roomId, locked }) => {
          const meeting = await Meeting.findOne({ meetingCode: roomId });

          if (!meeting || socket.user?.username !== meeting.host) return;

          meeting.controls.meetingLocked = locked;
          await meeting.save();

          io.to(roomId).emit("lockMeeting", { locked });
          io.to(roomId).emit("host-control", { type: "meeting-lock", value: locked });
        });

        socket.on("muteAll", async ({ roomId }) => {
          const meeting = await Meeting.findOne({ meetingCode: roomId });

          if (!meeting || socket.user?.username !== meeting.host) return;

          meeting.controls.audioLocked = true;
          await meeting.save();

          io.to(roomId).emit("muteAll");
          io.to(roomId).emit("host-control", { type: "audio-lock", value: true });
        });

        socket.on("toggleChat", async ({ roomId, enabled }) => {
          const meeting = await Meeting.findOne({ meetingCode: roomId });

          if (!meeting || socket.user?.username !== meeting.host) return;

          meeting.controls.chatLocked = !enabled;
          await meeting.save();

          io.to(roomId).emit("toggleChat", { enabled });
          io.to(roomId).emit("host-control", { type: "chat-lock", value: !enabled });
        });

        socket.on("toggleFiles", async ({ roomId, enabled }) => {
          const meeting = await Meeting.findOne({ meetingCode: roomId });

          if (!meeting || socket.user?.username !== meeting.host) return;

          meeting.controls.fileLocked = !enabled;
          await meeting.save();

          io.to(roomId).emit("toggleFiles", { enabled });
          io.to(roomId).emit("host-control", { type: "file-lock", value: !enabled });
        });

        socket.on("host-control", async ({ roomId, type, value }) => {

          const meeting = await Meeting.findOne({ meetingCode: roomId });

          if (!meeting || socket.user?.username !== meeting.host) return;

          if (type === "meeting-lock") {
            meeting.controls.meetingLocked = value;
          }

          if (type === "audio-lock") {
            meeting.controls.audioLocked = value;
          }
      
          if (type === "video-lock") {
            meeting.controls.videoLocked = value;
          }
      
          if (type === "chat-lock") {
            meeting.controls.chatLocked = value;
          }

          if (type === "file-lock") {
            meeting.controls.fileLocked = value;
          }
      
          if (type === "kick-all") {
            socket.to(roomId).emit("kicked");
          }
      
          await meeting.save();
      
          io.to(roomId).emit("host-control", { type, value });
      
        });

        socket.on("kick-user", async ({ targetId, targetUsername, roomId }) => {
          
          const meeting = await Meeting.findOne({ meetingCode: roomId });

          if (!meeting || socket.user?.username !== meeting.host) return;

          const targetSockets = targetUsername
            ? getRoomSocketsForUsername(roomId, targetUsername)
            : (targetId ? [targetId] : []);

          targetSockets.forEach((socketId) => {
            io.to(socketId).emit("kicked");
          });
        });

        socket.on("block-user", async ({ targetId, targetUsername, roomId }) => {

          const meeting = await Meeting.findOne({ meetingCode: roomId });
          
          if (!meeting || socket.user?.username !== meeting.host) return;

          const resolvedUsername =
            targetUsername || io.sockets.sockets.get(targetId)?.user?.username;

          if (!resolvedUsername) return;

          await Meeting.updateOne(
            { meetingCode: roomId },
            { $addToSet: { blockedUsers: resolvedUsername } }
          );

          getRoomSocketsForUsername(roomId, resolvedUsername).forEach((socketId) => {
            io.to(socketId).emit("blocked");
          });
      
        });

    });

    return io;
};
