import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { SessionService } from '@/lib/session-service';

export async function GET(request: NextRequest) {
  try {
    // ดึง token จาก cookie หรือ header
    let token = request.cookies.get('token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ 
        error: 'ไม่พบ token',
        sessionValid: false 
      }, { status: 401 });
    }

    // ตรวจสอบ JWT
    const decoded = verifyJwt(token);
    if (!decoded) {
      return NextResponse.json({ 
        error: 'Token ไม่ถูกต้อง',
        sessionValid: false 
      }, { status: 401 });
    }

    // ตรวจสอบ session ใน database
    const isActive = await SessionService.isTokenActive(token);
    
    if (!isActive) {
      return NextResponse.json({ 
        error: 'Session ถูกปิดหรือหมดอายุ',
        sessionValid: false,
        reason: 'Session deactivated - อาจมีการ login จากอุปกรณ์อื่น' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      sessionValid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการตรวจสอบ session',
      sessionValid: false 
    }, { status: 500 });
  }
}