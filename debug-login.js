// Debug script to test login functionality
const testLogin = async () => {
  try {
    console.log('Testing login API...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'newgate',
        password: 'your_password_here' // Replace with actual password
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token ? data.token.substring(0, 20) + '...' : 'No token');
      console.log('User:', data.user);
    } else {
      console.log('❌ Login failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

testLogin();