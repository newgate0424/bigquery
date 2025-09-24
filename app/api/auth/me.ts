import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { getUserByUsername } from '@/lib/user';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  const user = await getUserByUsername(payload.username as string);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ user: { id: user.id, username: user.username, role: user.role } });
}
