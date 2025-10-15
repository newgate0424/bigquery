import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { getSession, addSession, isUserKicked, hasActiveSessionForUser } from '@/lib/session-store';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.cookies.get('token')?.value;
    const token = authHeader?.substring(7) || cookieToken;

    console.log('🔍 Validate API called');

    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ valid: false, reason: 'No token' }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    if (!decoded) {
      console.log('❌ Token verification failed');
      return NextResponse.json({ valid: false, reason: 'Invalid token' }, { status: 401 });
    }

    // Type assertion for decoded JWT
    const user = decoded as { id: number; username: string; role: string };
    console.log('👤 User from token:', user.username);

    // ตรวจสอบว่าถูกเตะหรือไม่
    if (isUserKicked(user.id)) {
      console.log('🚫 User was kicked, rejecting:', user.username);
      return NextResponse.json({ valid: false, reason: 'Session not found' }, { status: 401 });
    }

    // ตรวจสอบว่า session ยังอยู่ใน store หรือไม่
    let session = getSession(token);
    console.log('🔎 Session in store:', session ? 'Found' : 'Not found');
    
    // ถ้าไม่มี session แสดงว่าถูกลบไปแล้ว (ถูกเตะหรือล็อกอินที่อื่น)
    if (!session) {
      console.log('⚠️ Session not found for token, user may have logged in elsewhere');
      return NextResponse.json({ 
        valid: false, 
        reason: 'Session not found' 
      }, { status: 401 });
    }
    
    // อัพเดท lastActive
    session.lastActive = new Date();

    return NextResponse.json({ 
      valid: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('❌ Validate error:', error);
    return NextResponse.json({ valid: false, reason: 'Error' }, { status: 500 });
  }
}
