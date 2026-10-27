const UserModel = require('../models/userModel');

const UserController = {
  searchUsers(req, res, next) {
    try {
      const q = req.query.q || '';
      if (!q.trim()) {
        const users = UserModel.getAllExcept(req.user.id);
        return res.json({ success: true, users });
      }

      const users = UserModel.search(q.trim(), req.user.id);
      res.json({ success: true, users });
    } catch (err) {
      next(err);
    }
  },

  lookupByPhone(req, res, next) {
    try {
      const phone = req.query.phone || '';
      if (!phone.trim()) {
        return res.status(400).json({ success: false, error: 'Phone number is required.' });
      }
      const user = UserModel.findByPhone(phone.trim());
      if (!user || user.id === req.user.id) {
        return res.json({ success: true, user: null });
      }
      res.json({ success: true, user: UserModel.findById(user.id) });
    } catch (err) {
      next(err);
    }
  },

  getAllUsers(req, res, next) {
    try {
      const users = UserModel.getAllExcept(req.user.id);
      res.json({ success: true, users });
    } catch (err) {
      next(err);
    }
  },

  getUserProfile(req, res, next) {
    try {
      const userId = Number(req.params.id);
      const user = UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = UserController;
