import React, { useState } from "react";
import { Users, UserPlus, Check, X, MessageSquare, Trash2, Search, Sparkles } from "lucide-react";
import Avatar from "../common/Avatar";
import { useSocket } from "../../context/SocketContext";

export default function FriendsView({
  friends = [],
  requests = [],
  sentRequests = [],
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  onRemoveFriend,
  onSendFriendRequest,
  onStartDM,
}) {
  const [activeTab, setActiveTab] = useState("online");
  const [searchQuery, setSearchQuery] = useState("");
  const [friendEmailInput, setFriendEmailInput] = useState("");
  const [feedback, setFeedback] = useState({ message: "", error: false });

  const { userStatuses } = useSocket();

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!friendEmailInput.trim()) return;

    const res = await onSendFriendRequest(friendEmailInput.trim());
    if (res.success) {
      setFeedback({ message: res.message || "Friend request sent successfully!", error: false });
      setFriendEmailInput("");
    } else {
      setFeedback({ message: res.message || "Failed to send friend request", error: true });
    }
  };

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch =
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase());

    const liveStatus = userStatuses[friend._id] || friend.status || "offline";
    if (activeTab === "online") {
      return matchesSearch && liveStatus !== "offline";
    }
    return matchesSearch;
  });

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: "var(--bg-chat)" }}
    >
      {/* ===== TOP BAR ===== */}
      <div
        className="h-14 border-b px-6 flex items-center gap-4 shadow-xs"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-chat)",
        }}
      >
        <div
          className="flex items-center gap-2.5 font-bold border-r pr-4"
          style={{
            color: "var(--text-primary)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <Users size={20} className="text-indigo-400" />
          <span>Friends</span>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-2 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("online")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === "online"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "hover:bg-white/5"
            }`}
            style={{
              color: activeTab === "online" ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            Online
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "hover:bg-white/5"
            }`}
            style={{
              color: activeTab === "all" ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            All
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === "pending"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "hover:bg-white/5"
            }`}
            style={{
              color: activeTab === "pending" ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            <span>Pending</span>
            {requests.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer shadow-md ${
              activeTab === "add"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white"
            }`}
          >
            <UserPlus size={16} />
            <span>Add Friend</span>
          </button>
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* ADD FRIEND TAB */}
        {activeTab === "add" && (
          <div className="max-w-xl">
            <h2 className="text-lg font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
              Add a Friend
            </h2>
            <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
              You can connect with anyone on Chatty by entering their registered email address.
            </p>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div
                className="flex items-center p-3 rounded-2xl border shadow-sm transition focus-within:ring-2 focus-within:ring-indigo-500"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="friend@example.com"
                  value={friendEmailInput}
                  onChange={(e) => setFriendEmailInput(e.target.value)}
                  className="flex-1 bg-transparent px-2 text-sm outline-none font-medium"
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Send Friend Request
                </button>
              </div>

              {feedback.message && (
                <div
                  className={`text-xs p-3.5 rounded-xl border ${
                    feedback.error
                      ? "bg-rose-500/10 border-rose-500 text-rose-400"
                      : "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  }`}
                >
                  {feedback.message}
                </div>
              )}
            </form>
          </div>
        )}

        {/* PENDING TAB */}
        {activeTab === "pending" && (
          <div className="space-y-8 max-w-2xl">
            {/* Incoming */}
            <div>
              <div className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Incoming Requests — {requests.length}
              </div>

              {requests.length === 0 ? (
                <div className="text-xs italic opacity-60" style={{ color: "var(--text-muted)" }}>
                  No pending incoming friend requests.
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border shadow-sm transition hover:scale-[1.01]"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--border-subtle)",
                      }}
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar src={req.avatar} name={req.username} size="md" />
                        <div>
                          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            {req.username}
                          </div>
                          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {req.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAcceptRequest(req.email)}
                          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer shadow-md"
                          title="Accept Request"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => onRejectRequest(req.email)}
                          className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition cursor-pointer shadow-md"
                          title="Reject Request"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent */}
            {sentRequests.length > 0 && (
              <div>
                <div className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                  Outgoing Sent Requests — {sentRequests.length}
                </div>
                <div className="space-y-2">
                  {sentRequests.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--border-subtle)",
                      }}
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar src={req.avatar} name={req.username} size="md" />
                        <div>
                          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            {req.username}
                          </div>
                          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Sent to {req.email}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onCancelRequest(req.email)}
                        className="px-3.5 py-1.5 border hover:bg-rose-500/10 hover:border-rose-500 hover:text-rose-400 rounded-xl text-xs font-semibold transition cursor-pointer"
                        style={{
                          borderColor: "var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Cancel Request
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ONLINE & ALL FRIENDS TAB */}
        {(activeTab === "online" || activeTab === "all") && (
          <div className="max-w-3xl">
            {/* Search Input */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none border transition"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
              <Search size={18} className="absolute left-3.5 top-3.5 opacity-50" style={{ color: "var(--text-muted)" }} />
            </div>

            <div className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              {activeTab === "online" ? "Online Friends" : "All Friends"} — {filteredFriends.length}
            </div>

            {filteredFriends.length === 0 ? (
              <div className="text-center py-16 opacity-50" style={{ color: "var(--text-muted)" }}>
                <Users size={48} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">
                  {searchQuery
                    ? "No friends match your search."
                    : activeTab === "online"
                    ? "No friends are currently online."
                    : "No friends added yet. Click Add Friend above to start!"}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredFriends.map((friend) => {
                  const liveStatus = userStatuses[friend._id] || friend.status || "offline";

                  return (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between p-3 rounded-2xl border transition group hover:scale-[1.01]"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--border-subtle)",
                      }}
                    >
                      <div
                        onClick={() => onStartDM(friend)}
                        className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                      >
                        <Avatar
                          src={friend.avatar}
                          name={friend.username}
                          status={liveStatus}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                              {friend.username}
                            </span>
                            <span className="text-xs opacity-60 truncate" style={{ color: "var(--text-muted)" }}>
                              #{friend.email.split("@")[0]}
                            </span>
                          </div>
                          <div className="text-xs truncate font-medium" style={{ color: "var(--text-secondary)" }}>
                            {friend.customStatus || (liveStatus === "offline" ? "Offline" : "Active Now")}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onStartDM(friend)}
                          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition cursor-pointer shadow-md"
                          title="Message"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to unfriend ${friend.username}?`)) {
                              onRemoveFriend(friend.email);
                            }
                          }}
                          className="p-2.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Remove Friend"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
