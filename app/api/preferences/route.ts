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

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    // ใช้ upsert เพื่อสร้างใหม่หรืออัปเดต
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        ...(sidebarSettings !== undefined && { sidebarSettings }),
        ...(themeSettings !== undefined && { themeSettings }),
        ...(filterSettings !== undefined && { filterSettings }),
        ...(columnVisibility !== undefined && { columnVisibility }),
        ...(columnWidths !== undefined && { columnWidths }),
        ...(colorConfiguration !== undefined && { colorConfiguration }),
        ...(tableSettings !== undefined && { tableSettings }),
      },
      create: {
        userId,
        ...(sidebarSettings !== undefined && { sidebarSettings }),
        ...(themeSettings !== undefined && { themeSettings }),
        ...(filterSettings !== undefined && { filterSettings }),
        ...(columnVisibility !== undefined && { columnVisibility }),
        ...(columnWidths !== undefined && { columnWidths }),
        ...(colorConfiguration !== undefined && { colorConfiguration }),
        ...(tableSettings !== undefined && { tableSettings })
      }
    });

    return NextResponse.json(preferences);
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

      const updateData: Record<string, unknown> = {};    switch (type) {
      case 'sidebar':
        updateData.sidebarSettings = data;
        break;
      case 'theme':
        updateData.themeSettings = data;
        break;
      case 'filter':
        updateData.filterSettings = data;
        break;
      case 'columns':
        updateData.columnVisibility = data;
        break;
      case 'widths':
        updateData.columnWidths = data;
        break;
      case 'colors':
        updateData.colorConfiguration = data;
        break;
      case 'table':
        updateData.tableSettings = data;
        break;
      default:
        return NextResponse.json({ error: 'Invalid preference type' }, { status: 400 });
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...(type === 'sidebar' && { sidebarSettings: data }),
        ...(type === 'theme' && { themeSettings: data }),
        ...(type === 'filter' && { filterSettings: data }),
        ...(type === 'columns' && { columnVisibility: data }),
        ...(type === 'widths' && { columnWidths: data }),
        ...(type === 'colors' && { colorConfiguration: data }),
        ...(type === 'table' && { tableSettings: data })
      }
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}