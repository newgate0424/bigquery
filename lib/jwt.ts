import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'changeme';

export function signJwt(payload: object): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): Record<string, unknown> | null {
  try {
    const result = jwt.verify(token, SECRET);
    return typeof result === 'object' ? result as Record<string, unknown> : null;
  } catch {
    return null;
  }
}
