const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  try {
    // เช็คว่ามี user อยู่แล้วหรือไม่
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      console.log('มี user อยู่แล้ว:', existingUser.username);
      return;
    }

    // สร้าง admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password: passwordHash,
        role: 'admin'
      }
    });
    
    console.log('สร้าง user สำเร็จ:', {
      id: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();