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

module.exports = router;
