import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../components/socket"; // Adjust path if needed

export default function ChatScreen() {
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState(null); // Now stores a friend OBJECT
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const token = localStorage.getItem("token");
  // Grabbing the email directly from localStorage as we set it in AuthScreen
  const email = localStorage.getItem("userEmail"); 

  // ===================== FETCH FRIENDS =====================
  const fetchFriends = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/friends/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // The backend now sends arrays of objects: [{ _id, username, email }]
      setFriends(res.data.friends || []);
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/"); // Kick out unauthenticated users
      return;
    }
    fetchFriends();
  }, [token, navigate]);

  // ===================== FETCH CHAT HISTORY =====================
  // This is the missing piece for Phase 4!
  useEffect(() => {
    if (!selectedFriend) return;

    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${selectedFriend.email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data); // Load the historical messages from MongoDB
      } catch (error) {
        console.error("Error fetching chat history", error);
      }
    };

    fetchChatHistory();
  }, [selectedFriend, token]);

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
      
      fetchFriends(); 
      
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

const acceptRequest = async (fromEmail) => {
    try {
      await axios.post(
        "http://localhost:5000/api/friends/accept",
        { from: fromEmail },
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
      to: selectedFriend.email, // Use the selected friend's email
      text: message,
    });

    setMessage("");
  };

  // ===================== LOGOUT =====================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/", { replace: true });
  };

  // ===================== FILTERED CHAT =====================
  const chatMessages = messages.filter(
    (m) =>
      (m.from === email && m.to === selectedFriend?.email) ||
      (m.from === selectedFriend?.email && m.to === email)
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
          {/* Updated mapping to handle objects */}
          {requests.map((req) => (
            <div key={req._id} className="flex justify-between items-center mb-2">
              <span>{req.username} <span className="text-xs text-gray-500">({req.email})</span></span>
              <button
                onClick={() => acceptRequest(req.email)}
                className="text-xs bg-green-500 px-2 py-1 rounded text-white"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ===== MAIN ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* FRIEND LIST */}
        <div className="w-1/3 border-r border-[#1f2023] px-4 py-3 overflow-y-auto">
          <h3 className="text-xs uppercase text-gray-400 mb-3">Friends</h3>
          {/* Updated mapping to handle objects */}
          {friends.map((friend) => (
            <div
              key={friend._id}
              onClick={() => setSelectedFriend(friend)}
              className={`px-3 py-2 rounded cursor-pointer mb-1 transition ${
                selectedFriend?._id === friend._id
                  ? "bg-indigo-500 text-white"
                  : "hover:bg-[#3f4147]"
              }`}
            >
              {friend.username}
            </div>
          ))}
        </div>

        {/* CHAT */}
        <div className="flex flex-col flex-1 px-4 py-3 bg-[#313338]">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-[#1f2023] pb-2 mb-3">
                <h2 className="font-semibold text-white">@ {selectedFriend.username}</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-xs px-3 py-2 rounded ${
                      m.from === email
                        ? "ml-auto bg-indigo-500 text-white rounded-br-none"
                        : "mr-auto bg-[#2b2d31] text-gray-200 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-auto">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#383a40] text-gray-200 outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={`Message @${selectedFriend.username}`}
                />
                <button
                  onClick={sendMessage}
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition"
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