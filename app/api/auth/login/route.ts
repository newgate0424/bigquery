import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword } from '@/lib/user';
import { signJwt } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const user = await getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const token = signJwt({ id: user.id, username: user.username, role: user.role });
  
  console.log('Login API - User data:', {
    id: user.id,
    username: user.username,
    role: user.role,
    adserView: (user as { adserView?: string[] }).adserView
  });
  
  // สร้าง response และ set cookie
  const response = NextResponse.json({ 
    token, 
    user: { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      adserView: (user as { adserView?: string[] }).adserView 
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
  
  console.log('Setting cookie with token:', token.substring(0, 20) + '...');
  
  return response;
}
