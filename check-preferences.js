import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPreferences() {
  try {
    console.log('Checking user preferences in database...');
    
    // ดูข้อมูล users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true
      }
    });
    
    console.log('Users in database:', users);
    
    // ดูข้อมูล preferences
    const preferences = await prisma.userPreferences.findMany({
      include: {
        user: {
          select: {
            username: true,
            role: true
          }
        }
      }
    });
    
    console.log('\nPreferences in database:');
    preferences.forEach((pref, index) => {
      console.log(`\n--- Preference ${index + 1} ---`);
      console.log(`User: ${pref.user.username} (${pref.user.role})`);
      console.log(`ID: ${pref.id}, User ID: ${pref.userId}`);
      console.log(`Created: ${pref.createdAt}`);
      console.log(`Updated: ${pref.updatedAt}`);
      
      if (pref.filterSettings) {
        console.log('Filter Settings:', JSON.stringify(pref.filterSettings, null, 2));
      } else {
        console.log('Filter Settings: None');
      }
      
      if (pref.columnVisibility) {
        const visibleColumns = Object.entries(pref.columnVisibility).filter(([_, visible]) => visible);
        console.log(`Column Visibility: ${visibleColumns.length} columns visible`);
        console.log('Visible columns:', visibleColumns.map(([col, _]) => col).join(', '));
      } else {
        console.log('Column Visibility: None');
      }
      
      if (pref.colorConfiguration) {
        const colorKeys = Object.keys(pref.colorConfiguration);
        console.log(`Color Configuration: ${colorKeys.length} columns configured`);
        console.log('Color columns:', colorKeys.join(', '));
      } else {
        console.log('Color Configuration: None');
      }
    });
    
  } catch (error) {
    console.error('Error checking preferences:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPreferences();