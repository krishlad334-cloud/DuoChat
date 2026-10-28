const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Resolve DB path (supports Vercel /tmp serverless environment)
let absoluteDbPath;
if (process.env.VERCEL) {
  absoluteDbPath = '/tmp/duochat.sqlite';
} else {
  const rawDbPath = process.env.DB_PATH || './data/duochat.sqlite';
  const serverRoot = path.resolve(__dirname, '../../');
  absoluteDbPath = path.isAbsolute(rawDbPath)
    ? rawDbPath
    : path.resolve(serverRoot, rawDbPath);
}

// Ensure directory exists
const dbDir = path.dirname(absoluteDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(absoluteDbPath);

// Enable WAL mode and foreign keys for high performance & integrity
db.exec('PRAGMA foreign_keys = ON;');
try {
  db.exec('PRAGMA journal_mode = WAL;');
} catch (e) {
  // Fallback to default journal mode on restricted filesystems
}

// Initialize tables
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      email TEXT COLLATE NOCASE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      status TEXT DEFAULT 'offline',
      last_seen TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      is_group INTEGER DEFAULT 0,
      title TEXT,
      creator_id INTEGER,
      last_message_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS conversation_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at TEXT DEFAULT (datetime('now')),
      last_read_message_id INTEGER DEFAULT 0,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (conversation_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT,
      type TEXT DEFAULT 'text',
      file_url TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_mime TEXT,
      status TEXT DEFAULT 'sent',
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_members_conv_user ON conversation_members(conversation_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_members_user ON conversation_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, id DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
  `);

  // Dynamically ensure phone and about columns exist in users table
  const userColumns = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);
  if (!userColumns.includes('phone')) {
    db.exec('ALTER TABLE users ADD COLUMN phone TEXT;');
  }
  if (!userColumns.includes('about')) {
    db.exec("ALTER TABLE users ADD COLUMN about TEXT DEFAULT 'Hey there! I am using Duo Chat.';");
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);');

  // Dynamically ensure conversation_members features (archive, mute, pin) exist
  const memberColumns = db.prepare('PRAGMA table_info(conversation_members)').all().map(c => c.name);
  if (!memberColumns.includes('is_archived')) {
    db.exec('ALTER TABLE conversation_members ADD COLUMN is_archived INTEGER DEFAULT 0;');
  }
  if (!memberColumns.includes('is_muted')) {
    db.exec('ALTER TABLE conversation_members ADD COLUMN is_muted INTEGER DEFAULT 0;');
  }
  if (!memberColumns.includes('is_pinned')) {
    db.exec('ALTER TABLE conversation_members ADD COLUMN is_pinned INTEGER DEFAULT 0;');
  }

  // Ensure default permanent direct login users exist for phone & multi-device testing
  try {
    const bcrypt = require('bcryptjs');
    const defaultUsers = [
      {
        phone: '+919999988888',
        username: 'krish',
        name: 'Krish',
        about: 'Available on Duo Chat',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Krish&backgroundColor=5288c1',
        password: 'password123'
      },
      {
        phone: '+919876543210',
        username: 'priya',
        name: 'Priya',
        about: 'Hey there! I am using Duo Chat.',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya&backgroundColor=ec4899',
        password: 'password123'
      },
      {
        phone: '+919876543211',
        username: 'rahul',
        name: 'Rahul',
        about: 'At work | Ping here anytime',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rahul&backgroundColor=6366f1',
        password: 'password123'
      },
      {
        phone: '+919111122222',
        username: 'alpha',
        name: 'User Alpha',
        about: 'Active tester on mobile device',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alpha&backgroundColor=10b981',
        password: 'password123'
      }
    ];

    const findStmt = db.prepare('SELECT id FROM users WHERE phone = ? OR username = ? LIMIT 1');
    const insertStmt = db.prepare(`
      INSERT INTO users (phone, username, email, password, name, about, avatar, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'offline')
    `);

    // Ensure username alias for alpha if needed
    db.exec("UPDATE users SET username = 'alpha' WHERE phone = '+919111122222' AND username != 'alpha';");

    for (const u of defaultUsers) {
      const existing = findStmt.get(u.phone, u.username);
      if (!existing) {
        const hash = bcrypt.hashSync(u.password, 10);
        insertStmt.run(
          u.phone,
          u.username,
          `${u.username}@duochat.local`,
          hash,
          u.name,
          u.about,
          u.avatar
        );
      }
    }
  } catch (e) {
    console.warn('Direct users check notice:', e.message);
  }
}

initDb();

module.exports = db;
