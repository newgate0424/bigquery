import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyJwt(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Mock data for now (จนกว่า migration จะเสร็จ)
    // ใน production จะใช้ prisma.activityLog.findMany()
    
    return NextResponse.json({ logs: [] });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyJwt(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { action, details } = body;

    // Get IP address and User Agent
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Mock response for now
    // ใน production จะใช้ prisma.activityLog.create()
    console.log('Activity log:', { userId: decoded.id, action, details, ipAddress, userAgent });
    
    return NextResponse.json({ 
      log: {
        id: 1,
        userId: decoded.id,
        action,
        details,
        ipAddress,
        userAgent,
        createdAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}
