const { io } = require('./client/node_modules/socket.io-client');

async function runTest() {
  console.log('🧪 Starting Duo Chat Automated End-to-End Verification...');

  // 1. Test HTTP Health Check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthJson = await healthRes.json();
  console.log('✔ Health Check:', healthJson);
  if (healthJson.status !== 'ok') throw new Error('Health check failed');

  // 2. Test Login for Rahul
  const rahulRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'rahul', password: 'password123' })
  });
  const rahulData = await rahulRes.json();
  if (!rahulData.success) throw new Error('Rahul login failed: ' + rahulData.error);
  console.log('✔ Logged in Rahul:', rahulData.user.username);
  const rahulToken = rahulData.token;

  // 3. Test Login for Priya
  const priyaRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'priya', password: 'password123' })
  });
  const priyaData = await priyaRes.json();
  if (!priyaData.success) throw new Error('Priya login failed: ' + priyaData.error);
  console.log('✔ Logged in Priya:', priyaData.user.username);
  const priyaToken = priyaData.token;

  // 4. Connect Sockets for both Rahul and Priya
  const rahulSocket = io('http://localhost:5000', {
    auth: { token: rahulToken },
    transports: ['websocket']
  });

  const priyaSocket = io('http://localhost:5000', {
    auth: { token: priyaToken },
    transports: ['websocket']
  });

  await Promise.all([
    new Promise(res => rahulSocket.on('connect', res)),
    new Promise(res => priyaSocket.on('connect', res))
  ]);
  console.log('✔ Both Rahul and Priya connected via Socket.IO authenticated');

  // 5. Get or create Direct Chat between Rahul and Priya
  const chatRes = await fetch('http://localhost:5000/api/chats/direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${rahulToken}`
    },
    body: JSON.stringify({ targetUserId: priyaData.user.id })
  });
  const chatData = await chatRes.json();
  if (!chatData.success) throw new Error('Failed to create/get direct chat');
  const convId = chatData.conversation.id;
  console.log('✔ Direct Chat conversation ID:', convId);

  // Join conversation rooms and wait for callbacks
  await Promise.all([
    new Promise(res => rahulSocket.emit('join_conversation', convId, res)),
    new Promise(res => priyaSocket.emit('join_conversation', convId, res))
  ]);
  console.log('✔ Both sockets joined room chat:' + convId);

  // 6. Test Typing Indicator
  const typingPromise = new Promise((resolve) => {
    priyaSocket.once('user_typing', (data) => {
      console.log('✔ Priya received typing indicator from:', data.name);
      resolve(data);
    });
  });
  rahulSocket.emit('typing_start', { conversationId: convId });
  await typingPromise;

  // 7. Test Real-time Message Delivery
  const messageContent = 'Live test message from Rahul at ' + new Date().toISOString();
  const receivePromise = new Promise((resolve) => {
    priyaSocket.once('new_message', (msg) => {
      console.log('✔ Priya received new_message event:', msg.content, '| status:', msg.status);
      resolve(msg);
    });
  });

  const sendPromise = new Promise((resolve) => {
    rahulSocket.emit('send_message', {
      conversationId: convId,
      content: messageContent,
      type: 'text'
    }, (ack) => {
      console.log('✔ Rahul send_message acknowledged:', ack.success);
      resolve(ack.message);
    });
  });

  const [receivedMsg] = await Promise.all([receivePromise, sendPromise]);

  // 8. Test Read Receipt
  const readReceiptPromise = new Promise((resolve) => {
    rahulSocket.once('messages_read', (data) => {
      console.log('✔ Rahul received messages_read receipt for message ID:', data.lastReadMessageId);
      resolve(data);
    });
  });

  priyaSocket.emit('message_read', {
    conversationId: convId,
    messageId: receivedMsg.id
  });

  await readReceiptPromise;

  // 9. Test Message Deletion
  const deletePromise = new Promise((resolve) => {
    priyaSocket.once('message_deleted', (data) => {
      console.log('✔ Priya received message_deleted event for message ID:', data.messageId);
      resolve(data);
    });
  });

  rahulSocket.emit('delete_message', {
    conversationId: convId,
    messageId: receivedMsg.id
  });

  await deletePromise;

  // Cleanup
  rahulSocket.disconnect();
  priyaSocket.disconnect();

  console.log('\n🎉 ALL REAL-TIME TESTS PASSED SUCCESSFULLY! Duo Chat is 100% operational.');
  process.exit(0);
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
