# Duo Chat 🚀
> Production-quality real-time chat application with WhatsApp/Telegram-style UI/UX, Socket.IO instant synchronization, message status indicators, group chats, file sharing, and dark/light themes.

---

## 📸 Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide React
- **Backend**: Node.js + Express + Socket.IO + SQLite (`node:sqlite` built-in)
- **Authentication**: JWT (Access Token) + bcrypt password hashing
- **Security & Reliability**: Helmet, CORS with credentials, express-rate-limit, input validation, WAL mode database transactions

---

## 🌟 Core Features

1. **Authentication & Session**:
   - User sign up (name, username, email, password) with client & server validation.
   - User login with either username or email.
   - 1-Click quick test login buttons (`Rahul`, `Priya`, `Alex`) for instant testing in two browser windows.
   - Persistent session with JWT in `localStorage` and auto-verification.
   - Clean logout with real-time presence transition.

2. **One-to-One & Group Chats**:
   - Instant direct chat initiation via user search.
   - Group chat creation: custom group name and multi-user selection.
   - Group member management: view members, view Admin badge, add new members, remove members (Admin only), or leave group.

3. **Real-time Messaging (Socket.IO)**:
   - Zero-refresh instant message delivery.
   - Room-based isolation (`chat:<conversationId>`) and individual user notification rooms (`user:<userId>`).
   - Conversations automatically bump to the top with real-time snippets on incoming messages.

4. **Message Status Indicators (Ticks)**:
   - **Sent** (Single gray tick ✓)
   - **Delivered** (Double gray tick ✓✓)
   - **Read** (Double cyan/blue tick ✓✓)
   - Automatically marks messages as read when recipient opens or views the conversation, updating ticks on the sender's screen in real time.

5. **Typing Indicators**:
   - Real-time animated 3 bouncing dots and status indicator: *"Rahul Sharma is typing..."*.
   - Automatically debounces and expires after 3 seconds of inactivity.

6. **Online / Offline Presence & Last Seen**:
   - Live presence indicator with green badge.
   - Dynamic status subtitle: *"Online"*, *"last seen today at 2:30 PM"*, *"last seen yesterday at 11:15 AM"*, or formatted date.

7. **Message History & Infinite Scroll**:
   - Persistent storage in SQLite with WAL mode.
   - Pagination (30 messages per batch).
   - Infinite scroll upward: automatically loads older messages while preserving the user's scroll position.

8. **Unread Message Badges**:
   - Per-conversation unread count badge.
   - Real-time increment when messages arrive from other chats.
   - Clears immediately when conversation is opened.

9. **Image & File Sharing**:
   - Upload images (JPEG, PNG, GIF, WebP) and documents (PDF, DOCX, TXT, ZIP) up to 15MB.
   - Live attachment preview chip before sending with 1-click removal.
   - Image click-to-enlarge fullscreen lightbox modal with download button.
   - File download cards with filename, formatted file size (KB/MB), and download button.

10. **Emoji Picker & Message Deletion**:
    - Built-in multi-category emoji picker popover (Smileys, Gestures, Love, Objects).
    - Insert emojis into the message input at cursor.
    - Delete own messages with real-time broadcast to all participants (*"This message was deleted"*).

11. **Responsive UI/UX**:
    - WhatsApp / Telegram style layout: conversation sidebar + chat panel.
    - Mobile-responsive: displays conversation list or chat panel with a back button.
    - Smooth auto-scroll to newest message with floating "Scroll to bottom" button when scrolled up.
    - Date separators (*Today*, *Yesterday*, *Oct 24, 2026*).
    - Keyboard shortcuts: `Enter` to send, `Shift + Enter` for a new line.
    - Light and Dark mode toggle with persistent preference saved across sessions.

12. **Auto-Reconnect Handling**:
    - Reconnection banner if socket drops (*"Connecting to chat server..."* or *"Connection lost"*).
    - 1-click manual retry button and automatic reconnection loop.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node.js v24 with built-in SQLite)
- **npm**

### 2. Installation
Run from the root directory:
```bash
npm run install:all
```
*(Or install manually: `cd server && npm install && cd ../client && npm install`)*

### 3. Seed Test Users & Initial Chats
Populate the database with pre-configured test users and sample chats:
```bash
npm run seed
```

