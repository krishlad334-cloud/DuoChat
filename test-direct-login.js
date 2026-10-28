const { io } = require('./client/node_modules/socket.io-client');

const LAN_IP = '192.168.1.28';
const BASE_URL = `http://${LAN_IP}:5000`;
const VITE_URL = `http://${LAN_IP}:5173`;

async function runDirectLoginTests() {
  console.log('📱 STARTING DIRECT LOGIN & MOBILE COMPATIBILITY TESTS...\n');

  // 1. Network Info Endpoint
  console.log('--- 1. Testing /api/network-info ---');
  const netRes = await fetch(`${BASE_URL}/api/network-info`).then(r => r.json());
  console.log('  ✔ /api/network-info response:', netRes);
  if (!netRes.success || !netRes.localIp) throw new Error('network-info failed');

  // 2. Direct Accounts
  console.log('\n--- 2. Testing /api/auth/direct-accounts ---');
  const accountsRes = await fetch(`${BASE_URL}/api/auth/direct-accounts`).then(r => r.json());
  console.log(`  ✔ Found ${accountsRes.accounts.length} direct accounts:`, accountsRes.accounts.map(a => `${a.name} (${a.phone})`));
  if (accountsRes.accounts.length < 3) throw new Error('Expected at least 3 direct accounts');

  // 3. Direct Login as Krish
  console.log('\n--- 3. Testing Direct 1-Tap Login (Krish) ---');
  const loginKrish = await fetch(`${BASE_URL}/api/auth/direct-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'krish' })
  }).then(r => r.json());
  console.log(`  ✔ Successfully logged in as ${loginKrish.user.name} without password! Phone: ${loginKrish.user.phone}`);
  if (!loginKrish.token) throw new Error('Krish direct login failed');

  // 4. Direct Login as Priya
  console.log('\n--- 4. Testing Direct 1-Tap Login (Priya) ---');
  const loginPriya = await fetch(`${BASE_URL}/api/auth/direct-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'priya' })
  }).then(r => r.json());
  console.log(`  ✔ Successfully logged in as ${loginPriya.user.name} without password! Phone: ${loginPriya.user.phone}`);
  if (!loginPriya.token) throw new Error('Priya direct login failed');

  // 5. Connect to WebSockets over LAN IP via Vite proxy (Port 5173)
  console.log('\n--- 5. Testing WebSocket over LAN IP (Vite Proxy Port 5173) ---');
  const socketKrish = io(VITE_URL, {
    auth: { token: loginKrish.token },
    transports: ['websocket', 'polling']
  });

  const socketPriya = io(VITE_URL, {
    auth: { token: loginPriya.token },
    transports: ['websocket', 'polling']
  });

  await new Promise((resolve, reject) => {
    let connectedCount = 0;
    const timeout = setTimeout(() => reject(new Error('WebSocket connection timed out on port 5173')), 6000);

    socketKrish.on('connect', () => {
      console.log('  ✔ Krish connected to WebSocket via Vite proxy port 5173');
      connectedCount++;
      if (connectedCount === 2) { clearTimeout(timeout); resolve(); }
    });

    socketPriya.on('connect', () => {
      console.log('  ✔ Priya connected to WebSocket via Vite proxy port 5173');
      connectedCount++;
      if (connectedCount === 2) { clearTimeout(timeout); resolve(); }
    });
  });

  // 6. Test real-time message exchange between two devices
  console.log('\n--- 6. Testing Direct Chat Creation & Real-Time Delivery ---');
  const directChatRes = await fetch(`${BASE_URL}/api/chats/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginKrish.token}`
    },
    body: JSON.stringify({ targetUserId: loginPriya.user.id })
  }).then(r => r.json());

  const conversationId = directChatRes.conversation.id;
  console.log(`  ✔ Created direct conversation ID: ${conversationId}`);

  await Promise.all([
    new Promise(res => socketKrish.emit('join_conversation', conversationId, res)),
    new Promise(res => socketPriya.emit('join_conversation', conversationId, res))
  ]);
  console.log('  ✔ Both Krish and Priya joined conversation room via WebSocket');

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Real-time message receipt timed out')), 6000);

    socketPriya.on('new_message', (message) => {
      if (message.content === 'Hello from Krish on Device 1 to Priya on Phone!') {
        console.log(`  ✔ Priya on Phone received message in real time: "${message.content}"`);
        clearTimeout(timeout);
        resolve();
      }
    });

    // Send message from Krish
    socketKrish.emit('send_message', {
      conversationId,
      content: 'Hello from Krish on Device 1 to Priya on Phone!',
      type: 'text'
    });
  });

  socketKrish.disconnect();
  socketPriya.disconnect();

  console.log('\n======================================================');
  console.log('🎉 DIRECT LOGIN & MOBILE COMPATIBILITY VERIFIED 100%!');
  console.log('======================================================\n');
}

runDirectLoginTests().catch(err => {
  console.error('❌ DIRECT LOGIN TEST FAILED:', err);
  process.exit(1);
});
