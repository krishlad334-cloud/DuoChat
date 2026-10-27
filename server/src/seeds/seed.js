const bcrypt = require('bcryptjs');
const db = require('../config/db');
const UserModel = require('../models/userModel');

async function seed() {
  console.log('\x1b[32m%s\x1b[0m', 'WhatsApp Web Database Initialized.');
  const count = db.prepare('SELECT count(*) as count FROM users').get();
  console.log(`Current registered users count: ${count.count}`);
  console.log('All user accounts stay permanently saved in the SQLite database.');
}

seed().catch(err => {
  console.error('Database check error:', err);
  process.exit(1);
});
