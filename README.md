# Chatty

Chatty is a full-stack, real-time messaging and community platform built using React, Node.js, Express, MongoDB, and Socket.IO. It combines server-based community channels, one-on-one direct messages, in-browser WebRTC voice channels, custom user presence, and a multi-theme design system.

---

## Core Capabilities

### Community Servers and Channels
- Create and manage custom servers with unique 8-character invite codes.
- Join public or private servers using invite links or codes.
- Organize servers into text channels (`#general`, `#dev`) and voice rooms with customizable categories.
- Real-time channel message broadcast isolated to server/channel rooms.
- Server member directory grouped by online and offline states, with role distinctions (owner and members).

### Direct Messaging and Social Graph
- Persistent direct message threads that support both friends and server co-members.
- Friend management system: send, accept, decline, or cancel requests, plus unfriend capabilities.
- Real-time online, idle, do-not-disturb, and invisible presence tracking.
- Custom status messages and editable user profiles (avatars and bios).
- Interactive user popout cards with quick direct messaging.

### Real-Time Chat Experience
- Live typing indicators ("user is typing...") with automatic debouncing.
- Multi-category emoji picker with cursor-accurate text insertion.
- Message reactions with real-time counters and user interaction states.
- In-place message editing with an `(edited)` indicator and message deletion.
- Quoted reply chains linking back to parent messages.
- Markdown code block formatting and image URL preview attachments.
- Automatic smooth scrolling to latest messages on incoming events.

### WebRTC Voice Channels
- In-browser voice communication using WebRTC mesh signaling over Socket.IO.
- Active speaking indicators with visual audio rings.
- Hardware toggle support for microphone mute and audio deafen.
- Voice room status bar displaying connection state and one-click disconnect.

### Multi-Theme Engine
- Four distinct theme palettes:
  - Cyber Dark (deep slate with luminous indigo accents)
  - OLED Midnight (pitch black with emerald highlights)
  - Sunset Velvet (royal purple with fuchsia accents)
  - Clean Snow (light mode with crisp slate typography)
- Instant theme switcher accessible from the header, sidebar, and settings modal with local storage persistence.

---

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS v4
- Socket.IO Client
- Axios
- React Router v7
- Lucide React (icons)

### Backend
- Node.js
- Express 5
- Socket.IO 4
- MongoDB and Mongoose 9
- JSON Web Tokens (JWT)
- bcrypt (password hashing)

---

## Project Structure

```text
Chattyyyyy/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Layout, chat feed, modals, common UI
│   │   ├── context/        # Auth, Socket, and Theme state providers
│   │   ├── screens/        # AuthScreen and master ChatScreen
│   │   ├── services/       # Centralized Axios API client
│   │   ├── App.jsx         # App router and providers
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── middleware/         # JWT authentication middleware
│   ├── models/             # User, Message, Server, and Channel Mongoose schemas
│   ├── routes/             # Auth, friend, message, server, and channel API endpoints
│   ├── server.js           # Express app, Socket.IO rooms, and WebRTC signaling
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A running MongoDB instance (local MongoDB Community Server or a free MongoDB Atlas cluster)

---

### 1. Clone the Repository

```bash
git clone https://github.com/AyushB27/Chattyyyyy.git
cd Chattyyyyy
```

---

### 2. Configure the Backend

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chatty
JWT_SECRET=your_super_secret_jwt_key_here
```

> If you are using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/chatty?retryWrites=true&w=majority`). Make sure your IP address is whitelisted in Atlas Network Access.

Start the backend development server:

```bash
npm run dev
```

The server will start listening on `http://localhost:5000`.

---

### 3. Configure the Frontend

Open a second terminal window, navigate to the `client` directory, and install dependencies:

```bash
cd client
npm install
```

Optionally create a `.env` file in the `client` directory (defaults to `http://localhost:5000` if omitted):

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start the Vite development server:

```bash
npm run dev
```

Open the printed localhost URL (typically `http://localhost:5173`) in your browser.

---

## Architecture and Socket Events

### Socket.IO Room Architecture
- User Private Room: `user:<userId>` for direct messaging, friend requests, and personal notifications.
- Channel Room: `channel:<channelId>` for text messages sent within a specific server channel.
- Voice Room: `voice:<channelId>` for WebRTC peer signaling and speaking state updates.
- Server Room: `server:<serverId>` for server-wide member and channel updates.

### Key Socket Events
- `authenticate`: Handshakes user ID with the socket connection and joins user room.
- `send-direct-message` / `receive-direct-message`: 1-on-1 message delivery with database persistence.
- `send-channel-message` / `receive-channel-message`: Server channel message broadcast.
- `typing-start` / `typing-stop`: Emits debounced typing indicators to specific channels or direct users.
- `message:edit`, `message:delete`, `message:react`: Real-time updates for edited content, deletions, and emoji reactions.
- `join-voice-channel`, `leave-voice-channel`, `voice-signal`: WebRTC offer, answer, and ICE candidate negotiation.

---

## Troubleshooting

### MongoDB SRV DNS Lookup Error
If you encounter `querySrv ENOTFOUND` when connecting to MongoDB Atlas, your local DNS server or ISP is failing to resolve SRV records. To resolve this:
- Switch your network adapter DNS to Google Public DNS (`8.8.8.8` and `8.8.4.4`) or Cloudflare DNS (`1.1.1.1`).
- Or use the standard 3-node connection string format without `+srv` provided in MongoDB Atlas connection settings.

### Port Conflicts
If port `5000` or `5173` is already in use, update the `PORT` variable in `server/.env` and the `VITE_API_URL` / `VITE_SOCKET_URL` in `client/.env`.

---

## License

This project is open-source and available under the ISC License.
