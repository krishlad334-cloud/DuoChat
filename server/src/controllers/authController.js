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
      let cleanEmail = email ? email.trim().toLowerCase() : `${rawDigits}@duochat.local`;
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

      // Default Duo Chat avatar
      const userAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=7c3aed,4f46e5`;

      const newUser = UserModel.create({
        phone: cleanPhone,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        about: about ? about.trim() : 'Hey there! I am using Duo Chat.',
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

  async directLogin(req, res, next) {
    try {
      const { identifier, phone, username } = req.body;
      const target = (identifier || phone || username || '').toString().trim();

      if (!target) {
        return res.status(400).json({
          success: false,
          error: 'Please specify an account to log in directly.'
        });
      }

      // Check if user exists by phone or username or email
      let user = UserModel.findByIdentifier(target);

      // If key is a known preset like 'krish', 'priya', 'rahul', 'alpha'
      if (!user) {
        const presets = {
          krish: { phone: '+919999988888', name: 'Krish', username: 'krish', about: 'Available on Duo Chat' },
          priya: { phone: '+919876543210', name: 'Priya', username: 'priya', about: 'Hey there! I am using Duo Chat.' },
          rahul: { phone: '+919876543211', name: 'Rahul', username: 'rahul', about: 'At work | Ping here anytime' },
          alpha: { phone: '+919111122222', name: 'User Alpha', username: 'alpha', about: 'Active tester on mobile device' }
        };
        const presetKey = target.toLowerCase().replace(/[^a-z]/g, '');
        const preset = presets[presetKey];
        if (preset) {
          user = UserModel.findByPhone(preset.phone) || UserModel.findByUsername(preset.username);
          if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            user = UserModel.create({
              phone: preset.phone,
              username: preset.username,
              password: hashedPassword,
              name: preset.name,
              about: preset.about,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(preset.name)}&backgroundColor=5288c1`
            });
          }
        }
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `Account "${target}" was not found. Please register or select another account.`
        });
      }

      UserModel.updateStatus(user.id, 'online');
      const safeUser = UserModel.findById(user.id);
      const token = generateToken(safeUser);

      res.json({
        success: true,
        message: `Directly logged in as ${safeUser.name}`,
        user: safeUser,
        token
      });
    } catch (err) {
      next(err);
    }
  },

  getDirectAccounts(req, res, next) {
    try {
      const presets = ['+919999988888', '+919876543210', '+919876543211', '+919111122222'];
      const users = [];
      for (const phone of presets) {
        const u = UserModel.findByPhone(phone);
        if (u) {
          users.push({
            id: u.id,
            name: u.name,
            phone: u.phone,
            username: u.username,
            about: u.about,
            avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=5288c1`
          });
        }
      }
      res.json({ success: true, accounts: users });
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
