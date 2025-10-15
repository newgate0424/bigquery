import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { removeSessionByUserId } from '@/lib/session-store';

export async function POST(request: NextRequest) {
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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // ไม่ให้ admin kick ตัวเอง
    if (decoded.id === userId) {
      return NextResponse.json({ error: 'Cannot kick yourself' }, { status: 400 });
    }

    // ลบ session ของ user ที่ถูก kick
    const removed = removeSessionByUserId(userId);

    if (removed) {
      console.log(`🚫 Admin ${decoded.username} kicked user ID: ${userId}`);
      return NextResponse.json({ 
        success: true, 
        message: 'User kicked successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'User not found or already offline' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error kicking user:', error);
    return NextResponse.json(
      { error: 'Failed to kick user' },
      { status: 500 }
    );
  }
}
