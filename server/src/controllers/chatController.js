const ConversationModel = require('../models/conversationModel');
const UserModel = require('../models/userModel');

const ChatController = {
  getChats(req, res, next) {
    try {
      const conversations = ConversationModel.getUserConversations(req.user.id);
      res.json({ success: true, conversations });
    } catch (err) {
      next(err);
    }
  },

  createDirectChat(req, res, next) {
    try {
      const { targetUserId } = req.body;
      const targetId = Number(targetUserId);

      if (!targetId || targetId === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Invalid target user ID.'
        });
      }

      const targetUser = UserModel.findById(targetId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: 'Recipient user not found.'
        });
      }

      const conversation = ConversationModel.findOrCreateDirect(req.user.id, targetId);
      res.status(200).json({ success: true, conversation });
    } catch (err) {
      next(err);
    }
  },

  createGroupChat(req, res, next) {
    try {
      const { title, memberIds } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Group name/title is required.'
        });
      }

      if (!Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please select at least one member to create a group.'
        });
      }

      const numericMemberIds = memberIds.map(Number).filter(id => !isNaN(id));
      const conversation = ConversationModel.createGroup({
        title: title.trim(),
        creatorId: req.user.id,
        memberIds: numericMemberIds
      });

      res.status(201).json({ success: true, conversation });
    } catch (err) {
      next(err);
    }
  },

  getChatDetails(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      const isMember = ConversationModel.isMember(conversationId, req.user.id);

      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'You are not a member of this conversation.'
        });
      }

      const conversation = ConversationModel.getById(conversationId, req.user.id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found.'
        });
      }

      res.json({ success: true, conversation });
    } catch (err) {
      next(err);
    }
  },

  addMember(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      const { userId } = req.body;
      const targetUserId = Number(userId);

      const conversation = ConversationModel.getById(conversationId, req.user.id);
      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found.' });
      }

      if (!conversation.is_group) {
        return res.status(400).json({ success: false, error: 'Cannot add members to a direct chat.' });
      }

      const targetUser = UserModel.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, error: 'User to add not found.' });
      }

      ConversationModel.addMember(conversationId, targetUserId, 'member');
      const updated = ConversationModel.getById(conversationId, req.user.id);

      res.json({ success: true, conversation: updated, addedUser: targetUser });
    } catch (err) {
      next(err);
    }
  },

  removeMember(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      const targetUserId = Number(req.params.userId);

      const conversation = ConversationModel.getById(conversationId, req.user.id);
      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found.' });
      }

      if (!conversation.is_group) {
        return res.status(400).json({ success: false, error: 'Cannot remove members from a direct chat.' });
      }

      // Check permission: either user is leaving themselves, or user is group creator/admin
      if (req.user.id !== targetUserId && conversation.creator_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Only group admin can remove other members.'
        });
      }

      ConversationModel.removeMember(conversationId, targetUserId);
      const updated = ConversationModel.getById(conversationId, req.user.id);

      res.json({ success: true, conversation: updated, removedUserId: targetUserId });
    } catch (err) {
      next(err);
    }
  },

  markAsRead(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      const { lastMessageId } = req.body;

      ConversationModel.markAsRead(conversationId, req.user.id, lastMessageId || null);
      res.json({ success: true, conversationId, lastMessageId });
    } catch (err) {
      next(err);
    }
  },

  deleteChat(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      ConversationModel.deleteConversation(conversationId, req.user.id);
      res.json({ success: true, conversationId, message: 'Chat deleted.' });
    } catch (err) {
      next(err);
    }
  },

  clearChat(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      ConversationModel.clearMessages(conversationId);
      res.json({ success: true, conversationId, message: 'Chat history cleared.' });
    } catch (err) {
      next(err);
    }
  },

  toggleArchive(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      const { isArchived } = req.body;
      ConversationModel.setArchived(conversationId, req.user.id, Boolean(isArchived));
      res.json({ success: true, conversationId, isArchived: Boolean(isArchived) });
    } catch (err) {
      next(err);
    }
  },

  toggleMute(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      const { isMuted } = req.body;
      ConversationModel.setMuted(conversationId, req.user.id, Boolean(isMuted));
      res.json({ success: true, conversationId, isMuted: Boolean(isMuted) });
    } catch (err) {
      next(err);
    }
  },

  togglePin(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      const { isPinned } = req.body;
      ConversationModel.setPinned(conversationId, req.user.id, Boolean(isPinned));
      res.json({ success: true, conversationId, isPinned: Boolean(isPinned) });
    } catch (err) {
      next(err);
    }
  },

  markUnread(req, res, next) {
    try {
      const conversationId = Number(req.params.id);
      ConversationModel.markAsUnread(conversationId, req.user.id);
      res.json({ success: true, conversationId, isUnread: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ChatController;
