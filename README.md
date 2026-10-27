# WhatsApp Web — Real-Time Chat 💬
> Authentic WhatsApp Web experience built with React, Vite, Tailwind CSS, Express, Socket.IO, and SQLite. Register with your phone number, search contacts by phone number, and chat live with real-time delivery and read receipts.

---

## 🌟 Key Features

1. **WhatsApp Web UI / UX**:
   - Signature WhatsApp Web top green bar & desktop aesthetic.
   - Authentic light & dark themes (WhatsApp Web Dark `#111b21` / `#202c33` & Light `#efeae2` / `#ffffff`).
   - SVG WhatsApp doodle wallpaper in the chat panel.
   - Message bubbles: Outgoing `#d9fdd3` (light) / `#005c4b` (dark), Incoming `#ffffff` (light) / `#202c33` (dark).
   - WhatsApp tick indicators: Sent (`✓`), Delivered (`✓✓`), Read (`✓✓` in sky blue `#53bdeb`).
   - WhatsApp green unread count pill badge (`#25d366`).

2. **Phone Number Based Accounts (Zero Static Data)**:
   - **No fake / mock test buttons**.
   - Create your own permanent account with your **Phone Number** (e.g. `+91 99999 88888`), Name, Password, and Status / About.
   - Sign in using your **Phone Number** and Password.
   - All accounts and messages stay permanently saved in the local SQLite database (`duochat.sqlite`).

3. **Search & Chat by Phone Number**:
   - Click the green **New Chat** button to search any registered user by their **Phone Number** (or name).
   - Contact card appears with Avatar, Name, Phone Number, and About status.
   - Click any contact to open an instant 1-to-1 chat!

4. **Real-time Messaging (Socket.IO)**:
   - Instant zero-refresh delivery.
   - Real-time typing indicator (*"User is typing..."*).
   - Live online presence with green badge.
   - Read receipts (ticks turn blue in real time as recipient views).

5. **Rich Media & Attachments**:
   - Send images (with click-to-enlarge lightbox) and files (PDF, DOCX, TXT, ZIP) up to 15MB.
   - Built-in multi-category emoji picker.
   - Delete messages for everyone (*"This message was deleted"*).

---

## ⚡ How to Run

### Start the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

---

## 📱 How to Chat Between Two Windows

1. Open **Window 1** (e.g. Chrome) at `http://localhost:5173`:
   - Click **"Create WhatsApp Account"**.
   - Enter your Name (e.g. `Krish`), Phone Number (e.g. `+91 98765 00001`), and Password.
   - Click **Create WhatsApp Account**.
2. Open **Window 2** (e.g. Incognito or Edge) at `http://localhost:5173`:
   - Click **"Create WhatsApp Account"**.
   - Enter Name (e.g. `Amit`), Phone Number (e.g. `+91 98765 00002`), and Password.
   - Click **Create WhatsApp Account**.
3. In **Window 1**:
   - Click the **New Chat** icon (green message bubble in the header).
   - In the search bar, type `98765` or `+91 98765 00002`.
   - Amit's contact card will appear showing his phone number and status.
   - Click it to start chatting live!
