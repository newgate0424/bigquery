import { NextRequest, NextResponse } from 'next/server'
import { removeSession } from '@/lib/session-store'

export async function POST(request: NextRequest) {
  try {
    // ดึง token จาก header หรือ cookie
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('token')?.value;
    
    // ลบ session
    if (token) {
      removeSession(token);
      console.log('Session removed for token:', token.substring(0, 20) + '...');
    }
    
    // สร้าง response สำหรับ logout
    const response = NextResponse.json(
      { message: 'ออกจากระบบสำเร็จ' },
      { status: 200 }
    )

    // ลบ cookie โดยการ set ให้หมดอายุ
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // หมดอายุทันที
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
      { status: 500 }
    )
  }
}