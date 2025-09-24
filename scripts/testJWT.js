require('dotenv').config({ path: '.env.local' });

console.log('Environment variables check:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (length: ' + process.env.JWT_SECRET.length + ')' : 'Not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID ? 'Set' : 'Not set');

const jwt = require('jsonwebtoken');

// ทดสอบการสร้าง JWT token
const testPayload = { id: 1, username: 'test', role: 'admin' };
try {
  const token = jwt.sign(testPayload, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
  console.log('JWT Token generation: SUCCESS');
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // ทดสอบการ verify
  const verified = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
  console.log('JWT Token verification: SUCCESS');
  console.log('Verified payload:', verified);
} catch (error) {
  console.log('JWT Error:', error.message);
}