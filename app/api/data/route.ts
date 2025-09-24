/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { fetchMonitorData } from '@/lib/bigquery';
import { verifyJwt } from '@/lib/jwt';
import { getUserByUsername } from '@/lib/user';

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const cookieToken = request.cookies.get('token')?.value;
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyJwt(token);
    console.log('JWT Payload:', payload); // เพิ่ม debug log
    if (!payload || !payload.username) {
      console.log('Invalid payload or missing username:', payload); // เพิ่ม debug log
      // สร้าง response เพื่อ clear cookie
      const response = NextResponse.json({ error: 'Invalid token or missing username. Please login again.' }, { status: 401 });
      response.cookies.set('token', '', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 0, // ลบ cookie
        path: '/'
      });
      return response;
    }
    
    // ดึงข้อมูลผู้ใช้
    const user = await getUserByUsername(payload.username as string);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const adser = searchParams.get('adser');
    const status = searchParams.get('status');
    let team = searchParams.get('team');
    const searchText = searchParams.get('searchText');

    // ตรวจสอบสิทธิ์การเข้าถึงทีม
    if (user.role === 'staff') {
      const userTeams = (user as any).teams as string[] || [];
      
      if (team && team !== 'all') {
        // ถ้ามีการระบุทีม ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงทีมนั้นหรือไม่
        if (!userTeams.includes(team)) {
          return NextResponse.json({ error: 'Access denied to this team' }, { status: 403 });
        }
      } else {
        // ถ้าไม่ได้ระบุทีม ให้แสดงเฉพาะทีมของผู้ใช้เท่านั้น
        if (userTeams.length > 0) {
          // หากผู้ใช้มีทีมเดียว ใช้ทีมนั้น หากมีหลายทีม ไม่กรองโดยทีม (แต่จะกรองใน BigQuery)
          team = userTeams.length === 1 ? userTeams[0] : null;
        }
      }
      
      // ตรวจสอบสิทธิ์การเข้าถึง adser
      if (adser && user.adserView) {
        const allowedAdsers = user.adserView as string[];
        if (!allowedAdsers.includes(adser)) {
          return NextResponse.json({ error: 'Access denied to this adser' }, { status: 403 });
        }
      }
    }
    
    console.log('API call with params:', { page, limit, dateFrom, dateTo, adser, status, team, searchText, userRole: user.role, userTeams: (user as any).teams });

    const data = await fetchMonitorData({
      page,
      limit,
      dateFrom,
      dateTo,
      adser,
      status,
      team,
      searchText,
      userTeams: user.role === 'staff' ? ((user as any).teams as string[]) : null // ส่งทีมของผู้ใช้ไป BigQuery
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}