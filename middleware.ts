import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// กำหนดเส้นทางที่ไม่ต้องการ authentication
const publicPaths = ['/login', '/newgate', '/api/auth/login', '/api/auth/users', '/api/exchange-rate']

// กำหนดเส้นทาง API ที่ต้องการ authentication  
const protectedApiPaths = ['/api/data', '/api/filters', '/api/preferences', '/api/auth/me', '/api/auth/logout']

// ฟังก์ชันตรวจสอบ JWT อย่างง่าย (ไม่ verify signature ใน edge runtime)
function isValidJWT(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // ตรวจสอบ payload
    const payload = JSON.parse(atob(parts[1]));
    
    // ตรวจสอบ expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.log('Token expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('JWT validation error:', error);
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('Middleware checking:', pathname)
  
  // อนุญาตให้เข้าถึง static files และ public paths
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') || 
      pathname.startsWith('/public') ||
      publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // ตรวจสอบ token จาก cookie หรือ Authorization header
  const cookieToken = request.cookies.get('token')?.value;
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = cookieToken || headerToken;
  
  console.log('Cookie token:', cookieToken ? cookieToken.substring(0, 20) + '...' : 'none');
  console.log('Header token:', headerToken ? headerToken.substring(0, 20) + '...' : 'none');
  console.log('Final token exists:', !!token);
  
  // ถ้าไม่มี token และพยายามเข้าถึงหน้าที่ต้อง authentication
  if (!token) {
    if (protectedApiPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อน' },
        { status: 401 }
      )
    }
    
    // Redirect ไปหน้า login สำหรับหน้าเว็บ แต่ไม่ redirect หน้า root
    if (pathname !== '/' && pathname !== '/login') {
      console.log('Redirecting to login from:', pathname)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ถ้ามี token ให้ตรวจสอบความถูกต้อง
  if (token) {
    const isValid = isValidJWT(token);
    console.log('Token is valid:', isValid);
    
    if (isValid) {
      // ถ้า authenticated แล้วและพยายามเข้า login/newgate redirect ไป overview
      if (pathname === '/login' || pathname === '/newgate') {
        console.log('Redirecting authenticated user to overview')
        return NextResponse.redirect(new URL('/overview', request.url))
      }
    } else {
      console.log('Token invalid, clearing cookie and redirecting to login');
      // Token ไม่ถูกต้อง ลบ cookie และ redirect ไป login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}