import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword } from '@/lib/user';
import { signJwt } from '@/lib/jwt';
import { addSession, clearKickedUser, checkLoginLock, recordFailedLogin, clearLoginAttempts } from '@/lib/session-store';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  // ตรวจสอบว่าถูก lock หรือไม่
  const lockStatus = checkLoginLock(username);
  if (lockStatus.locked && lockStatus.lockedUntil) {
    const remainingSeconds = Math.ceil((lockStatus.lockedUntil.getTime() - new Date().getTime()) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    return NextResponse.json({ 
      error: `บัญชีถูกล็อคชั่วคราว กรุณารอ ${remainingMinutes} นาที` 
    }, { status: 429 });
  }
  
  const user = await getUserByUsername(username);
  if (!user) {
    const result = recordFailedLogin(username);
    return NextResponse.json({ 
      error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      remainingAttempts: result.remainingAttempts
    }, { status: 404 });
  }
  
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    const result = recordFailedLogin(username);
    if (result.locked && result.lockedUntil) {
      return NextResponse.json({ 
        error: 'ล็อกอินผิดพลาดหลายครั้ง บัญชีถูกล็อคเป็นเวลา 5 นาที'
      }, { status: 429 });
    }
    return NextResponse.json({ 
      error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      remainingAttempts: result.remainingAttempts
    }, { status: 401 });
  }
  
  // ล็อกอินสำเร็จ - ล้าง attempts
  clearLoginAttempts(username);
  
  const token = signJwt({ id: user.id, username: user.username, role: user.role });
  
  // Get IP address and User Agent
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // ล้างสถานะ kicked ถ้ามี
  clearKickedUser(user.id);
  
  // บันทึก session
  addSession(token, {
    userId: user.id,
    username: user.username,
    role: user.role,
    loginAt: new Date(),
    lastActive: new Date(),
    ipAddress,
    userAgent,
  });
  
  // สร้าง response และ set cookie
  const response = NextResponse.json({ 
    token, 
    user: { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      adserView: user.adserView
    } 
  });
  
  // Set cookie สำหรับ middleware ด้วย path และ domain ที่ถูกต้อง
  response.cookies.set('token', token, {
    httpOnly: false, // เปลี่ยนเป็น false เพื่อให้ client อ่านได้
    secure: false, // เปลี่ยนเป็น false สำหรับ development
    sameSite: 'lax', // เปลี่ยนเป็น lax
    maxAge: 60 * 60 * 24 * 7, // 7 วัน
    path: '/' // เพิ่ม path
  });
  
  return response;
}
