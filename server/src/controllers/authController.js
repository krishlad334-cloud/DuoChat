const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const AuthController = {
  async register(req, res, next) {
    try {
      const { username, email, password, name, avatar } = req.body;

      // Validation
      if (!username || !email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Please fill in all required fields (username, email, password, name).'
        });
      }

      const cleanUsername = username.trim().toLowerCase();
      const cleanEmail = email.trim().toLowerCase();

      if (cleanUsername.length < 3 || cleanUsername.length > 25) {
        return res.status(400).json({
          success: false,
          error: 'Username must be between 3 and 25 characters.'
        });
      }

      if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
        return res.status(400).json({
          success: false,
          error: 'Username can only contain letters, numbers, underscores, periods, and hyphens.'
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long.'
        });
      }

      // Check duplicates
      const existingUser = UserModel.findByUsername(cleanUsername);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Username is already taken. Please choose another.'
        });
      }

      const existingEmail = UserModel.findByEmail(cleanEmail);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists.'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Default avatar if none
      const userAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=6366f1,3b82f6,10b981,f59e0b,ec4899`;

      const newUser = UserModel.create({
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        avatar: userAvatar
      });

      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        user: newUser,
        token
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please provide both username/email and password.'
        });
      }

      const cleanIdentifier = identifier.trim().toLowerCase();
      // Search by username or email
      let user = UserModel.findByUsername(cleanIdentifier);
      if (!user) {
        user = UserModel.findByEmail(cleanIdentifier);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. User not found.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. Incorrect password.'
        });
      }

      UserModel.updateStatus(user.id, 'online');
      const safeUser = UserModel.findById(user.id);
      const token = generateToken(safeUser);

      res.json({
        success: true,
        message: 'Logged in successfully.',
        user: safeUser,
        token
      });
    } catch (err) {
      next(err);
    }
  },

  getMe(req, res, next) {
    try {
      const user = UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  logout(req, res, next) {
    try {
      if (req.user && req.user.id) {
        UserModel.updateStatus(req.user.id, 'offline', new Date().toISOString());
      }
      res.json({ success: true, message: 'Logged out successfully.' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