This creates:
| Name | Username | Email | Password |
| :--- | :--- | :--- | :--- |
| **Rahul Sharma** | `rahul` | `rahul@example.com` | `password123` |
| **Priya Patel** | `priya` | `priya@example.com` | `password123` |
| **Alex Morgan** | `alex` | `alex@example.com` | `password123` |

### 4. Start the Application
Run both backend server and Vite client concurrently:
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API & Sockets**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🧪 Testing Between Two Users Live

1. Open **Window 1** (e.g. Regular Chrome tab) at `http://localhost:5173`:
   - Click the **"👤 Rahul"** quick login button, then click **Sign In**.
2. Open **Window 2** (e.g. Incognito tab or separate browser) at `http://localhost:5173`:
   - Click the **"👤 Priya"** quick login button, then click **Sign In**.
3. **Chat Live**:
   - Both users will immediately see each other marked as **Online** with green badges.
   - Click on the conversation between Rahul and Priya.
   - Type a message in Window 1: notice the animated **"Rahul Sharma is typing..."** indicator in Window 2.
   - Hit **Enter**: the message appears instantaneously without page refresh.
   - Notice the status tick in Window 1 update from **Sent (✓)** to **Delivered (✓✓)** to **Read (✓✓ cyan/blue)** as Priya views it.
   - Click the paperclip icon in Window 2 to attach an image or file and send.
   - Hover over your sent message and click the trash icon to delete it for both users.

---

## 📁 Project Architecture

```
c:\Duo Chat\
├── package.json               # Root scripts (install:all, seed, dev, etc.)
├── start-dev.js               # Concurrently runs server and client
├── test-e2e.js                # Automated end-to-end socket & API verification
├── README.md                  # Complete documentation
│
├── server/                    # Node.js + Express + Socket.IO Backend
│   ├── package.json
│   ├── .env / .env.example
│   ├── uploads/               # Statically served file uploads (/uploads)
│   ├── data/duochat.sqlite    # SQLite database file (WAL mode enabled)
│   └── src/
│       ├── config/db.js       # SQLite connection & schema initialization
│       ├── controllers/       # Auth, Chat, Message, User controllers
│       ├── middleware/        # JWT auth, Multer upload, error handlers
│       ├── models/            # Database queries (User, Conversation, Message)
│       ├── routes/            # Express routers (/api/auth, /api/chats, /api, /api/users)
│       ├── sockets/           # Socket.IO event handlers and presence engine
│       ├── seeds/seed.js      # Test data generator
│       └── index.js           # Server entry point
│
└── client/                    # React 18 + Vite + Tailwind Frontend
    ├── package.json
    ├── vite.config.js         # Vite dev server & proxy settings
    ├── tailwind.config.js     # Tailwind CSS theme & dark mode config
    ├── index.html
    └── src/
        ├── components/
        │   ├── auth/          # LoginForm (with quick-login), RegisterForm
        │   ├── chat/          # ChatArea, ChatHeader, MessageList, MessageBubble,
        │   │                  # MessageInput, GroupModal, GroupInfoModal, ImageModal,
        │   │                  # EmojiPickerPopover
        │   ├── sidebar/       # Sidebar, SidebarHeader, ConversationList,
        │   │                  # ConversationItem, SearchUserModal
        │   └── common/        # Avatar, ConnectionBanner, LoadingSkeleton, ThemeToggle
        ├── context/           # AuthContext, ChatContext, SocketContext, ThemeContext
        ├── services/          # Axios API client and endpoints
        ├── utils/             # Date formatting (dateUtils) and formatters
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

---

## 🛡️ Security & Performance Highlights
- **Password Protection**: Passwords securely hashed with `bcryptjs` (salt rounds: 10).
- **Protected Endpoints**: JSON Web Tokens (JWT) verified on every API request and Socket.IO handshake.
- **Rate Limiting**: Brute-force protection on auth endpoints using `express-rate-limit`.
- **Security Headers**: `helmet` configured with cross-origin resource policy for static media.
- **Database Concurrency**: SQLite configured in **WAL mode** (`PRAGMA journal_mode = WAL`) and foreign key constraints enabled.
# DuoChat
