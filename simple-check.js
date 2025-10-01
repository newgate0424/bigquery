const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPreferences() {
  try {
    console.log('Checking user preferences in database...');
    
    // ดูข้อมูล preferences ของ user ID 1
    const preferences = await prisma.userPreferences.findMany({
      where: {
        userId: 1
      }
    });
    
    console.log(`Found ${preferences.length} preference records for user ID 1`);
    
    preferences.forEach((pref, index) => {
      console.log(`\n--- Preference ${index + 1} ---`);
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
        console.log(`Column Visibility: ${visibleColumns.length} columns visible out of ${Object.keys(pref.columnVisibility).length} total`);
        
        // Show sample of visible columns
        const sampleVisible = visibleColumns.slice(0, 10).map(([col, _]) => col);
        console.log('Sample visible columns:', sampleVisible.join(', '));
      } else {
        console.log('Column Visibility: None');
      }
    });
    
  } catch (error) {
    console.error('Error checking preferences:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPreferences();