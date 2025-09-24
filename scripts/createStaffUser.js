const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createStaffUser() {
  try {
    // เช็คว่ามี staff user อยู่แล้วหรือไม่
    const existingStaff = await prisma.user.findUnique({
      where: { username: 'staff' }
    });
    
    if (existingStaff) {
      console.log('มี staff user อยู่แล้ว:', existingStaff.username);
      return;
    }

    // สร้าง staff user
    const passwordHash = await bcrypt.hash('staff123', 10);
    const user = await prisma.user.create({
      data: {
        username: 'staff',
        password: passwordHash,
        role: 'staff',
        teams: ['HCA'],
        adserView: ['Boogey', 'Bubble']
      }
    });
    
    console.log('สร้าง staff user สำเร็จ:', {
      id: user.id,
      username: user.username,
      role: user.role,
      teams: user.teams,
      adserView: user.adserView
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStaffUser();