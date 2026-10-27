const db = require('../config/db');

const ConversationModel = {
  findDirect(user1Id, user2Id) {
    const stmt = db.prepare(`
      SELECT c.id, c.is_group, c.title, c.creator_id, c.created_at, c.updated_at
      FROM conversations c
      JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = ?
      JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = ?
      WHERE c.is_group = 0
      LIMIT 1
    `);
    return stmt.get(user1Id, user2Id);
  },

  findOrCreateDirect(user1Id, user2Id) {
    const existing = this.findDirect(user1Id, user2Id);
    if (existing) {
      return this.getById(existing.id, user1Id);
    }

    // Create new direct conversation
    const createStmt = db.prepare(`
      INSERT INTO conversations (is_group, title, creator_id, created_at, updated_at)
      VALUES (0, NULL, ?, datetime('now'), datetime('now'))
    `);
    const res = createStmt.run(user1Id);
    const convId = Number(res.lastInsertRowid);

    // Add members
    const addMemberStmt = db.prepare(`
      INSERT INTO conversation_members (conversation_id, user_id, role, last_read_message_id)
      VALUES (?, ?, 'member', 0)
    `);
    addMemberStmt.run(convId, user1Id);
    addMemberStmt.run(convId, user2Id);

    return this.getById(convId, user1Id);
  },

  createGroup({ title, creatorId, memberIds = [] }) {
    const createStmt = db.prepare(`
      INSERT INTO conversations (is_group, title, creator_id, created_at, updated_at)
      VALUES (1, ?, ?, datetime('now'), datetime('now'))
    `);
    const res = createStmt.run(title, creatorId);
    const convId = Number(res.lastInsertRowid);

    const addMemberStmt = db.prepare(`
      INSERT INTO conversation_members (conversation_id, user_id, role, last_read_message_id)
      VALUES (?, ?, ?, 0)
    `);

    // Add creator as admin
    addMemberStmt.run(convId, creatorId, 'admin');

    // Add other members
    const uniqueMembers = [...new Set(memberIds.filter(id => Number(id) !== Number(creatorId)))];
    for (const memId of uniqueMembers) {
      addMemberStmt.run(convId, Number(memId), 'member');
    }

    return this.getById(convId, creatorId);
  },

  getById(conversationId, currentUserId) {
    const convStmt = db.prepare(`
      SELECT c.*, cm.last_read_message_id, cm.role as user_role,
             COALESCE(cm.is_archived, 0) as is_archived,
             COALESCE(cm.is_muted, 0) as is_muted,
             COALESCE(cm.is_pinned, 0) as is_pinned
      FROM conversations c
      JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = ?
      WHERE c.id = ?
    `);
    const conv = convStmt.get(currentUserId, conversationId);
    if (!conv) return null;

    // Get members
    const membersStmt = db.prepare(`
      SELECT u.id, u.phone, u.username, u.name, u.about, u.avatar, u.status, u.last_seen, cm.role, cm.joined_at, cm.last_read_message_id
      FROM conversation_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.conversation_id = ?
      ORDER BY cm.role DESC, u.name ASC
    `);
    conv.members = membersStmt.all(conversationId);

    // If 1-to-1, attach other_user
    if (!conv.is_group) {
      conv.other_user = conv.members.find(m => m.id !== currentUserId) || null;
    }

    // Last message
    const lastMsgStmt = db.prepare(`
      SELECT m.*, u.name as sender_name, u.username as sender_username
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ?
      ORDER BY m.id DESC
      LIMIT 1
    `);
    conv.last_message = lastMsgStmt.get(conversationId) || null;

    // Unread count
    const unreadStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE conversation_id = ?
        AND id > ?
        AND sender_id != ?
        AND is_deleted = 0
    `);
    const unread = unreadStmt.get(conversationId, conv.last_read_message_id || 0, currentUserId);
    conv.unread_count = unread ? unread.count : 0;

    return conv;
  },

  getUserConversations(userId) {
    const convListStmt = db.prepare(`
      SELECT c.*, cm.last_read_message_id, cm.role as user_role,
             COALESCE(cm.is_archived, 0) as is_archived,
             COALESCE(cm.is_muted, 0) as is_muted,
             COALESCE(cm.is_pinned, 0) as is_pinned
      FROM conversations c
      JOIN conversation_members cm ON cm.conversation_id = c.id
      WHERE cm.user_id = ?
      ORDER BY cm.is_pinned DESC, c.updated_at DESC
    `);
    const conversations = convListStmt.all(userId);

    const membersStmt = db.prepare(`
      SELECT u.id, u.phone, u.username, u.name, u.about, u.avatar, u.status, u.last_seen, cm.role
      FROM conversation_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.conversation_id = ?
    `);

    const lastMsgStmt = db.prepare(`
      SELECT m.*, u.name as sender_name, u.username as sender_username
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ?
      ORDER BY m.id DESC
      LIMIT 1
    `);

    const unreadStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE conversation_id = ?
        AND id > ?
        AND sender_id != ?
        AND is_deleted = 0
    `);

    return conversations.map(conv => {
      const members = membersStmt.all(conv.id);
      conv.members = members;

      if (!conv.is_group) {
        conv.other_user = members.find(m => m.id !== userId) || null;
      }

      conv.last_message = lastMsgStmt.get(conv.id) || null;

      const unread = unreadStmt.get(conv.id, conv.last_read_message_id || 0, userId);
      conv.unread_count = unread ? unread.count : 0;

      return conv;
    });
  },

  deleteConversation(conversationId, userId) {
    // Delete membership
    db.prepare('DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
      .run(conversationId, userId);

    // If no members remain, cascade delete conversation and its messages
    const remaining = db.prepare('SELECT COUNT(*) as count FROM conversation_members WHERE conversation_id = ?')
      .get(conversationId);
    if (!remaining || remaining.count === 0) {
      db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(conversationId);
      db.prepare('DELETE FROM conversations WHERE id = ?').run(conversationId);
    }
    return true;
  },

  clearMessages(conversationId) {
    db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(conversationId);
    db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);
    return true;
  },

  setArchived(conversationId, userId, isArchived) {
    db.prepare('UPDATE conversation_members SET is_archived = ? WHERE conversation_id = ? AND user_id = ?')
      .run(isArchived ? 1 : 0, conversationId, userId);
    return true;
  },

  setMuted(conversationId, userId, isMuted) {
    db.prepare('UPDATE conversation_members SET is_muted = ? WHERE conversation_id = ? AND user_id = ?')
      .run(isMuted ? 1 : 0, conversationId, userId);
    return true;
  },

  setPinned(conversationId, userId, isPinned) {
    db.prepare('UPDATE conversation_members SET is_pinned = ? WHERE conversation_id = ? AND user_id = ?')
      .run(isPinned ? 1 : 0, conversationId, userId);
    return true;
  },

  markAsUnread(conversationId, userId) {
    db.prepare('UPDATE conversation_members SET last_read_message_id = 0 WHERE conversation_id = ? AND user_id = ?')
      .run(conversationId, userId);
    return true;
  },

  isMember(conversationId, userId) {
    const stmt = db.prepare(`
      SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?
    `);
    return Boolean(stmt.get(conversationId, userId));
  },

  getMembers(conversationId) {
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.name, u.avatar, u.status, u.last_seen, cm.role, cm.last_read_message_id
      FROM conversation_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.conversation_id = ?
    `);
    return stmt.all(conversationId);
  },

  addMember(conversationId, userId, role = 'member') {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO conversation_members (conversation_id, user_id, role, last_read_message_id)
      VALUES (?, ?, ?, 0)
    `);
    stmt.run(conversationId, userId, role);
    this.touch(conversationId);
  },

  removeMember(conversationId, userId) {
    const stmt = db.prepare(`
      DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?
    `);
    stmt.run(conversationId, userId);
    this.touch(conversationId);
  },

  touch(conversationId) {
    const stmt = db.prepare(`
      UPDATE conversations SET updated_at = datetime('now') WHERE id = ?
    `);
    stmt.run(conversationId);
  },

  markAsRead(conversationId, userId, lastMessageId = null) {
    // If lastMessageId not specified, get latest message ID in conversation
    if (!lastMessageId) {
      const latestStmt = db.prepare(`
        SELECT COALESCE(MAX(id), 0) as max_id FROM messages WHERE conversation_id = ?
      `);
      const row = latestStmt.get(conversationId);
      lastMessageId = row ? row.max_id : 0;
    }

    const updateMemberStmt = db.prepare(`
      UPDATE conversation_members
      SET last_read_message_id = MAX(last_read_message_id, ?)
      WHERE conversation_id = ? AND user_id = ?
    `);
    updateMemberStmt.run(lastMessageId, conversationId, userId);

    // Update messages status sent by others in 1-on-1 to 'read'
    const updateMsgStmt = db.prepare(`
      UPDATE messages
      SET status = 'read'
      WHERE conversation_id = ? AND sender_id != ? AND id <= ? AND status != 'read'
    `);
    updateMsgStmt.run(conversationId, userId, lastMessageId);

    return lastMessageId;
  }
};

module.exports = ConversationModel;
