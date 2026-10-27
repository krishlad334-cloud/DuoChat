# Duo Chat 🚀
> Production-quality real-time messaging application inspired by Telegram Web UI/UX, built with React, Tailwind CSS, Express, Socket.IO, and permanent SQLite persistence.

---

## 🌟 Key Features

1. **Telegram Web Authentic Design**:
   - Signature Telegram dark navy theme (`#0e1621` & `#17212b`) and crisp light mode.
   - White bird in flight silhouette on Telegram blue circle favicon.
   - Responsive multi-device layout (native slide-out sidebar, bottom sheets on mobile, desktop master-detail split).
   - Conversation context options: **Pin to Top**, **Mute Notifications**, **Archive Chat**, **Mark as Unread**, **Clear History**, and **Delete Chat**.
   - Fixed-position action menus with edge-collision detection and mobile bottom-sheet modals.

2. **Phone Number Based Registration & Permanent Persistence**:
   - **No mock / static data** — all users create permanent accounts stored in SQLite.
   - Telegram-style country code picker with instant search (+91 India, +1 USA, etc.).
   - Sign up with **Full Name**, **Phone Number**, and **Password**.
   - Sign in using your **Phone Number** and Password.

3. **Search & Chat by Phone Number**:
   - Click the **New Chat** button to search any registered contact by their **Phone Number** or name.
   - Instantly previews the contact card with Avatar, Name, Phone Number, and Bio.
   - One click initiates the 1-to-1 conversation.

4. **Real-time Messaging (Socket.IO)**:
   - Instant zero-refresh message delivery.
   - Real-time typing indicators (*"typing..."* with animated bouncing dots).
   - Live online presence with green status badge.
   - Immediate read receipts (double ticks update live).

5. **Universal Mobile & Vercel Compatibility**:
   - Automatic backend resolution (`getApiBaseUrl()` & `getSocketUrl()`).
   - Dynamic CORS matching any Vercel domain, local network IP, or custom host.
   - Built-in **Server Settings Modal** on login and in the sidebar menu — test and configure your backend API directly from any mobile phone screen!
   - Ready-to-deploy Vercel configuration (`vercel.json` and serverless API handlers).

---

## ⚡ Deployment to Vercel & Mobile Setup

### Why Did "Network Error" Happen on Mobile?
1. **Hardcoded Localhost**: The client Vite build was pointing to `http://localhost:5000/api`. On a mobile phone, `localhost` points to the phone itself where no server is running.
2. **Mixed Content Security**: The browser blocks unencrypted `http://` calls from an `https://` Vercel site.
3. **CORS Restrictions**: Standard backend origins blocked requests from `https://*.vercel.app`.

### How It Is Resolved:
- **Intelligent URL Detection**: The client now dynamically determines the correct API domain.
- **On-Screen Server Settings**: Tap **"Server Settings"** on the login screen (or inside the menu) to enter and test any backend host with a single click.
- **Universal CORS**: The backend automatically authorizes all Vercel and mobile origins.
- **Serverless Compatibility**: SQLite and uploads automatically adapt to `/tmp` in serverless environments.

---

## 🚀 How to Run Locally

### Start Both Client & Server Concurrently:
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### Run Test Suite:
```bash
node test-deep-debug.js
```
(Runs 32 automated unit and integration tests across auth, phone search, chat operations, Socket.IO, and file uploads).
