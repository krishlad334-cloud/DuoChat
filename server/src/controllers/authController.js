const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      username: user.username,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

const AuthController = {
  async register(req, res, next) {
    try {
      const { phone, name, password, username, email, about, avatar } = req.body;

      // Primary validation for WhatsApp-style registration: Phone, Name, Password
      if (!phone || !name || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please provide your Phone Number, Name, and Password.'
        });
      }

      const cleanPhone = phone.trim();
      const rawDigits = cleanPhone.replace(/[^0-9]/g, '');

      if (rawDigits.length < 6 || rawDigits.length > 16) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid phone number (at least 6 digits).'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long.'
        });
      }

      // Check duplicate phone
      const existingPhone = UserModel.findByPhone(cleanPhone);
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          error: 'An account with this phone number already exists. Please sign in.'
        });
      }

      // Fallback or unique username
      let cleanUsername = username ? username.trim().toLowerCase() : ('user_' + rawDigits);
      cleanUsername = cleanUsername.replace(/[^a-zA-Z0-9_.-]/g, '_');

      // Check if username already exists, if so append random suffix
      if (UserModel.findByUsername(cleanUsername)) {
        cleanUsername = `${cleanUsername}_${Math.floor(Math.random() * 1000)}`;
      }

      // Email (optional or derived)
      let cleanEmail = email ? email.trim().toLowerCase() : `${rawDigits}@whatsapp.local`;
      if (email && email.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          return res.status(400).json({
            success: false,
            error: 'Please enter a valid email address or leave it blank.'
          });
        }
        const existingEmail = UserModel.findByEmail(cleanEmail);
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            error: 'An account with this email already exists.'
          });
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Default WhatsApp style avatar
      const userAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=00a884,128c7e,25d366,008069`;

      const newUser = UserModel.create({
        phone: cleanPhone,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        about: about ? about.trim() : 'Hey there! I am using WhatsApp.',
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
          error: 'Please enter your phone number (or username) and password.'
        });
      }

      const user = UserModel.findByIdentifier(identifier);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'No account found with this phone number or username.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect password. Please try again.'
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
