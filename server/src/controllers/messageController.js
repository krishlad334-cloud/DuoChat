const MessageModel = require('../models/messageModel');
const ConversationModel = require('../models/conversationModel');
const path = require('path');

const MessageController = {
  getMessages(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      const isMember = ConversationModel.isMember(conversationId, req.user.id);

      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view messages in this chat.'
        });
      }

      const limit = Math.min(Number(req.query.limit) || 30, 100);
      const beforeId = req.query.before ? Number(req.query.before) : null;

      const messages = MessageModel.getByConversation(conversationId, { limit, beforeId });
      const hasMore = messages.length === limit;

      res.json({
        success: true,
        messages,
        hasMore
      });
    } catch (err) {
      next(err);
    }
  },

  sendMessage(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      const isMember = ConversationModel.isMember(conversationId, req.user.id);

      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'You are not a member of this chat.'
        });
      }

      const { content, type, fileUrl, fileName, fileSize, fileMime } = req.body;

      if ((!content || !content.trim()) && !fileUrl) {
        return res.status(400).json({
          success: false,
          error: 'Message content or attachment is required.'
        });
      }

      const message = MessageModel.create({
        conversationId,
        senderId: req.user.id,
        content: content ? content.trim() : '',
        type: type || (fileUrl ? 'file' : 'text'),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize ? Number(fileSize) : null,
        fileMime: fileMime || null,
        status: 'sent'
      });

      res.status(201).json({ success: true, message });
    } catch (err) {
      next(err);
    }
  },

  deleteMessage(req, res, next) {
    try {
      const messageId = Number(req.params.id);
      const deletedMessage = MessageModel.deleteMessage(messageId, req.user.id);

      if (!deletedMessage) {
        return res.status(404).json({ success: false, error: 'Message not found.' });
      }

      res.json({ success: true, message: deletedMessage });
    } catch (err) {
      if (err.message === 'Not authorized to delete this message') {
        return res.status(403).json({ success: false, error: err.message });
      }
      next(err);
    }
  },

  uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded.'
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const isImage = req.file.mimetype.startsWith('image/');

      res.status(201).json({
        success: true,
        file: {
          url: fileUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileMime: req.file.mimetype,
          type: isImage ? 'image' : 'file'
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = MessageController;
