// Script to check users in database
const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking database users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        adserView: true,
        teams: true
      }
    });
    
    console.log('Found users:');
    console.table(users);
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      console.log(`✅ Found ${users.length} user(s)`);
    }
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();