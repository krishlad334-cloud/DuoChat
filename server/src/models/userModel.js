const db = require('../config/db');

const UserModel = {
  create({ username, email, password, name, avatar }) {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, name, avatar)
      VALUES (?, ?, ?, ?, ?)
    `);
    const res = stmt.run(username, email, password, name, avatar || null);
    return this.findById(Number(res.lastInsertRowid));
  },

  findByUsername(username) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE LOWER(username) = LOWER(?)
    `);
    return stmt.get(username);
  },

  findByEmail(email) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE LOWER(email) = LOWER(?)
    `);
    return stmt.get(email);
  },

  findById(id) {
    const stmt = db.prepare(`
      SELECT id, username, email, name, avatar, status, last_seen, created_at
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
      SELECT id, username, email, name, avatar, status, last_seen, created_at
      FROM users WHERE id IN (${placeholders})
    `);
    return stmt.all(...ids);
  },

  search(query, currentUserId) {
    const pattern = `%${query.toLowerCase()}%`;
    const stmt = db.prepare(`
      SELECT id, username, email, name, avatar, status, last_seen, created_at
      FROM users
      WHERE (LOWER(username) LIKE ? OR LOWER(name) LIKE ? OR LOWER(email) LIKE ?)
        AND id != ?
      ORDER BY name ASC
      LIMIT 20
    `);
    return stmt.all(pattern, pattern, pattern, currentUserId);
  },

  getAllExcept(currentUserId) {
    const stmt = db.prepare(`
      SELECT id, username, email, name, avatar, status, last_seen, created_at
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

  updateProfile(userId, { name, avatar }) {
    const stmt = db.prepare(`
      UPDATE users SET name = COALESCE(?, name), avatar = COALESCE(?, avatar) WHERE id = ?
    `);
    stmt.run(name || null, avatar || null, userId);
    return this.findById(userId);
  }
};

module.exports = UserModel;
