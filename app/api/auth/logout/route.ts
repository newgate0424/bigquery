import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
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