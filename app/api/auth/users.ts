import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/lib/user';
import { verifyJwt } from '@/lib/jwt';

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
  // Only admin can create users
  const auth = request.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { username, password, role } = await request.json();
  const user = await createUser(username, password, role);
  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  // Only admin can update users
  const auth = request.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, ...data } = await request.json();
  const user = await updateUser(id, data);
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
