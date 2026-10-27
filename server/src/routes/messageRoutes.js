const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticateToken);

// Message operations
router.get('/chats/:id/messages', MessageController.getMessages);
router.post('/chats/:id/messages', MessageController.sendMessage);
router.delete('/messages/:id', MessageController.deleteMessage);

// File uploads
router.post('/upload', upload.single('file'), MessageController.uploadFile);

module.exports = router;
