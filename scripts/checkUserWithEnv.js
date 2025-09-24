require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('Checking database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
    
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`);
      console.log(`  Teams: ${JSON.stringify(user.teams)}`);
      console.log(`  AdserView: ${JSON.stringify(user.adserView)}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();