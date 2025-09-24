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
  const token = signJwt({ id: user.id, role: user.role });
  return NextResponse.json({ token, user: { id: user.id, username: user.username, role: user.role } });
}
