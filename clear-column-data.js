const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearColumnVisibility() {
  try {
    console.log('Clearing corrupted column visibility data...');
    
    // อัปเดต column visibility ให้เป็น null
    const result = await prisma.userPreferences.updateMany({
      where: {
        userId: 1
      },
      data: {
        columnVisibility: null
      }
    });
    
    console.log(`Updated ${result.count} preference records`);
    console.log('Column visibility data cleared successfully');
    
  } catch (error) {
    console.error('Error clearing column visibility:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearColumnVisibility();