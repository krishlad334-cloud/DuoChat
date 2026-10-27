const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', ChatController.getChats);
router.post('/direct', ChatController.createDirectChat);
router.post('/group', ChatController.createGroupChat);
router.get('/:id', ChatController.getChatDetails);
router.post('/:id/members', ChatController.addMember);
router.delete('/:id/members/:userId', ChatController.removeMember);
router.post('/:id/read', ChatController.markAsRead);
router.delete('/:id', ChatController.deleteChat);
router.post('/:id/clear', ChatController.clearChat);
router.post('/:id/archive', ChatController.toggleArchive);
router.post('/:id/mute', ChatController.toggleMute);
router.post('/:id/pin', ChatController.togglePin);
router.post('/:id/unread', ChatController.markUnread);

module.exports = router;
