import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { getActiveSessions, getOnlineUserIds } from '@/lib/session-store';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('🔐 Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('🎫 Token extracted:', token.substring(0, 20) + '...');
    
    const decoded = verifyJwt(token);
    console.log('👤 Decoded token:', decoded ? { id: decoded.id, username: decoded.username, role: decoded.role } : 'Invalid');

    if (!decoded) {
      console.log('❌ Token verification failed');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // อนุญาตให้ทั้ง admin และ staff เข้าได้
    if (decoded.role !== 'admin' && decoded.role !== 'staff') {
      console.log('❌ Access denied for role:', decoded.role);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // ดึงข้อมูล active sessions จาก memory
    const activeSessions = getActiveSessions(30); // 30 minutes
    const onlineUserIds = getOnlineUserIds(30);

    console.log('📊 Sessions info:', {
      totalActiveSessions: activeSessions.length,
      onlineUserIds: onlineUserIds,
      sessions: activeSessions.map(s => ({ userId: s.userId, username: s.username }))
    });

    // ดึงข้อมูลผู้ใช้ทั้งหมด
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        teams: true,
        adserView: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // เพิ่มข้อมูล online status
    const usersWithStatus = users.map(u => ({
      ...u,
      isOnline: onlineUserIds.includes(u.id),
      lastLoginAt: activeSessions.find(s => s.userId === u.id)?.loginAt?.toISOString() || u.createdAt.toISOString(),
    }));

    // แปลง sessions เป็น format ที่ component ต้องการ
    const formattedSessions = activeSessions.map(s => ({
      userId: s.userId,
      username: s.username,
      role: s.role,
      loginAt: s.loginAt.toISOString(),
      lastActive: s.lastActive.toISOString(),
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
    }));

    console.log('📤 Returning sessions:', formattedSessions);

    return NextResponse.json({ 
      users: usersWithStatus, 
      activeSessions: formattedSessions,
      onlineCount: onlineUserIds.length,
      currentUserRole: decoded.role, // เพิ่ม role ของคนที่เรียก API
    });
  } catch (error) {
    console.error('❌ Error fetching user sessions:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Failed to fetch user sessions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
