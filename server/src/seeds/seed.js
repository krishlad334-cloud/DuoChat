const bcrypt = require('bcryptjs');
const db = require('../config/db');
const UserModel = require('../models/userModel');
const ConversationModel = require('../models/conversationModel');
const MessageModel = require('../models/messageModel');

async function seed() {
  console.log('\x1b[34m%s\x1b[0m', '🌱 Seeding Duo Chat Database...');

  // Clear existing data safely
  db.exec('DELETE FROM messages;');
  db.exec('DELETE FROM conversation_members;');
  db.exec('DELETE FROM conversations;');
  db.exec('DELETE FROM users;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'conversations', 'conversation_members', 'messages');");

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const rahul = UserModel.create({
    username: 'rahul',
    email: 'rahul@example.com',
    password: hashedPassword,
    name: 'Rahul Sharma',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rahul+Sharma&backgroundColor=3b82f6'
  });

  const priya = UserModel.create({
    username: 'priya',
    email: 'priya@example.com',
    password: hashedPassword,
    name: 'Priya Patel',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya+Patel&backgroundColor=ec4899'
  });

  const alex = UserModel.create({
    username: 'alex',
    email: 'alex@example.com',
    password: hashedPassword,
    name: 'Alex Morgan',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Morgan&backgroundColor=10b981'
  });

  console.log('✔ Created test users:');
  console.log('   - rahul / password123 (Rahul Sharma)');
  console.log('   - priya / password123 (Priya Patel)');
  console.log('   - alex  / password123 (Alex Morgan)');

  // 2. Create 1-to-1 conversation between Rahul and Priya
  const directChat = ConversationModel.findOrCreateDirect(rahul.id, priya.id);

  // Add initial messages
  const m1 = MessageModel.create({
    conversationId: directChat.id,
    senderId: rahul.id,
    content: 'Hey Priya! Welcome to Duo Chat 🚀',
    type: 'text',
    status: 'read'
  });

  const m2 = MessageModel.create({
    conversationId: directChat.id,
    senderId: priya.id,
    content: 'Hi Rahul! The real-time messaging is so fast and smooth! 😍',
    type: 'text',
    status: 'read'
  });

  const m3 = MessageModel.create({
    conversationId: directChat.id,
    senderId: rahul.id,
    content: 'Check out the tick status indicators, file sharing, and dark mode toggle!',
    type: 'text',
    status: 'delivered'
  });

  // Mark read up to m2 for Priya, and m2 for Rahul
  ConversationModel.markAsRead(directChat.id, rahul.id, m2.id);
  ConversationModel.markAsRead(directChat.id, priya.id, m2.id);

  // 3. Create Group Chat: "Product Team"
  const groupChat = ConversationModel.createGroup({
    title: 'Product Team 💡',
    creatorId: rahul.id,
    memberIds: [priya.id, alex.id]
  });

  MessageModel.create({
    conversationId: groupChat.id,
    senderId: rahul.id,
    content: 'Welcome team! This is our dedicated workspace for real-time collaboration.',
    type: 'text',
    status: 'sent'
  });

  MessageModel.create({
    conversationId: groupChat.id,
    senderId: alex.id,
    content: 'Awesome! Glad to be here everyone 🙌',
    type: 'text',
    status: 'sent'
  });

  console.log('✔ Created initial direct chat and Product Team group chat.');
  console.log('\x1b[32m%s\x1b[0m', '✅ Seeding completed successfully!\n');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
