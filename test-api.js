#!/usr/bin/env node

// Quick API test script
// Run with: node test-api.js

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing World Battle API...\n');

  try {
    // Test 1: Create game
    console.log('1️⃣ Creating game...');
    const createResponse = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: 'TestPlayer' })
    });
    
    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status}`);
    }
    
    const createData = await createResponse.json();
    console.log('   ✅ Game created:', createData.gameId);
    const gameId = createData.gameId;

    // Test 2: Get game
    console.log('\n2️⃣ Getting game...');
    const getResponse = await fetch(`${API_URL}/games/${gameId}`);
    
    if (!getResponse.ok) {
      throw new Error(`Get failed: ${getResponse.status}`);
    }
    
    const getData = await getResponse.json();
    console.log('   ✅ Game found:', getData.game.players.length, 'player(s)');

    // Test 3: Join game
    console.log('\n3️⃣ Joining game...');
    const joinResponse = await fetch(`${API_URL}/games/${gameId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: 'TestPlayer2' })
    });
    
    if (!joinResponse.ok) {
      const error = await joinResponse.json();
      throw new Error(`Join failed: ${error.error?.message || joinResponse.status}`);
    }
    
    const joinData = await joinResponse.json();
    console.log('   ✅ Joined successfully:', joinData.game.players.length, 'player(s)');

    // Test 4: List games
    console.log('\n4️⃣ Listing games...');
    const listResponse = await fetch(`${API_URL}/games`);
    
    if (!listResponse.ok) {
      throw new Error(`List failed: ${listResponse.status}`);
    }
    
    const listData = await listResponse.json();
    console.log('   ✅ Total games:', listData.games.length);

    console.log('\n✅ All tests passed!');
    console.log('\nGame ID for testing UI:', gameId);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure API server is running: cd packages/api && npm run dev');
    process.exit(1);
  }
}

testAPI();
