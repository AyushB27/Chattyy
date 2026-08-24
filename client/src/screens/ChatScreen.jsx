import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";

// Layout components
import ServerRail from "../components/layout/ServerRail";
import Sidebar from "../components/layout/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import MemberList from "../components/chat/MemberList";
import FriendsView from "../components/chat/FriendsView";

// Modals
import CreateServerModal from "../components/modals/CreateServerModal";
import JoinServerModal from "../components/modals/JoinServerModal";
import CreateChannelModal from "../components/modals/CreateChannelModal";
import InviteModal from "../components/modals/InviteModal";
import UserSettingsModal from "../components/modals/UserSettingsModal";
import UserPopoutCard from "../components/modals/UserPopoutCard";

export default function ChatScreen() {
  const { user } = useAuth();
  const { socket } = useSocket();

  // Navigation & Active View State
  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [isDMsActive, setIsDMsActive] = useState(true);
  const [isFriendsTabActive, setIsFriendsTabActive] = useState(true);
  const [activeFriend, setActiveFriend] = useState(null);

  // Data State
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isMemberListOpen, setIsMemberListOpen] = useState(true);

  // Modal State
  const [createServerOpen, setCreateServerOpen] = useState(false);
  const [joinServerOpen, setJoinServerOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [popoutUser, setPopoutUser] = useState(null);

  /* ================= FETCH INITIAL DATA ================= */
  const fetchServers = useCallback(async () => {
    try {
      const res = await api.get("/api/servers");
      setServers(res.data || []);
    } catch (err) {
      console.error("Error fetching servers:", err);
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    try {
      const res = await api.get("/api/friends/list");
      setFriends(res.data.friends || []);
      setRequests(res.data.requests || []);
      setSentRequests(res.data.sentRequests || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/api/messages/conversations");
      setConversations(res.data || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  }, []);

  useEffect(() => {
    fetchServers();
    fetchFriends();
    fetchConversations();
  }, [fetchServers, fetchFriends, fetchConversations]);

  /* ================= FETCH MESSAGES ================= */
  useEffect(() => {
    if (isDMsActive) {
      if (activeFriend) {
        const fetchDMMessages = async () => {
          try {
            const res = await api
              .get(`/api/messages/dm/${activeFriend._id}`)
              .catch(() => api.get(`/api/messages/${activeFriend.email}`));
            setMessages(res.data || []);
          } catch (err) {
            console.error("Error fetching DM messages:", err);
          }
        };
        fetchDMMessages();
      } else {
        setMessages([]);
      }
    } else if (activeChannel && activeChannel.type !== "voice") {
      const fetchChannelMessages = async () => {
        try {
          const res = await api.get(`/api/messages/channel/${activeChannel._id}`);
          setMessages(res.data || []);
        } catch (err) {
          console.error("Error fetching channel messages:", err);
        }
      };
      fetchChannelMessages();
    }
  }, [isDMsActive, activeFriend, activeChannel]);

  /* ================= REAL-TIME SOCKET LISTENERS ================= */
  useEffect(() => {
    if (!socket) return;

    if (activeChannel && !isDMsActive) {
      socket.emit("join-channel", activeChannel._id);
    }

    const onReceiveChannelMessage = (msg) => {
      if (activeChannel && msg.channelId === activeChannel._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id && m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const onReceiveDirectMessage = (msg) => {
      // Refresh conversations list in background
      fetchConversations();

      const senderId = msg.senderId?._id || msg.senderId;
      const receiverId = msg.receiverId?._id || msg.receiverId;

      if (
        isDMsActive &&
        activeFriend &&
        (senderId?.toString() === activeFriend._id?.toString() ||
          receiverId?.toString() === activeFriend._id?.toString())
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id && m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const onMessageUpdated = ({ messageId, text, isEdited }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, messageContent: text, text, isEdited: isEdited ?? true }
            : m
        )
      );
    };

    const onMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const onReactionUpdated = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    socket.on("receive-channel-message", onReceiveChannelMessage);
    socket.on("receive-direct-message", onReceiveDirectMessage);
    socket.on("message:updated", onMessageUpdated);
    socket.on("message:deleted", onMessageDeleted);
    socket.on("message:reaction_updated", onReactionUpdated);

    return () => {
      if (activeChannel && !isDMsActive) {
        socket.emit("leave-channel", activeChannel._id);
      }
      socket.off("receive-channel-message", onReceiveChannelMessage);
      socket.off("receive-direct-message", onReceiveDirectMessage);
      socket.off("message:updated", onMessageUpdated);
      socket.off("message:deleted", onMessageDeleted);
      socket.off("message:reaction_updated", onReactionUpdated);
    };
  }, [socket, activeChannel, activeFriend, isDMsActive, fetchConversations]);

  /* ================= ACTIONS ================= */
  const handleSelectServer = (server) => {
    setIsDMsActive(false);
    setActiveServer(server);
    setActiveFriend(null);

    const firstTextChannel =
      server.channels?.find((c) => c.type !== "voice") || server.channels?.[0];
    setActiveChannel(firstTextChannel || null);
  };

  const handleSelectDMs = () => {
    setIsDMsActive(true);
    setActiveServer(null);
    setActiveChannel(null);
    setIsFriendsTabActive(true);
  };

  const handleSelectFriend = (targetUser) => {
    setIsDMsActive(true);
    setIsFriendsTabActive(false);
    setActiveFriend(targetUser);

    // Add to conversations list immediately if not present
    setConversations((prev) => {
      if (prev.some((c) => c.user?._id === targetUser._id)) return prev;
      return [{ user: targetUser, lastMessage: { text: "" } }, ...prev];
    });
  };

  const handleSendMessage = ({ text, replyTo, attachments }) => {
    if (!text && (!attachments || attachments.length === 0)) return;

    if (isDMsActive && activeFriend) {
      socket.emit("send-direct-message", {
        toUserId: activeFriend._id,
        toEmail: activeFriend.email,
        text,
        replyTo,
        attachments,
        sender: user,
      });

      // Update conversations list preview
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.user?._id !== activeFriend._id);
        return [
          { user: activeFriend, lastMessage: { text, timestamp: new Date() } },
          ...filtered,
        ];
      });
    } else if (activeChannel) {
      socket.emit("send-channel-message", {
        channelId: activeChannel._id,
        text,
        replyTo,
        attachments,
        sender: user,
      });
    }
  };

  const handleEditMessage = async (messageId, newText) => {
    try {
      await api.patch(`/api/messages/${messageId}`, { text: newText });
      socket.emit("message:edit", {
        messageId,
        channelId: activeChannel?._id,
        toUserId: activeFriend?._id,
        text: newText,
      });
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/api/messages/${messageId}`);
      socket.emit("message:delete", {
        messageId,
        channelId: activeChannel?._id,
        toUserId: activeFriend?._id,
      });
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleReactMessage = async (messageId, emoji) => {
    try {
      const res = await api.post(`/api/messages/${messageId}/reaction`, { emoji });
      socket.emit("message:react", {
        messageDoc: res.data.messageDoc,
        channelId: activeChannel?._id,
        toUserId: activeFriend?._id,
      });
    } catch (err) {
      console.error("Error reacting to message:", err);
    }
  };

  /* Friend Actions */
  const handleSendFriendRequest = async (email) => {
    try {
      const res = await api.post("/api/friends/add", { to: email });
      fetchFriends();
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send request",
      };
    }
  };

  const handleAcceptRequest = async (fromEmail) => {
    try {
      await api.post("/api/friends/accept", { from: fromEmail });
      fetchFriends();
      fetchConversations();
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleRejectRequest = async (fromEmail) => {
    try {
      await api.post("/api/friends/reject", { from: fromEmail });
      fetchFriends();
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const handleCancelRequest = async (toEmail) => {
    try {
      await api.post("/api/friends/cancel", { to: toEmail });
      fetchFriends();
    } catch (err) {
      console.error("Error cancelling request:", err);
    }
  };

  const handleRemoveFriend = async (friendEmail) => {
    try {
      await api.post("/api/friends/remove", { email: friendEmail });
      if (activeFriend?.email === friendEmail) {
        setActiveFriend(null);
        setIsFriendsTabActive(true);
      }
      fetchFriends();
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  const handleLeaveOrDeleteServer = async (server) => {
    const isOwner = server.ownerId === user?._id;
    const confirmMsg = isOwner
      ? `Are you sure you want to delete ${server.name}? This cannot be undone.`
      : `Are you sure you want to leave ${server.name}?`;

    if (window.confirm(confirmMsg)) {
      try {
        await api.delete(`/api/servers/${server._id}`);
        fetchServers();
        handleSelectDMs();
      } catch (err) {
        console.error("Error leaving/deleting server:", err);
      }
    }
  };

  const isOwnerOrAdmin = activeServer?.ownerId === user?._id;

  return (
    <div
      className="h-screen w-screen flex overflow-hidden font-sans select-none"
      style={{ backgroundColor: "var(--bg-rail)" }}
    >
      {/* 1. Left Server Rail */}
      <ServerRail
        servers={servers}
        activeServer={activeServer}
        onSelectServer={handleSelectServer}
        onSelectDMs={handleSelectDMs}
        isDMsActive={isDMsActive}
        onOpenCreateServer={() => setCreateServerOpen(true)}
        onOpenJoinServer={() => setJoinServerOpen(true)}
        unreadCount={requests.length}
      />

      {/* 2. Sub-Sidebar (Channels or DMs) */}
      <Sidebar
        isDMsActive={isDMsActive}
        activeServer={activeServer}
        activeChannel={activeChannel}
        onSelectChannel={(ch) => setActiveChannel(ch)}
        friends={friends}
        conversations={conversations}
        requestsCount={requests.length}
        activeFriend={activeFriend}
        onSelectFriend={handleSelectFriend}
        onSelectFriendsTab={() => {
          setIsFriendsTabActive(true);
          setActiveFriend(null);
        }}
        isFriendsTabActive={isFriendsTabActive}
        onOpenCreateChannel={() => setCreateChannelOpen(true)}
        onOpenInviteModal={() => setInviteModalOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onLeaveOrDeleteServer={handleLeaveOrDeleteServer}
      />

      {/* 3. Main Content Area */}
      {isDMsActive && isFriendsTabActive && !activeFriend ? (
        <FriendsView
          friends={friends}
          requests={requests}
          sentRequests={sentRequests}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onCancelRequest={handleCancelRequest}
          onRemoveFriend={handleRemoveFriend}
          onSendFriendRequest={handleSendFriendRequest}
          onStartDM={handleSelectFriend}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <ChatArea
            isDM={isDMsActive}
            channel={activeChannel}
            friend={activeFriend}
            messages={messages}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onReactMessage={handleReactMessage}
            onUserClick={(clickedUser, role) =>
              setPopoutUser({ user: clickedUser, role })
            }
            isMemberListOpen={isMemberListOpen}
            onToggleMemberList={() => setIsMemberListOpen(!isMemberListOpen)}
            canDelete={isOwnerOrAdmin}
          />

          {/* 4. Server Member List */}
          {!isDMsActive && isMemberListOpen && activeServer && (
            <MemberList
              members={activeServer.members || []}
              ownerId={activeServer.ownerId}
              onMemberClick={(clickedUser, role) =>
                setPopoutUser({ user: clickedUser, role })
              }
            />
          )}
        </div>
      )}

      {/* ===== MODALS ===== */}
      <CreateServerModal
        isOpen={createServerOpen}
        onClose={() => setCreateServerOpen(false)}
        onServerCreated={(newServer) => {
          fetchServers();
          handleSelectServer(newServer);
        }}
      />

      <JoinServerModal
        isOpen={joinServerOpen}
        onClose={() => setJoinServerOpen(false)}
        onServerJoined={(joinedServer) => {
          fetchServers();
          handleSelectServer(joinedServer);
        }}
      />

      <CreateChannelModal
        isOpen={createChannelOpen}
        onClose={() => setCreateChannelOpen(false)}
        serverId={activeServer?._id}
        onChannelCreated={async (newChannel) => {
          await fetchServers();
          setActiveServer((prev) => ({
            ...prev,
            channels: [...(prev.channels || []), newChannel],
          }));
          if (newChannel.type !== "voice") {
            setActiveChannel(newChannel);
          }
        }}
      />

      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        server={activeServer}
      />

      <UserSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <UserPopoutCard
        user={popoutUser?.user}
        role={popoutUser?.role}
        onClose={() => setPopoutUser(null)}
        onDirectMessage={(targetUser) => {
          handleSelectFriend(targetUser);
        }}
      />
    </div>
  );
}