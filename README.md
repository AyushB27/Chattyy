# 💬 Chatttyy — Real-Time Chat Application

A full-stack, Discord-inspired real-time chat application built with the **MERN stack**. Chatty provides persistent authentication, real-time messaging, friend management, and database-backed chat history through a modern, responsive interface.

---

## 🚀 Features

### 🔐 Secure Authentication

* User registration and login using **JWT authentication**
* Password hashing with **bcrypt**
* Protected routes for authenticated users
* Secure environment variable management

### 💬 Real-Time Messaging

* Instant message delivery using **Socket.IO**
* Persistent chat history stored in MongoDB
* Real-time communication between connected users

### 👥 Friend System

* Send and receive friend requests
* Accept or manage incoming requests
* Database-backed friend relationships and status tracking

### 💾 Persistent Data

* MongoDB Atlas database integration
* Persistent users, friendships, and chat messages
* Data remains available even after server restarts

### 🎨 Modern UI

* Discord-inspired user interface
* Responsive design with **Tailwind CSS**
* Clean and intuitive chat experience

---

## 🛠️ Tech Stack

### Frontend

* React
* Tailwind CSS
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* Socket.IO

### Database

* MongoDB Atlas
* Mongoose

### Authentication & Security

* JSON Web Tokens (JWT)
* bcrypt
* dotenv

---

## ⚙️ Getting Started

### 1. Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/)
* A [MongoDB Atlas](https://www.mongodb.com/atlas) account
* Git

---

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/chatty.git
cd chatty
```

---

### 3. Backend Setup

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
```

Start the backend server:

```bash
npm run dev
```

---

### 4. Frontend Setup

Open a new terminal and navigate to the project root:

```bash
cd ..
npm install
npm run dev
```

The application will now be available at the local development URL provided by Vite.

---

## 🛡️ Security

Chatty implements several security practices:

* 🔑 JWT-based authentication
* 🔒 Password hashing with bcrypt
* 🛡️ Protected routes for authenticated users
* 🔐 Sensitive credentials stored using environment variables
* 🚫 `.env` files excluded from version control

> **Never commit your `.env` file or expose your MongoDB connection string and JWT secret publicly.**

---

## 🔮 Future Improvements

* Group chats and community servers
* Online/offline user presence
* Typing indicators
* Read receipts
* Image and file sharing
* Push notifications
* Voice and video calling
* Message reactions and replies

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

⭐ If you found this project interesting, consider giving it a star!
