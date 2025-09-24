const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    // รีเซ็ตรหัสผ่านเป็น "newgate123"
    const newPassword = 'newgate123';
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    const updatedUser = await prisma.user.update({
      where: { username: 'newgate' },
      data: { password: passwordHash }
    });
    
    console.log('รีเซ็ตรหัสผ่านสำเร็จ!');
    console.log('Username:', updatedUser.username);
    console.log('รหัสผ่านใหม่:', newPassword);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();