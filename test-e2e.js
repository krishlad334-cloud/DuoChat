const { io } = require('./client/node_modules/socket.io-client');

async function runTest() {
  console.log('🧪 Starting WhatsApp Web Real-Time Phone Verification...');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthJson = await healthRes.json();
  console.log('✔ Health Check:', healthJson.status);

  // 2. Register/Login User A with Phone Number
  const phoneA = '+91 91111 22222';
  let tokenA, userA;
  try {
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User Alpha',
        phone: phoneA,
        password: 'password123',
        about: 'Hey there! I am using WhatsApp.'
      })
    });
    const regData = await regRes.json();
    if (regData.success) {
      tokenA = regData.token;
      userA = regData.user;
    } else {
      // If already registered, login
      const logRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phoneA, password: 'password123' })
      });
      const logData = await logRes.json();
      tokenA = logData.token;
      userA = logData.user;
    }
  } catch (e) {
    throw e;
  }
  console.log('✔ User A logged in with phone:', userA.phone, `(${userA.name})`);

  // 3. Register/Login User B with Phone Number
  const phoneB = '+91 93333 44444';
  let tokenB, userB;
  try {
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User Beta',
        phone: phoneB,
        password: 'password123',
        about: 'Available on WhatsApp.'
      })
    });
    const regData = await regRes.json();
    if (regData.success) {
      tokenB = regData.token;
      userB = regData.user;
    } else {
      const logRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phoneB, password: 'password123' })
      });
      const logData = await logRes.json();
      tokenB = logData.token;
      userB = logData.user;
    }
  } catch (e) {
    throw e;
  }
  console.log('✔ User B logged in with phone:', userB.phone, `(${userB.name})`);

  // 4. Test Search by Phone Number
  const searchRes = await fetch(`http://localhost:5000/api/users/search?q=93333`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const searchData = await searchRes.json();
  const foundUser = searchData.users?.find(u => u.id === userB.id);
  if (!foundUser) throw new Error('Failed to find User B by searching phone digits "93333"');
  console.log('✔ Found contact by phone search:', foundUser.name, foundUser.phone);

  // 5. Connect Sockets for both users
  const socketA = io('http://localhost:5000', {
    auth: { token: tokenA },
    transports: ['websocket']
  });
  const socketB = io('http://localhost:5000', {
    auth: { token: tokenB },
    transports: ['websocket']
  });

  await Promise.all([
    new Promise(res => socketA.on('connect', res)),
    new Promise(res => socketB.on('connect', res))
  ]);
  console.log('✔ Both users connected live to Socket.IO');

  // 6. User A starts chat with User B by their target user ID
  const chatRes = await fetch('http://localhost:5000/api/chats/direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ targetUserId: userB.id })
  });
  const chatData = await chatRes.json();
  const convId = chatData.conversation.id;
  console.log('✔ Direct chat created/retrieved, ID:', convId);

  // Both join room
  await Promise.all([
    new Promise(res => socketA.emit('join_conversation', convId, res)),
    new Promise(res => socketB.emit('join_conversation', convId, res))
  ]);

  // 7. Test Message Delivery
  const messageText = 'Hey! Sent via WhatsApp Web at ' + new Date().toLocaleTimeString();
  const receivePromise = new Promise(resolve => {
    socketB.once('new_message', msg => {
      console.log('✔ User B received new message:', msg.content, '| status:', msg.status);
      resolve(msg);
    });
  });

  const sendPromise = new Promise(resolve => {
    socketA.emit('send_message', {
      conversationId: convId,
      content: messageText,
      type: 'text'
    }, ack => {
      console.log('✔ User A send_message ack:', ack.success);
      resolve(ack.message);
    });
  });

  const [receivedMsg] = await Promise.all([receivePromise, sendPromise]);

  // 8. Test Read Receipt
  const readPromise = new Promise(resolve => {
    socketA.once('messages_read', data => {
      console.log('✔ User A received blue ticks (messages_read) for message ID:', data.lastReadMessageId);
      resolve(data);
    });
  });

  socketB.emit('message_read', {
    conversationId: convId,
    messageId: receivedMsg.id
  });

  await readPromise;

  // Cleanup
  socketA.disconnect();
  socketB.disconnect();

  console.log('\n🎉 ALL REAL-TIME PHONE & WHATSAPP TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
