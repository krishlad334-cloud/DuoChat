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

5. **Direct 1-Tap Login on Mobile Phone & All Devices**:
   - Quick 1-tap direct login buttons at the bottom of the sign-in screen:
     - 👤 **Krish** (`+91 99999 88888`)
     - 👤 **Priya** (`+91 98765 43210`)
     - 👤 **Rahul** (`+91 98765 43211`)
     - 👤 **User Alpha** (`+91 91111 22222`)
   - 1-click authentication with zero password typing needed — perfect for testing and cross-device usage.
   - Auto direct login via URL parameter (e.g. `?direct=priya` or `?phone=+919876543210`).

6. **Instant Mobile Phone Pairing & QR Code Access**:
   - Built-in **Phone / QR** button at the bottom of the login screen and inside the sidebar menu.
   - Generates an instant high-resolution QR code and copyable LAN Wi-Fi URL (e.g. `http://192.168.1.28:5173`).
   - Scan with your phone's camera to immediately open and direct-login on your phone.
   - Full WebSocket (`/socket.io`) proxying on LAN IP and standalone client serving directly on port 5000.

7. **Universal Mobile & Vercel Compatibility**:
   - Automatic backend resolution (`getApiBaseUrl()` & `getSocketUrl()`).
   - Dynamic CORS matching any Vercel domain, local network IP, or custom host.
   - Built-in **Server Settings Modal** on login and in the sidebar menu — test and configure your backend API directly from any mobile phone screen!
   - Ready-to-deploy Vercel configuration (`vercel.json` and serverless API handlers).

---

## 📱 How to Use on Mobile Phones (Same Wi-Fi)

1. Make sure your computer and mobile phone are connected to the same Wi-Fi router.
2. On your computer screen, click **"Phone / QR"** at the bottom of the sign-in card.
3. Open the camera app on your phone and point it at the QR Code on screen.
4. Tap the link that appears:
   - Your phone opens Duo Chat (e.g. `http://192.168.1.28:5173`).
   - Tap **👤 Priya** (or any user) under **Direct 1-Tap Login** on your phone.
   - On your computer, tap **👤 Krish** under **Direct 1-Tap Login**.
5. Both devices are now logged in and can exchange messages, files, and typing indicators in real time!

---

## ⚡ Deployment to Vercel & Mobile Setup

### Why Did Mobile Connection Previously Fail?
1. **Missing WebSocket Proxy**: Vite was proxying `/api` but not `/socket.io`, so real-time WebSockets failed on LAN mobile access.
2. **Hardcoded Localhost**: On mobile phones, `localhost` points to the phone itself.
3. **Stale LocalStorage**: If PC saved `localhost` in local storage, mobile browsers reused that invalid host.

### How It Is Resolved:
- **WebSocket Proxying with `ws: true`**: `/socket.io` is proxied seamlessly through Vite on port 5173.
- **Standalone Express Frontend Serving**: Port 5000 directly serves `client/dist`, allowing phones to use `http://<LAN_IP>:5000` with zero proxying needed.
- **Mobile-Safe Origin Resolution**: Automatically strips stale `localhost` settings when running on mobile devices.
- **Network Discovery**: `/api/network-info` dynamically provides the correct LAN IP and pairing URLs.

---

## 🚀 How to Run Locally

### Start Both Client & Server Concurrently:
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173` (or `http://192.168.1.28:5173` on mobile)
- **Backend API**: `http://localhost:5000` (or `http://192.168.1.28:5000` on mobile)

### Run Test Suites:
```bash
# 32-point comprehensive core debug suite
node test-deep-debug.js

# Direct login & mobile cross-device test suite
node test-direct-login.js
```
