const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Always resolve DB path relative to server root directory if relative
const rawDbPath = process.env.DB_PATH || './data/duochat.sqlite';
const serverRoot = path.resolve(__dirname, '../../');
const absoluteDbPath = path.isAbsolute(rawDbPath)
  ? rawDbPath
  : path.resolve(serverRoot, rawDbPath);

// Ensure directory exists
const dbDir = path.dirname(absoluteDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(absoluteDbPath);

// Enable WAL mode and foreign keys for high performance & integrity
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

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

  // Clean up old static demo test users (rahul, priya, alex)
  try {
    const staticUsers = db.prepare("SELECT id FROM users WHERE username IN ('rahul', 'priya', 'alex')").all();
    if (staticUsers.length > 0) {
      for (const u of staticUsers) {
        db.prepare('DELETE FROM messages WHERE sender_id = ?').run(u.id);
        db.prepare('DELETE FROM conversation_members WHERE user_id = ?').run(u.id);
        db.prepare('DELETE FROM users WHERE id = ?').run(u.id);
      }
      db.exec(`
        DELETE FROM conversations
        WHERE id NOT IN (SELECT DISTINCT conversation_id FROM conversation_members);
      `);
    }
  } catch (e) {
    // Ignore cleanup error
  }
}

initDb();

module.exports = db;
