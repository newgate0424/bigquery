const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users ที่มีอยู่:');
    users.forEach(user => {
      console.log({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        passwordHash: user.password.substring(0, 20) + '...'
      });
    });

    // ทดสอบ verify password
    if (users.length > 0) {
      const user = users[0];
      console.log('\nทดสอบ password กับ user:', user.username);
      
      // ลองรหัสผ่านต่างๆ
      const passwords = ['newgate', 'admin123', '123456', 'password'];
      
      for (const password of passwords) {
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`รหัสผ่าน "${password}": ${isValid ? 'ถูกต้อง' : 'ไม่ถูกต้อง'}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();