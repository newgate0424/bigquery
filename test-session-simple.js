// Simple test for single session functionality
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // For testing only

async function testSingleSession() {
  const BASE_URL = 'http://localhost:3000';
  
  console.log('🧪 Testing Single Session System...\n');

  // Test credentials - adjust as needed  
  const credentials = {
    username: 'newgate',  // change to your username
    password: 'newgate123'  // change to your password
  };

  try {
    // Test 1: First login
    console.log('1️⃣ First login...');
    const login1 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const loginData1 = await login1.json();
    console.log('Status:', login1.status);
    console.log('Message:', loginData1.message || loginData1.error);
    
    if (!login1.ok) {
      console.error('❌ First login failed');
      return;
    }

    const token1 = loginData1.token;
    console.log('Token 1:', token1.substring(0, 30) + '...\n');

    // Test 2: Check first session
    console.log('2️⃣ Checking first session...');
    const sessionCheck1 = await fetch(`${BASE_URL}/api/auth/session-check`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    
    const sessionData1 = await sessionCheck1.json();
    console.log('Session valid:', sessionData1.sessionValid);
    console.log('User:', sessionData1.user?.username);
    console.log('');

    // Test 3: Second login (different device)
    console.log('3️⃣ Second login (new device)...');
    const login2 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'TestDevice2/Mobile'
      },
      body: JSON.stringify(credentials)
    });

    const loginData2 = await login2.json();
    console.log('Status:', login2.status);
    console.log('Message:', loginData2.message);
    
    const token2 = loginData2.token;
    console.log('Token 2:', token2.substring(0, 30) + '...\n');

    // Test 4: Check if first token is still valid
    console.log('4️⃣ Checking if first token is invalidated...');
    const sessionCheck2 = await fetch(`${BASE_URL}/api/auth/session-check`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    
    const sessionData2 = await sessionCheck2.json();
    console.log('First token valid:', sessionData2.sessionValid);
    if (sessionData2.reason) {
      console.log('Reason:', sessionData2.reason);
    }
    console.log('');

    // Test 5: Check second session
    console.log('5️⃣ Checking second session...');
    const sessionCheck3 = await fetch(`${BASE_URL}/api/auth/session-check`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    
    const sessionData3 = await sessionCheck3.json();
    console.log('Second token valid:', sessionData3.sessionValid);
    console.log('');

    // Summary
    console.log('📊 SUMMARY:');
    if (!sessionData2.sessionValid && sessionData3.sessionValid) {
      console.log('✅ Single session working correctly!');
      console.log('   - Old session was invalidated');
      console.log('   - New session is active');
    } else {
      console.log('❌ Single session NOT working:');
      console.log('   - Old session valid:', sessionData2.sessionValid);
      console.log('   - New session valid:', sessionData3.sessionValid);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testSingleSession();