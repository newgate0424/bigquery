import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJwt } from '@/lib/jwt';

const prisma = new PrismaClient();

// Helper function to verify JWT token and get user ID
async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const auth = request.headers.get('authorization');
    if (!auth) return null;
    
    const token = auth.replace('Bearer ', '');
    const payload = verifyJwt(token);
    if (!payload) return null;

    // JWT payload contains id directly
    const userId = payload.id;
    if (!userId || typeof userId !== 'number') {
      console.log('Invalid userId in JWT payload:', userId, typeof userId);
      return null;
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    return user?.id || null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// GET - ดึงข้อมูล preferences ของ user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    // ถ้ายังไม่มี preferences ให้สร้างใหม่
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId
        }
      });
    }

    // Parse JSON strings back to objects for the client
    const parsedPreferences = {
      ...preferences,
      sidebarSettings: preferences.sidebarSettings ? 
        tryParseJSON(preferences.sidebarSettings) : null,
      themeSettings: preferences.themeSettings ? 
        tryParseJSON(preferences.themeSettings) : null,
      filterSettings: preferences.filterSettings ? 
        tryParseJSON(preferences.filterSettings) : null,
      columnVisibility: preferences.columnVisibility ? 
        tryParseJSON(preferences.columnVisibility) : null,
      columnWidths: preferences.columnWidths ? 
        tryParseJSON(preferences.columnWidths) : null,
      colorConfiguration: preferences.colorConfiguration ? 
        tryParseJSON(preferences.colorConfiguration) : null,
      tableSettings: preferences.tableSettings ? 
        tryParseJSON(preferences.tableSettings) : null,
    };

    return NextResponse.json(parsedPreferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to safely parse JSON
function tryParseJSON(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

// POST/PUT - บันทึกหรืออัปเดต preferences
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      sidebarSettings,
      themeSettings,
      filterSettings, 
      columnVisibility,
      columnWidths,
      colorConfiguration, 
      tableSettings 
    } = body;

    // Convert objects to JSON strings for database storage
    const updateData: any = {};
    const createData: any = { userId };

    if (sidebarSettings !== undefined) {
      updateData.sidebarSettings = JSON.stringify(sidebarSettings);
      createData.sidebarSettings = JSON.stringify(sidebarSettings);
    }
    if (themeSettings !== undefined) {
      updateData.themeSettings = JSON.stringify(themeSettings);
      createData.themeSettings = JSON.stringify(themeSettings);
    }
    if (filterSettings !== undefined) {
      updateData.filterSettings = JSON.stringify(filterSettings);
      createData.filterSettings = JSON.stringify(filterSettings);
    }
    if (columnVisibility !== undefined) {
      updateData.columnVisibility = JSON.stringify(columnVisibility);
      createData.columnVisibility = JSON.stringify(columnVisibility);
    }
    if (columnWidths !== undefined) {
      updateData.columnWidths = JSON.stringify(columnWidths);
      createData.columnWidths = JSON.stringify(columnWidths);
    }
    if (colorConfiguration !== undefined) {
      updateData.colorConfiguration = JSON.stringify(colorConfiguration);
      createData.colorConfiguration = JSON.stringify(colorConfiguration);
    }
    if (tableSettings !== undefined) {
      updateData.tableSettings = JSON.stringify(tableSettings);
      createData.tableSettings = JSON.stringify(tableSettings);
    }

    // ใช้ upsert เพื่อสร้างใหม่หรืออัปเดต
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: createData
    });

    // Parse the saved preferences back to objects for the response
    const parsedPreferences = {
      ...preferences,
      sidebarSettings: preferences.sidebarSettings ? 
        tryParseJSON(preferences.sidebarSettings) : null,
      themeSettings: preferences.themeSettings ? 
        tryParseJSON(preferences.themeSettings) : null,
      filterSettings: preferences.filterSettings ? 
        tryParseJSON(preferences.filterSettings) : null,
      columnVisibility: preferences.columnVisibility ? 
        tryParseJSON(preferences.columnVisibility) : null,
      columnWidths: preferences.columnWidths ? 
        tryParseJSON(preferences.columnWidths) : null,
      colorConfiguration: preferences.colorConfiguration ? 
        tryParseJSON(preferences.colorConfiguration) : null,
      tableSettings: preferences.tableSettings ? 
        tryParseJSON(preferences.tableSettings) : null,
    };

    return NextResponse.json(parsedPreferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - อัปเดตเฉพาะส่วนที่ต้องการ
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { type, data } = body; // type: 'sidebar' | 'theme' | 'filter' | 'columns' | 'widths' | 'colors' | 'table'
    
    if (!type || data === undefined) {
      console.error('Missing required fields:', { type, data });
      return NextResponse.json({ error: 'Missing required fields: type and data' }, { status: 400 });
    }

    // Convert data to JSON string for database storage
    const jsonData = JSON.stringify(data);

    const updateData: Record<string, string> = {};
    const createData: any = { userId };

    switch (type) {
      case 'sidebar':
        updateData.sidebarSettings = jsonData;
        createData.sidebarSettings = jsonData;
        break;
      case 'theme':
        updateData.themeSettings = jsonData;
        createData.themeSettings = jsonData;
        break;
      case 'filter':
        updateData.filterSettings = jsonData;
        createData.filterSettings = jsonData;
        break;
      case 'columns':
        updateData.columnVisibility = jsonData;
        createData.columnVisibility = jsonData;
        break;
      case 'widths':
        updateData.columnWidths = jsonData;
        createData.columnWidths = jsonData;
        break;
      case 'colors':
        updateData.colorConfiguration = jsonData;
        createData.colorConfiguration = jsonData;
        break;
      case 'table':
        updateData.tableSettings = jsonData;
        createData.tableSettings = jsonData;
        break;
      default:
        return NextResponse.json({ error: 'Invalid preference type' }, { status: 400 });
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: createData
    });

    // Parse the updated preferences back to objects for the response
    const parsedPreferences = {
      ...preferences,
      sidebarSettings: preferences.sidebarSettings ? 
        tryParseJSON(preferences.sidebarSettings) : null,
      themeSettings: preferences.themeSettings ? 
        tryParseJSON(preferences.themeSettings) : null,
      filterSettings: preferences.filterSettings ? 
        tryParseJSON(preferences.filterSettings) : null,
      columnVisibility: preferences.columnVisibility ? 
        tryParseJSON(preferences.columnVisibility) : null,
      columnWidths: preferences.columnWidths ? 
        tryParseJSON(preferences.columnWidths) : null,
      colorConfiguration: preferences.colorConfiguration ? 
        tryParseJSON(preferences.colorConfiguration) : null,
      tableSettings: preferences.tableSettings ? 
        tryParseJSON(preferences.tableSettings) : null,
    };

    return NextResponse.json(parsedPreferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}