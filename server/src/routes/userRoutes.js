const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/lookup', UserController.lookupByPhone);
router.get('/search', UserController.searchUsers);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserProfile);

module.exports = router;
