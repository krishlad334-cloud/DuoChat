const db = require('../config/db');

function cleanPhoneDigits(phone) {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}

const UserModel = {
  create({ phone, username, email, password, name, about, avatar }) {
    const cleanPhone = cleanPhoneDigits(phone);
    const rawDigits = cleanPhone.replace(/\+/g, '');
    const cleanUsername = username ? username.trim().toLowerCase() : (cleanPhone || ('user_' + Date.now()));
    const cleanEmail = email ? email.trim().toLowerCase() : (rawDigits ? `${rawDigits}@duochat.local` : `user_${Date.now()}@duochat.local`);
    const defaultAbout = about || 'Hey there! I am using Duo Chat.';

    const stmt = db.prepare(`
      INSERT INTO users (phone, username, email, password, name, about, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      cleanPhone || null,
      cleanUsername,
      cleanEmail,
      password,
      name.trim(),
      defaultAbout,
      avatar || null
    );
    return this.findById(Number(res.lastInsertRowid));
  },

  findByPhone(phone) {
    if (!phone) return null;
    const digits = cleanPhoneDigits(phone);
    const rawDigitsOnly = digits.replace(/\+/g, '');

    const stmt = db.prepare(`
      SELECT * FROM users
      WHERE phone = ?
         OR REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone, ''), ' ', ''), '-', ''), '+', ''), '(', '') = ?
      LIMIT 1
    `);
    return stmt.get(digits, rawDigitsOnly);
  },

  findByUsername(username) {
    if (!username) return null;
    const stmt = db.prepare(`
      SELECT * FROM users WHERE LOWER(username) = LOWER(?)
    `);
    return stmt.get(username.trim());
  },

  findByEmail(email) {
    if (!email) return null;
    const stmt = db.prepare(`
      SELECT * FROM users WHERE LOWER(email) = LOWER(?)
    `);
    return stmt.get(email.trim());
  },

  findByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim();

    // Check by phone first
    const byPhone = this.findByPhone(clean);
    if (byPhone) return byPhone;

    // Check by username
    const byUsername = this.findByUsername(clean);
    if (byUsername) return byUsername;

    // Check by email
    const byEmail = this.findByEmail(clean);
    if (byEmail) return byEmail;

    return null;
  },

  findById(id) {
    const stmt = db.prepare(`
      SELECT id, phone, username, email, name, about, avatar, status, last_seen, created_at
      FROM users WHERE id = ?
    `);
    return stmt.get(id);
  },

  findByIdWithPassword(id) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `);
    return stmt.get(id);
  },

  findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT id, phone, username, email, name, about, avatar, status, last_seen, created_at
      FROM users WHERE id IN (${placeholders})
    `);
    return stmt.all(...ids);
  },

  search(query, currentUserId) {
    const rawQuery = query.trim();
    const cleanPattern = `%${rawQuery.toLowerCase()}%`;
    const digitsOnly = rawQuery.replace(/[^0-9]/g, '');
    const digitsPattern = digitsOnly ? `%${digitsOnly}%` : '%';

    const stmt = db.prepare(`
      SELECT id, phone, username, email, name, about, avatar, status, last_seen, created_at
      FROM users
      WHERE id != ?
        AND (
          LOWER(name) LIKE ?
          OR LOWER(username) LIKE ?
          OR phone LIKE ?
          OR (length(?) > 0 AND REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone, ''), ' ', ''), '-', ''), '+', ''), '(', '') LIKE ?)
        )
      ORDER BY
        CASE
          WHEN phone = ? THEN 1
          WHEN LOWER(name) = LOWER(?) THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT 25
    `);
    return stmt.all(
      currentUserId,
      cleanPattern,
      cleanPattern,
      cleanPattern,
      digitsOnly,
      digitsPattern,
      rawQuery,
      rawQuery
    );
  },

  getAllExcept(currentUserId) {
    const stmt = db.prepare(`
      SELECT id, phone, username, email, name, about, avatar, status, last_seen, created_at
      FROM users
      WHERE id != ?
      ORDER BY name ASC
      LIMIT 50
    `);
    return stmt.all(currentUserId);
  },

  updateStatus(userId, status, lastSeen = null) {
    if (lastSeen) {
      const stmt = db.prepare(`
        UPDATE users SET status = ?, last_seen = ? WHERE id = ?
      `);
      stmt.run(status, lastSeen, userId);
    } else {
      const stmt = db.prepare(`
        UPDATE users SET status = ? WHERE id = ?
      `);
      stmt.run(status, userId);
    }
  },

  updateProfile(userId, { name, about, avatar, phone }) {
    const stmt = db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          about = COALESCE(?, about),
          avatar = COALESCE(?, avatar),
          phone = COALESCE(?, phone)
      WHERE id = ?
    `);
    stmt.run(name || null, about || null, avatar || null, phone || null, userId);
    return this.findById(userId);
  }
};

module.exports = UserModel;
