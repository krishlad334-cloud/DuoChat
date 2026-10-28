const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
require('dotenv').config();

// Ensure DB is loaded & initialized
require('./config/db');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const { initSocketManager } = require('./sockets/socketManager');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Allow media resources to load across origins
  })
);

// Comprehensive CORS configuration
// Automatically allows any incoming origin (Vercel, Render, local dev, mobile phones, Capacitor, etc.)
const corsOptions = {
  origin: true, // Echoes the origin from the request, enabling credentials support
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// JSON & URL-encoded parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate limiting for auth routes (relaxed to prevent blocking mobile reconnections)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve static uploads (supports Vercel /tmp or local server uploads)
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve static frontend build if present (enables direct mobile/device access to port 5000)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

function getLocalIpAddress() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return 'localhost';
}

// API health checks (critical for quick client latency test and verification)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Duo Chat Server',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'standalone',
    localIp: getLocalIpAddress(),
    time: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Duo Chat Server',
    time: new Date().toISOString()
  });
});

// Network auto-discovery for mobile phones and other devices
app.get('/api/network-info', (req, res) => {
  const localIp = getLocalIpAddress();
  const serverPort = PORT;
  const clientPort = 5173;
  res.json({
    success: true,
    localIp,
    serverPort,
    clientPort,
    urls: {
      mobileClientUrl: `http://${localIp}:${clientPort}`,
      mobileServerUrl: `http://${localIp}:${serverPort}`,
      directLoginKrish: `http://${localIp}:${clientPort}?direct=krish`,
      directLoginPriya: `http://${localIp}:${clientPort}?direct=priya`,
      directLoginRahul: `http://${localIp}:${clientPort}?direct=rahul`,
      directLoginAlpha: `http://${localIp}:${clientPort}?direct=alpha`
    }
  });
});

// Root route for sanity check
app.get('/', (req, res) => {
  // If client index.html exists, serve it for root
  if (fs.existsSync(path.join(clientDistPath, 'index.html'))) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  res.json({
    app: 'Duo Chat Server API',
    status: 'active',
    documentation: 'https://github.com',
    health: '/api/health'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api', messageRoutes);
app.use('/api/users', userRoutes);

// SPA client-side routing fallback
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.IO configuration with universal CORS
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

initSocketManager(io);

// Only listen if not running under Vercel serverless wrapper
if (!process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIpAddress();
    console.log(`\x1b[32m✔ Duo Chat Server is running on port ${PORT}\x1b[0m`);
    console.log(`\x1b[36m✔ Local access:    http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[35m✔ Mobile/Network:  http://${localIp}:${PORT}\x1b[0m`);
    console.log(`\x1b[36m✔ Socket.IO initialized and listening\x1b[0m`);
    console.log(`\x1b[33m✔ Serving uploads from: ${uploadsDir}\x1b[0m`);
  });
}

// Attach server and io to express app so Vercel serverless / tests can access both
app.server = server;
app.io = io;

module.exports = app;
module.exports.app = app;
module.exports.server = server;
module.exports.io = io;
