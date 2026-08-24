import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import socket from "../components/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [userStatuses, setUserStatuses] = useState({}); // userId -> 'online' | 'idle' | 'dnd' | 'offline'
  const [typingMap, setTypingMap] = useState({}); // key (channelId or userId) -> array of usernames

  // Voice & WebRTC state
  const [activeVoiceChannel, setActiveVoiceChannel] = useState(null);
  const [voiceUsers, setVoiceUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // socketId -> RTCPeerConnection

  // Manage socket connection lifecycle based on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit("authenticate", user);
      socket.emit("join", user.email);

      const onConnect = () => {
        setIsConnected(true);
        socket.emit("authenticate", user);
      };

      const onDisconnect = () => {
        setIsConnected(false);
      };

      const onStatusChanged = ({ userId, status }) => {
        if (userId) {
          setUserStatuses((prev) => ({ ...prev, [userId]: status }));
        }
      };

      const onTyping = ({ channelId, toUserId, username, userId }) => {
        const key = channelId || toUserId;
        if (!key || userId === user._id) return;

        setTypingMap((prev) => {
          const list = prev[key] || [];
          if (!list.includes(username)) {
            return { ...prev, [key]: [...list, username] };
          }
          return prev;
        });
      };

      const onStopTyping = ({ channelId, toUserId, userId }) => {
        const key = channelId || toUserId;
        if (!key) return;

        setTypingMap((prev) => {
          const list = prev[key] || [];
          return { ...prev, [key]: list.filter((name) => name !== user.username) };
        });
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("user:status_changed", onStatusChanged);
      socket.on("user:typing", onTyping);
      socket.on("user:stop_typing", onStopTyping);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("user:status_changed", onStatusChanged);
        socket.off("user:typing", onTyping);
        socket.off("user:stop_typing", onStopTyping);
      };
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [isAuthenticated, user, token]);

  /* ================= WebRTC Voice Signaling ================= */
  useEffect(() => {
    if (!socket) return;

    const onVoiceUsersUpdated = (users) => {
      setVoiceUsers(users || []);
    };

    const onVoiceUserJoined = async (newUser) => {
      if (newUser.socketId === socket.id) return;

      // New peer joined, create WebRTC offer
      try {
        const pc = createPeerConnection(newUser.socketId);
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            pc.addTrack(track, localStreamRef.current);
          });
        }
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("voice-signal", {
          toSocketId: newUser.socketId,
          signal: { type: "offer", sdp: offer },
        });
      } catch (err) {
        console.error("Error creating WebRTC offer:", err);
      }
    };

    const onVoiceSignal = async ({ fromSocketId, signal }) => {
      try {
        let pc = peerConnectionsRef.current[fromSocketId];

        if (signal.type === "offer") {
          pc = createPeerConnection(fromSocketId);
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
              pc.addTrack(track, localStreamRef.current);
            });
          }
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("voice-signal", {
            toSocketId: fromSocketId,
            signal: { type: "answer", sdp: answer },
          });
        } else if (signal.type === "answer") {
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          }
        } else if (signal.type === "candidate") {
          if (pc && signal.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.error("Error handling voice signal:", err);
      }
    };

    const onVoiceUserLeft = ({ socketId }) => {
      if (peerConnectionsRef.current[socketId]) {
        peerConnectionsRef.current[socketId].close();
        delete peerConnectionsRef.current[socketId];
      }
    };

    const onVoiceSpeakingUpdate = ({ socketId, isSpeaking }) => {
      setVoiceUsers((prev) =>
        prev.map((u) => (u.socketId === socketId ? { ...u, isSpeaking } : u))
      );
    };

    socket.on("voice-users-updated", onVoiceUsersUpdated);
    socket.on("voice-user-joined", onVoiceUserJoined);
    socket.on("voice-signal", onVoiceSignal);
    socket.on("voice-user-left", onVoiceUserLeft);
    socket.on("voice-speaking-update", onVoiceSpeakingUpdate);

    return () => {
      socket.off("voice-users-updated", onVoiceUsersUpdated);
      socket.off("voice-user-joined", onVoiceUserJoined);
      socket.off("voice-signal", onVoiceSignal);
      socket.off("voice-user-left", onVoiceUserLeft);
      socket.off("voice-speaking-update", onVoiceSpeakingUpdate);
    };
  }, []);

  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("voice-signal", {
          toSocketId: targetSocketId,
          signal: { type: "candidate", candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.play().catch((e) => console.warn("Audio autoplay blocked:", e));
    };

    peerConnectionsRef.current[targetSocketId] = pc;
    return pc;
  };

  const joinVoiceChannel = async (channel) => {
    if (activeVoiceChannel?._id === channel._id) return;

    if (activeVoiceChannel) {
      leaveVoiceChannel();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      localStreamRef.current = stream;

      setActiveVoiceChannel(channel);
      socket.emit("join-voice-channel", {
        channelId: channel._id,
        user,
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setActiveVoiceChannel(channel);
      socket.emit("join-voice-channel", {
        channelId: channel._id,
        user,
      });
    }
  };

  const leaveVoiceChannel = () => {
    if (activeVoiceChannel) {
      socket.emit("leave-voice-channel", { channelId: activeVoiceChannel._id });
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};

    setActiveVoiceChannel(null);
    setVoiceUsers([]);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted((prev) => !prev);
  };

  const toggleDeafen = () => {
    setIsDeafened((prev) => !prev);
  };

  const emitTyping = (key, isChannel = true) => {
    if (isChannel) {
      socket.emit("typing-start", { channelId: key, user });
    } else {
      socket.emit("typing-start", { toUserId: key, user });
    }
  };

  const stopTyping = (key, isChannel = true) => {
    if (isChannel) {
      socket.emit("typing-stop", { channelId: key, user });
    } else {
      socket.emit("typing-stop", { toUserId: key, user });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        userStatuses,
        typingMap,
        activeVoiceChannel,
        voiceUsers,
        isMuted,
        isDeafened,
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        toggleDeafen,
        emitTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
