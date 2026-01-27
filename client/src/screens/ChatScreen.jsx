import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../components/socket";

export default function ChatScreen() {
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const token = localStorage.getItem("token");
  const email = token
    ? JSON.parse(atob(token.split(".")[1])).email
    : null;

  // ===================== FETCH FRIENDS =====================
  const fetchFriends = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/friends/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriends(res.data.friends || []);
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // ===================== SOCKET SETUP =====================
  useEffect(() => {
    if (!email) return;

    socket.connect();
    socket.emit("join", email);

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
      socket.disconnect();
    };
  }, [email]);

  // ===================== FRIEND ACTIONS =====================
  const sendFriendRequest = async () => {
    if (!friendEmail) return;

    try {
      await axios.post(
        "http://localhost:5000/api/friends/add",
        { to: friendEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Friend request sent");
      setFriendEmail("");
      setShowAddFriend(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const acceptRequest = async (from) => {
    try {
      await axios.post(
        "http://localhost:5000/api/friends/accept",
        { from },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriends();
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  // ===================== CHAT =====================
  const sendMessage = () => {
    if (!message || !selectedFriend) return;

    socket.emit("send-message", {
      from: email,
      to: selectedFriend,
      text: message,
    });

    setMessage("");
  };

  // ===================== LOGOUT =====================
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // ===================== FILTERED CHAT =====================
  const chatMessages = messages.filter(
    (m) =>
      (m.from === email && m.to === selectedFriend) ||
      (m.from === selectedFriend && m.to === email)
  );

  return (
    <div className="h-screen flex flex-col bg-[#313338] text-gray-300">

      {/* ===== TOP BAR ===== */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1f2023] bg-[#2b2d31]">
        <button
          onClick={() => setShowAddFriend(!showAddFriend)}
          className="px-3 py-1.5 text-sm rounded bg-indigo-500 text-white"
        >
          Add Friend
        </button>

        <button className="px-3 py-1.5 text-sm rounded bg-[#3f4147]">
          Requests ({requests.length})
        </button>

        <button
          onClick={handleLogout}
          className="ml-auto px-3 py-1.5 text-sm rounded bg-red-500 text-white"
        >
          Logout
        </button>
      </div>

      {/* ===== ADD FRIEND ===== */}
      {showAddFriend && (
        <div className="px-4 py-3 bg-[#2b2d31] border-b border-[#1f2023]">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Friend email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-[#1e1f22] outline-none"
            />
            <button
              onClick={sendFriendRequest}
              className="px-3 py-2 bg-green-500 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ===== REQUESTS ===== */}
      {requests.length > 0 && (
        <div className="px-4 py-3 bg-[#2b2d31] border-b border-[#1f2023]">
          <h3 className="text-xs uppercase text-gray-400 mb-2">
            Friend Requests
          </h3>

          {requests.map((req) => (
            <div key={req} className="flex justify-between mb-2">
              <span>{req}</span>
              <button
                onClick={() => acceptRequest(req)}
                className="text-xs bg-green-500 px-2 py-1 rounded"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ===== MAIN ===== */}
      <div className="flex flex-1">

        {/* FRIEND LIST */}
        <div className="w-1/3 border-r border-[#1f2023] px-4 py-3">
          <h3 className="text-xs uppercase text-gray-400 mb-3">Friends</h3>

          {friends.map((friend) => (
            <div
              key={friend}
              onClick={() => setSelectedFriend(friend)}
              className={`px-3 py-2 rounded cursor-pointer ${
                selectedFriend === friend
                  ? "bg-indigo-500 text-white"
                  : "hover:bg-[#3f4147]"
              }`}
            >
              {friend}
            </div>
          ))}
        </div>

        {/* CHAT */}
        <div className="flex flex-col flex-1 px-4 py-3">
          {selectedFriend ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-xs px-3 py-2 rounded ${
                      m.from === email
                        ? "ml-auto bg-indigo-500 text-white"
                        : "bg-[#3f4147]"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-3 py-2 rounded bg-[#1e1f22] outline-none"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-indigo-500 rounded"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-gray-400">
              Select a friend to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
