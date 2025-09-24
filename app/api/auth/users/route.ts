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
  const { username, password, role, teams } = await request.json();
  // ตรวจสอบว่ามีผู้ใช้ในระบบหรือยัง
  const users = await getAllUsers();
  if (users.length === 0 && role === 'admin') {
    // สมัครแอดมินคนแรกโดยไม่ต้องมี token
    const user = await createUser(username, password, role, teams);
    // สร้าง JWT token สำหรับ user
    const token = signJwt({ id: user.id, username: user.username, role: user.role });
    return NextResponse.json({ token, user });
  }
  // หลังจากมีผู้ใช้แล้ว ต้องใช้ token admin
  const auth = request.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const user = await createUser(username, password, role, teams);
  return NextResponse.json({ user });
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
