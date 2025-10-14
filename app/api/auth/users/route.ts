import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/lib/user';
import { verifyJwt, signJwt } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  // Only admin can list users
  const auth = request.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const users = await getAllUsers();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, role, teams } = await request.json();
    
    // Validation
    if (!username || !password) {
      return NextResponse.json({ error: 'กรุณากรอก username และ password' }, { status: 400 });
    }
    if (!role || !['admin', 'staff'].includes(role)) {
      return NextResponse.json({ error: 'กรุณาเลือก role ที่ถูกต้อง' }, { status: 400 });
    }
    
    // ตรวจสอบว่ามีผู้ใช้ในระบบหรือยัง
    const users = await getAllUsers();
    console.log(`[Register] จำนวน users ในระบบ: ${users.length}, role ที่เลือก: ${role}`);
    
    if (users.length === 0) {
      // ไม่มี user เลย - สมัครคนแรกได้ทั้ง admin และ staff โดยไม่ต้องมี token
      console.log('[Register] สมัคร user คนแรก:', username, 'role:', role);
      const user = await createUser(username, password, role, teams);
      // สร้าง JWT token สำหรับ user
      const token = signJwt({ id: user.id, username: user.username, role: user.role });
      return NextResponse.json({ token, user });
    }
    
    // มี user อยู่แล้ว - ต้องใช้ token admin ในการสร้าง user ใหม่
    console.log('[Register] มี user อยู่แล้ว - ต้องการ admin token');
    const auth = request.headers.get('authorization');
    if (!auth) {
      return NextResponse.json({ 
        error: 'ต้องล็อกอินด้วย admin ก่อนถึงจะสร้าง user ได้' 
      }, { status: 401 });
    }
    
    const token = auth.replace('Bearer ', '');
    const payload = verifyJwt(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ 
        error: 'ต้องเป็น admin เท่านั้นถึงจะสร้าง user ได้' 
      }, { status: 403 });
    }
    
    const user = await createUser(username, password, role, teams);
    console.log('[Register] สร้าง user ใหม่สำเร็จ:', username);
    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error('[Register Error]:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสมัครสมาชิก' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Only admin can update users
  const auth = request.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, password, adserView, ...data } = await request.json();
  // รองรับการเปลี่ยนรหัสผ่านและ adserView
    const updateData: Record<string, unknown> = { ...data };
  if (password) updateData.password = password;
  if (adserView) updateData.adserView = adserView;
  const user = await updateUser(id, updateData);
  return NextResponse.json({ user });
}

export async function DELETE(request: NextRequest) {
  // Only admin can delete users
  const auth = request.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await request.json();
  const ok = await deleteUser(id);
  return NextResponse.json({ ok });
}
