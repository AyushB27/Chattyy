import React, { useState } from "react";
import { Users, UserPlus, Check, X, MessageSquare, Trash2, Search } from "lucide-react";
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
      setFeedback({ message: res.message || "Friend request sent!", error: false });
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
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
      style={{ backgroundColor: "var(--bg-chat)" }}
    >
      {/* ===== TOP BAR (48px) ===== */}
      <div
        className="h-12 border-b px-4 flex items-center gap-4 shadow-xs"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-chat)",
        }}
      >
        <div className="flex items-center gap-2 font-semibold text-sm text-[#f2f3f5] border-r border-[#3f4147] pr-4">
          <Users size={20} className="text-[#80848e]" />
          <span>Friends</span>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab("online")}
            className={`px-2 py-1 rounded transition cursor-pointer ${
              activeTab === "online"
                ? "bg-[#404249] text-white"
                : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
            }`}
          >
            Online
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-2 py-1 rounded transition cursor-pointer ${
              activeTab === "all"
                ? "bg-[#404249] text-white"
                : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition cursor-pointer ${
              activeTab === "pending"
                ? "bg-[#404249] text-white"
                : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
            }`}
          >
            <span>Pending</span>
            {requests.length > 0 && (
              <span className="bg-[#f23f43] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
              activeTab === "add"
                ? "bg-transparent text-[#23a55a] font-semibold"
                : "bg-[#248046] text-white hover:bg-[#1a6334]"
            }`}
          >
            Add Friend
          </button>
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ADD FRIEND TAB */}
        {activeTab === "add" && (
          <div className="max-w-xl">
            <h2 className="text-base font-semibold text-[#f2f3f5] mb-1">
              ADD FRIEND
            </h2>
            <p className="text-xs text-[#949ba4] mb-4">
              You can add friends with their Chatty email address.
            </p>

            <form onSubmit={handleSendRequest} className="space-y-3">
              <div className="flex items-center px-3 py-2 rounded-lg bg-[#1e1f22] border border-[#1f2023] focus-within:border-[#5865f2]">
                <input
                  type="email"
                  required
                  placeholder="Enter an email..."
                  value={friendEmailInput}
                  onChange={(e) => setFriendEmailInput(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#dbdee1] outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-xs font-medium transition cursor-pointer"
                >
                  Send Friend Request
                </button>
              </div>

              {feedback.message && (
                <div
                  className={`text-xs p-2.5 rounded ${
                    feedback.error
                      ? "bg-[#f23f43]/10 border border-[#f23f43]/50 text-[#f23f43]"
                      : "bg-[#23a55a]/10 border border-[#23a55a]/50 text-[#23a55a]"
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
          <div className="space-y-6 max-w-2xl">
            {/* Incoming */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#949ba4] mb-2">
                Incoming Requests — {requests.length}
              </div>

              {requests.length === 0 ? (
                <div className="text-xs text-[#949ba4] italic">
                  There are no pending incoming friend requests.
                </div>
              ) : (
                <div className="divide-y divide-[#35363c]">
                  {requests.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between py-2.5 hover:bg-[#35373c] px-3 rounded transition"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={req.avatar} name={req.username} size="md" />
                        <div>
                          <div className="text-sm font-medium text-[#f2f3f5]">
                            {req.username}
                          </div>
                          <div className="text-xs text-[#949ba4]">{req.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAcceptRequest(req.email)}
                          className="p-2 bg-[#23a55a] hover:bg-[#1a6334] text-white rounded-full transition cursor-pointer"
                          title="Accept"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => onRejectRequest(req.email)}
                          className="p-2 bg-[#f23f43] hover:bg-[#da373c] text-white rounded-full transition cursor-pointer"
                          title="Decline"
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
                <div className="text-xs font-bold uppercase tracking-wider text-[#949ba4] mb-2">
                  Outgoing Requests — {sentRequests.length}
                </div>
                <div className="divide-y divide-[#35363c]">
                  {sentRequests.map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between py-2.5 hover:bg-[#35373c] px-3 rounded transition"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={req.avatar} name={req.username} size="md" />
                        <div>
                          <div className="text-sm font-medium text-[#f2f3f5]">
                            {req.username}
                          </div>
                          <div className="text-xs text-[#949ba4]">
                            Sent to {req.email}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onCancelRequest(req.email)}
                        className="p-2 text-[#949ba4] hover:text-[#f23f43] hover:bg-[#35373c] rounded-full transition cursor-pointer"
                        title="Cancel"
                      >
                        <X size={16} />
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
          <div className="max-w-4xl">
            {/* Search Input */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 rounded bg-[#1e1f22] text-sm text-[#dbdee1] outline-none border border-[#1f2023] focus:border-[#5865f2]"
              />
              <Search size={16} className="absolute right-2.5 top-2.5 text-[#949ba4]" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-[#949ba4] mb-2">
              {activeTab === "online" ? "Online" : "All Friends"} — {filteredFriends.length}
            </div>

            {filteredFriends.length === 0 ? (
              <div className="text-center py-12 text-[#949ba4]">
                <p className="text-sm">
                  {searchQuery
                    ? "No friends match your search."
                    : activeTab === "online"
                    ? "No friends are currently online."
                    : "No friends yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#35363c]">
                {filteredFriends.map((friend) => {
                  const liveStatus = userStatuses[friend._id] || friend.status || "offline";

                  return (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between py-2.5 px-3 hover:bg-[#35373c] rounded transition group"
                    >
                      <div
                        onClick={() => onStartDM(friend)}
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      >
                        <Avatar
                          src={friend.avatar}
                          name={friend.username}
                          status={liveStatus}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-[#f2f3f5] truncate">
                              {friend.username}
                            </span>
                            <span className="text-xs text-[#949ba4] truncate">
                              #{friend.email.split("@")[0]}
                            </span>
                          </div>
                          <div className="text-xs text-[#949ba4] truncate">
                            {friend.customStatus || (liveStatus === "offline" ? "Offline" : "Online")}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onStartDM(friend)}
                          className="p-2 bg-[#2b2d31] hover:bg-[#1e1f22] text-[#b5bac1] hover:text-[#f2f3f5] rounded-full transition cursor-pointer"
                          title="Message"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Unfriend ${friend.username}?`)) {
                              onRemoveFriend(friend.email);
                            }
                          }}
                          className="p-2 bg-[#2b2d31] hover:bg-[#da373c] text-[#b5bac1] hover:text-white rounded-full transition cursor-pointer opacity-0 group-hover:opacity-100"
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
