const { verifySocketToken } = require('../middleware/authMiddleware');
const UserModel = require('../models/userModel');
const ConversationModel = require('../models/conversationModel');
const MessageModel = require('../models/messageModel');

// Map of userId -> Set of socketIds
const userSockets = new Map();

function initSocketManager(io) {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization && socket.handshake.headers.authorization.split(' ')[1]);

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = verifySocketToken(token);
    if (!decoded) {
      return next(new Error('Invalid or expired authentication token'));
    }

    socket.user = decoded;
    socket.userId = Number(decoded.id);
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Track user active sockets
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join personal notification room
    socket.join(`user:${userId}`);

    // If this is user's first active connection, broadcast online status
    if (userSockets.get(userId).size === 1) {
      UserModel.updateStatus(userId, 'online');
      io.emit('user_presence', {
        userId,
        status: 'online',
        lastSeen: new Date().toISOString()
      });
    }

    // Client can query online status of a set of userIds
    socket.on('check_presence', (userIds, callback) => {
      if (Array.isArray(userIds) && typeof callback === 'function') {
        const statuses = {};
        for (const id of userIds) {
          const numId = Number(id);
          statuses[numId] = (userSockets.has(numId) && userSockets.get(numId).size > 0)
            ? 'online'
            : 'offline';
        }
        callback(statuses);
      }
    });

    // Join a conversation room
    socket.on('join_conversation', (conversationId, callback) => {
      const convId = Number(conversationId);
      if (ConversationModel.isMember(convId, userId)) {
        socket.join(`chat:${convId}`);
        if (typeof callback === 'function') callback({ success: true });
      }
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId, callback) => {
      socket.leave(`chat:${Number(conversationId)}`);
      if (typeof callback === 'function') callback({ success: true });
    });

    // Send a real-time message
    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, content, type, fileUrl, fileName, fileSize, fileMime } = data;
        const convId = Number(conversationId);

        if (!ConversationModel.isMember(convId, userId)) {
          if (typeof callback === 'function') {
            return callback({ success: false, error: 'Unauthorized to post to this chat' });
          }
          return;
        }

        const members = ConversationModel.getMembers(convId);

        // Determine initial status:
        // In 1-on-1: check if recipient has active socket
        let initialStatus = 'sent';
        const otherMember = members.find(m => m.id !== userId);
        if (otherMember && userSockets.has(otherMember.id) && userSockets.get(otherMember.id).size > 0) {
          initialStatus = 'delivered';
        }

        const newMessage = MessageModel.create({
          conversationId: convId,
          senderId: userId,
          content: content || '',
          type: type || (fileUrl ? 'file' : 'text'),
          fileUrl,
          fileName,
          fileSize,
          fileMime,
          status: initialStatus
        });

        // Broadcast to chat room
        io.to(`chat:${convId}`).emit('new_message', newMessage);

        // Notify each member's private room to update sidebar & unread counts
        for (const member of members) {
          io.to(`user:${member.id}`).emit('conversation_updated', {
            conversationId: convId,
            lastMessage: newMessage,
            senderId: userId
          });
        }

        if (typeof callback === 'function') {
          callback({ success: true, message: newMessage });
        }
      } catch (err) {
        console.error('Socket send_message error:', err);
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    // Typing start
    socket.on('typing_start', ({ conversationId }) => {
      const convId = Number(conversationId);
      socket.to(`chat:${convId}`).emit('user_typing', {
        conversationId: convId,
        userId: socket.userId,
        name: socket.user.name,
        username: socket.user.username
      });
    });

    // Typing stop
    socket.on('typing_stop', ({ conversationId }) => {
      const convId = Number(conversationId);
      socket.to(`chat:${convId}`).emit('user_stopped_typing', {
        conversationId: convId,
        userId: socket.userId
      });
    });

    // Mark messages as read
    socket.on('message_read', ({ conversationId, messageId }) => {
      const convId = Number(conversationId);
      const readMsgId = Number(messageId);

      ConversationModel.markAsRead(convId, userId, readMsgId);

      // Broadcast read receipt to room
      io.to(`chat:${convId}`).emit('messages_read', {
        conversationId: convId,
        readByUserId: userId,
        lastReadMessageId: readMsgId
      });

      // Also notify members' personal rooms to update unread badge
      io.to(`user:${userId}`).emit('unread_cleared', { conversationId: convId });
    });

    // Acknowledge delivery
    socket.on('message_delivered', ({ messageId, conversationId }) => {
      const msgId = Number(messageId);
      MessageModel.updateStatus(msgId, 'delivered');

      io.to(`chat:${Number(conversationId)}`).emit('message_status_updated', {
        messageId: msgId,
        status: 'delivered'
      });
    });

    // Delete a message
    socket.on('delete_message', ({ messageId, conversationId }, callback) => {
      try {
        const msgId = Number(messageId);
        const convId = Number(conversationId);
        const deleted = MessageModel.deleteMessage(msgId, userId);

        io.to(`chat:${convId}`).emit('message_deleted', {
          messageId: msgId,
          conversationId: convId,
          message: deleted
        });

        // Notify member rooms for lastMessage preview update
        const members = ConversationModel.getMembers(convId);
        for (const member of members) {
          io.to(`user:${member.id}`).emit('conversation_updated', {
            conversationId: convId,
            lastMessage: deleted,
            senderId: userId
          });
        }

        if (typeof callback === 'function') {
          callback({ success: true, message: deleted });
        }
      } catch (err) {
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          const lastSeen = new Date().toISOString();
          UserModel.updateStatus(userId, 'offline', lastSeen);

          io.emit('user_presence', {
            userId,
            status: 'offline',
            lastSeen
          });
        }
      }
    });
  });
}

module.exports = { initSocketManager, userSockets };
