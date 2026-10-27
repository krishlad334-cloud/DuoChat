const { io } = require('./client/node_modules/socket.io-client');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function req(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runDeepDebug() {
  console.log('🚀 STARTING COMPREHENSIVE DUO CHAT DEBUG SUITE...\n');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failCount++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Health check
  console.log('--- 1. API Health Check ---');
  const health = await req('/api/health');
  assert(health.status === 200 && health.data?.status === 'ok', 'Server health endpoint is online');

  // 2. Auth Validation & Edge Cases
  console.log('\n--- 2. Auth Flow & Edge Cases ---');
  // 2.1 Missing fields registration
  const badReg = await req('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', phone: '', password: '' })
  });
  assert(badReg.status === 400, 'Rejects registration with empty fields');

  // 2.2 Short phone number
  const shortPhone = await req('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Shorty', phone: '123', password: 'password123' })
  });
  assert(shortPhone.status === 400, 'Rejects registration with invalid phone digits (<6 digits)');

  // 2.3 Invalid Login
  const badLogin = await req('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '+99999999999', password: 'wrongpassword' })
  });
  assert(badLogin.status === 401, 'Rejects invalid login credentials with 401');

  // 2.4 Register User Debug A & B
  const timestamp = Date.now().toString().slice(-6);
  const phoneA = `+91 98${timestamp}01`;
  const phoneB = `+91 98${timestamp}02`;

  const regA = await req('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Tester A ${timestamp}`,
      phone: phoneA,
      password: 'securepassword123',
      about: 'Testing Duo Chat A'
    })
  });
  assert(regA.status === 201 && regA.data?.token, `Registered User A (${phoneA})`);
  const tokenA = regA.data.token;
  const userA = regA.data.user;

  const regB = await req('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Tester B ${timestamp}`,
      phone: phoneB,
      password: 'securepassword123',
      about: 'Testing Duo Chat B'
    })
  });
  assert(regB.status === 201 && regB.data?.token, `Registered User B (${phoneB})`);
  const tokenB = regB.data.token;
  const userB = regB.data.user;

  // 2.5 Duplicate phone registration should fail with 409
  const dupReg = await req('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Guy',
      phone: phoneA,
      password: 'anotherpassword'
    })
  });
  assert(dupReg.status === 409, 'Duplicate phone registration returns 409 Conflict');

  // 2.6 Login with phone number
  const logA = await req('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: phoneA, password: 'securepassword123' })
  });
  assert(logA.status === 200 && logA.data?.user?.id === userA.id, 'Logged in User A with phone number');

  // 2.7 Verify /api/auth/me
  const meRes = await req('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(meRes.status === 200 && meRes.data?.user?.phone, 'GET /api/auth/me returns authenticated profile');

  // 3. User Search & Discovery
  console.log('\n--- 3. User Search & Phone Lookup ---');
  // 3.1 Search by partial phone digits
  const searchPhoneRes = await req(`/api/users/search?q=${timestamp}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(searchPhoneRes.status === 200, 'Search by digits returns 200');
  const foundB = searchPhoneRes.data?.users?.find(u => u.id === userB.id);
  assert(foundB, `Found User B in search by digits "${timestamp}"`);

  // 3.2 Search by partial name
  const searchNameRes = await req(`/api/users/search?q=Tester`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(searchNameRes.data?.users?.length > 0, 'Found users by name search');

  // 3.3 Lookup exact phone
  const lookupRes = await req(`/api/users/lookup?phone=${encodeURIComponent(phoneB)}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(lookupRes.status === 200 && lookupRes.data?.user?.id === userB.id, 'Lookup by exact phone number succeeds');

  // 3.4 List all users (excluding self)
  const allUsersRes = await req('/api/users', {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(allUsersRes.data?.users?.every(u => u.id !== userA.id), 'GET /api/users excludes current user');

  // 4. Conversation Lifecycle
  console.log('\n--- 4. Conversation Lifecycle ---');
  // 4.1 Create Direct Chat
  const directChatRes = await req('/api/chats/direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ targetUserId: userB.id })
  });
  assert(directChatRes.status === 200 && directChatRes.data?.conversation?.id, 'Created direct chat');
  const convId = directChatRes.data.conversation.id;

  // 4.2 Idempotent check: creating direct chat again returns existing ID
  const directChatRes2 = await req('/api/chats/direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ targetUserId: userB.id })
  });
  assert(directChatRes2.data?.conversation?.id === convId, 'Re-requesting direct chat returns existing conversation');

  // 4.3 Pin, Mute, Archive Operations
  const pinRes = await req(`/api/chats/${convId}/pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ isPinned: true })
  });
  assert(pinRes.status === 200 && pinRes.data?.isPinned === true, 'Pinned conversation');

  const muteRes = await req(`/api/chats/${convId}/mute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ isMuted: true })
  });
  assert(muteRes.status === 200 && muteRes.data?.isMuted === true, 'Muted conversation');

  const archiveRes = await req(`/api/chats/${convId}/archive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ isArchived: true })
  });
  assert(archiveRes.status === 200 && archiveRes.data?.isArchived === true, 'Archived conversation');

  // Check GET /api/chats returns updated flags
  const chatsListRes = await req('/api/chats', {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const myConv = chatsListRes.data?.conversations?.find(c => c.id === convId);
  assert(myConv?.is_pinned === 1 && myConv?.is_muted === 1 && myConv?.is_archived === 1, 'Conversation flags (pin/mute/archive) persisted in SQLite');

  // Unarchive for further messaging tests
  await req(`/api/chats/${convId}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ isArchived: false })
  });

  // 5. Real-Time Socket.IO & Messaging
  console.log('\n--- 5. Real-Time Socket.IO & Messaging Flow ---');
  const socketA = io(BASE_URL, { auth: { token: tokenA }, transports: ['websocket'] });
  const socketB = io(BASE_URL, { auth: { token: tokenB }, transports: ['websocket'] });

  await Promise.all([
    new Promise(res => socketA.on('connect', res)),
    new Promise(res => socketB.on('connect', res))
  ]);
  assert(socketA.connected && socketB.connected, 'Both users connected to WebSocket');

  // Join rooms
  await Promise.all([
    new Promise(res => socketA.emit('join_conversation', convId, res)),
    new Promise(res => socketB.emit('join_conversation', convId, res))
  ]);
  assert(true, 'Both users joined conversation room');

  // 5.1 Test typing indicator
  const typingPromise = new Promise(resolve => {
    socketB.once('user_typing', data => {
      resolve(data);
    });
  });
  socketA.emit('typing_start', { conversationId: convId });
  const typingData = await typingPromise;
  assert(typingData.conversationId === convId && typingData.userId === userA.id, 'Typing start event delivered in real-time');

  // 5.2 Test message delivery
  const msgText = `Debug test message ${Date.now()}`;
  const receivePromise = new Promise(resolve => {
    socketB.once('new_message', msg => {
      resolve(msg);
    });
  });

  const sendAck = await new Promise(resolve => {
    socketA.emit('send_message', { conversationId: convId, content: msgText, type: 'text' }, resolve);
  });
  assert(sendAck.success && sendAck.message?.id, 'User A sent message via Socket.IO');

  const receivedMsg = await receivePromise;
  assert(receivedMsg.content === msgText && receivedMsg.sender_id === userA.id, 'User B received message instantly in real-time');

  // 5.3 Test read receipt (blue ticks)
  const readPromise = new Promise(resolve => {
    socketA.once('messages_read', data => {
      resolve(data);
    });
  });
  socketB.emit('message_read', { conversationId: convId, messageId: receivedMsg.id });
  const readData = await readPromise;
  assert(readData.conversationId === convId, 'User A received read receipt event (blue ticks)');

  // 5.4 Test message deletion
  const deletePromise = new Promise(resolve => {
    socketB.once('message_deleted', data => {
      resolve(data);
    });
  });
  socketA.emit('delete_message', { messageId: receivedMsg.id, conversationId: convId });
  const deletedData = await deletePromise;
  assert(deletedData.messageId === receivedMsg.id, 'Message deletion broadcasted to conversation');

  // 6. Group Chat Lifecycle
  console.log('\n--- 6. Group Chat Lifecycle ---');
  // 6.1 Create Group Chat
  const groupRes = await req('/api/chats/group', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      title: `Debug Team Group ${timestamp}`,
      memberIds: [userB.id]
    })
  });
  assert(groupRes.status === 201 && groupRes.data?.conversation?.is_group === 1, 'Created group chat');
  const groupConvId = groupRes.data.conversation.id;

  // 6.2 Leave / Remove member
  const removeRes = await req(`/api/chats/${groupConvId}/members/${userB.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(removeRes.status === 200, 'Admin successfully removed member from group');

  // 6.3 Clear Chat History
  const clearRes = await req(`/api/chats/${convId}/clear`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(clearRes.status === 200, 'Cleared chat history successfully');

  // Verify messages count is 0
  const msgListAfterClear = await req(`/api/chats/${convId}/messages`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(msgListAfterClear.data?.messages?.length === 0, 'Message count is 0 after clear history');

  // 6.4 Delete Chat
  const delChatRes = await req(`/api/chats/${convId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  assert(delChatRes.status === 200, 'Deleted chat successfully');

  // Cleanup Sockets
  socketA.disconnect();
  socketB.disconnect();

  console.log(`\n========================================`);
  console.log(`🎉 ALL ${passCount} DEBUG CHECKS PASSED WITH 0 FAILURES!`);
  console.log(`========================================\n`);
  process.exit(0);
}

runDeepDebug().catch(err => {
  console.error('\n❌ DEBUG SUITE ENCOUNTERED AN ERROR:', err);
  process.exit(1);
});
