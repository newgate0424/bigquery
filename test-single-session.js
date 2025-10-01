// Script for testing single session functionality
const testSingleSession = async () => {
  const BASE_URL = 'http://localhost:3000';
  
  console.log('🧪 Testing Single Session System...\n');

  // Test credentials
  const credentials = {
    username: 'newgate',
    password: 'newgate123' // แก้ไขรหัสผ่านตามที่ใช้จริง
  };

  try {
    // Test 1: First login
    console.log('1️⃣ Testing first login...');
    const login1 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const loginData1 = await login1.json();
    console.log('First login response:', login1.status, loginData1.message || loginData1.error);
    
    if (!login1.ok) {
      console.error('❌ First login failed:', loginData1.error);
      return;
    }

    const token1 = loginData1.token;
    console.log('First login token:', token1.substring(0, 30) + '...\n');

    // Test 2: Check sessions
    console.log('2️⃣ Checking active sessions...');
    const sessionsCheck1 = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    
    const sessionsData1 = await sessionsCheck1.json();
    console.log('Active sessions count:', sessionsData1.totalSessions);
    console.log('Current session device:', sessionsData1.sessions?.[0]?.deviceInfo);
    console.log('');

    // Test 3: Second login (should invalidate first session)
    console.log('3️⃣ Testing second login (should force logout first session)...');
    const login2 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const loginData2 = await login2.json();
    console.log('Second login response:', login2.status, loginData2.message || loginData2.error);
    
    const token2 = loginData2.token;
    console.log('Second login token:', token2.substring(0, 30) + '...\n');

    // Test 4: Check if first token is invalidated
    console.log('4️⃣ Testing if first token is invalidated...');
    const testFirstToken = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    
    if (testFirstToken.status === 401) {
      console.log('✅ First token correctly invalidated');
    } else {
      console.log('❌ First token still valid (unexpected)');
    }

    // Test 5: Check sessions with second token
    console.log('5️⃣ Checking sessions with second token...');
    const sessionsCheck2 = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    
    const sessionsData2 = await sessionsCheck2.json();
    console.log('Active sessions count:', sessionsData2.totalSessions);
    console.log('Should be 1 (single session):', sessionsData2.totalSessions === 1 ? '✅' : '❌');
    console.log('');

    // Test 6: Logout
    console.log('6️⃣ Testing logout...');
    const logout = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    
    const logoutData = await logout.json();
    console.log('Logout response:', logout.status, logoutData.message);

    // Test 7: Check if token is invalidated after logout
    console.log('7️⃣ Testing if token is invalidated after logout...');
    const testAfterLogout = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    
    if (testAfterLogout.status === 401) {
      console.log('✅ Token correctly invalidated after logout');
    } else {
      console.log('❌ Token still valid after logout (unexpected)');
    }

    console.log('\n🎉 Single session test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testSingleSession();