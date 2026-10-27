const db = require('../config/db');

const MessageModel = {
  create({
    conversationId,
    senderId,
    content = '',
    type = 'text',
    fileUrl = null,
    fileName = null,
    fileSize = null,
    fileMime = null,
    status = 'sent'
  }) {
    const stmt = db.prepare(`
      INSERT INTO messages (
        conversation_id, sender_id, content, type,
        file_url, file_name, file_size, file_mime, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const res = stmt.run(
      conversationId,
      senderId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      fileMime,
      status
    );
    const messageId = Number(res.lastInsertRowid);

    // Update conversation last_message_id and updated_at
    const updateConv = db.prepare(`
      UPDATE conversations
      SET last_message_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    updateConv.run(messageId, conversationId);

    return this.getById(messageId);
  },

  getById(messageId) {
    const stmt = db.prepare(`
      SELECT m.*, u.name as sender_name, u.username as sender_username, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.id = ?
    `);
    return stmt.get(messageId);
  },

  getByConversation(conversationId, { limit = 30, beforeId = null } = {}) {
    let query = `
      SELECT m.*, u.name as sender_name, u.username as sender_username, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ?
    `;
    const params = [conversationId];

    if (beforeId) {
      query += ` AND m.id < ?`;
      params.push(Number(beforeId));
    }

    query += ` ORDER BY m.id DESC LIMIT ?`;
    params.push(Number(limit));

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    // Return in chronological order (oldest to newest)
    return rows.reverse();
  },

  deleteMessage(messageId, userId) {
    const msg = this.getById(messageId);
    if (!msg) return null;
    if (msg.sender_id !== userId) {
      throw new Error('Not authorized to delete this message');
    }

    const stmt = db.prepare(`
      UPDATE messages
      SET is_deleted = 1, content = 'This message was deleted', file_url = NULL, file_name = NULL
      WHERE id = ?
    `);
    stmt.run(messageId);

    return this.getById(messageId);
  },

  updateStatus(messageId, status) {
    const stmt = db.prepare(`
      UPDATE messages SET status = ? WHERE id = ?
    `);
    stmt.run(status, messageId);
  },

  markConversationDelivered(conversationId, userId) {
    // Mark messages sent by others in this conversation as 'delivered' if currently 'sent'
    const stmt = db.prepare(`
      UPDATE messages
      SET status = 'delivered'
      WHERE conversation_id = ? AND sender_id != ? AND status = 'sent'
    `);
    stmt.run(conversationId, userId);
  }
};

module.exports = MessageModel;
