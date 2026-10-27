# Duo Chat 🚀
> Production-quality real-time messaging application with a modern, high-contrast UI/UX, Socket.IO instant synchronization, phone-number-based accounts, live presence, and permanent persistence.

---

## 🌟 Key Features

1. **Modern Duo Chat UI / UX**:
   - Polished, high-contrast SaaS aesthetic with Indigo/Violet brand accents and Obsidian slate dark mode.
   - Clean message bubbles: Outgoing (Indigo `#4f46e5` with crisp white text) and Incoming (Neutral slate card).
   - Real-time tick indicators: Sent (`✓`), Delivered (`✓✓`), and Read (`✓✓` in electric cyan `#38bdf8`).
   - Vibrant unread message count badges.
   - Micro-dot canvas wallpaper for clean chat focus.

2. **Phone Number Based Registration & Permanent Persistence**:
   - **No mock / static test buttons** — all users create permanent accounts.
   - Sign up with **Full Name**, **Phone Number** (e.g. `+91 99999 88888`), and **Password**.
   - Sign in using your **Phone Number** (or username) and Password.
   - All accounts and chat histories remain permanently stored in SQLite (`duochat.sqlite`).

3. **Search & Chat by Phone Number**:
   - Click the **New Chat** button to search any registered contact by their **Phone Number** (or name).
   - Instantly previews the contact card with Avatar, Name, Phone Number, and Bio.
   - One click initiates the 1-to-1 conversation.

4. **Real-time Messaging (Socket.IO)**:
   - Instant zero-refresh message delivery.
   - Real-time typing indicators (*"User is typing..."* with animated bouncing dots).
   - Live online presence with green status badge.
   - Immediate read receipts (double ticks update live).

5. **Rich Media & File Sharing**:
   - Send photos (with fullscreen lightbox) and documents (PDF, DOCX, TXT, ZIP) up to 15MB.
   - Multi-category emoji picker.
   - Delete own messages for everyone (*"This message was deleted"*).

---

## ⚡ How to Run

### Start the Application
Run both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📱 How to Chat Between Two Users

1. Open **Browser Window 1** at `http://localhost:5173`:
   - Click **"Create account"**.
   - Enter your Name (e.g. `Krish`), Phone Number (e.g. `+91 98765 00001`), and Password.
   - Click **Create Account**.
2. Open **Browser Window 2** (e.g. an Incognito tab or another browser) at `http://localhost:5173`:
   - Click **"Create account"**.
   - Enter Name (e.g. `Alex`), Phone Number (e.g. `+91 98765 00002`), and Password.
   - Click **Create Account**.
3. In **Window 1**:
   - Click the **New Chat** button in the header.
   - Search Alex's phone number: `98765` or `+91 98765 00002`.
   - Alex's contact card will appear. Click it to open the conversation!
   - Send a message: see instant delivery, typing indicators, and tick receipts in real time.
