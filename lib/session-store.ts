// In-memory session store (จะหายเมื่อ restart server)
interface SessionData {
  userId: number;
  username: string;
  role: string;
  loginAt: Date;
  lastActive: Date;
  ipAddress: string;
  userAgent: string;
}

const activeSessions = new Map<string, SessionData>();
const kickedUsers = new Map<number, Date>(); // userId -> kick time
const loginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>(); // username -> attempts
const sessionsByUserId = new Map<number, string>(); // userId -> token (สำหรับ O(1) lookup)

export function addSession(token: string, data: SessionData) {
  // ลบ session เก่าของ user คนเดียวกันก่อน (single session)
  // ใช้ index แทนการวน loop → O(1) แทน O(n)
  const oldToken = sessionsByUserId.get(data.userId);
  if (oldToken) {
    activeSessions.delete(oldToken);
  }
  
  // เพิ่ม session ใหม่
  activeSessions.set(token, data);
  sessionsByUserId.set(data.userId, token);
}

export function removeSession(token: string) {
  const session = activeSessions.get(token);
  if (session) {
    sessionsByUserId.delete(session.userId);
  }
  activeSessions.delete(token);
}

export function removeSessionByUserId(userId: number): boolean {
  const token = sessionsByUserId.get(userId);
  if (token) {
    activeSessions.delete(token);
    sessionsByUserId.delete(userId);
    // เพิ่ม user ใน blacklist
    kickedUsers.set(userId, new Date());
    return true;
  }
  return false;
}

export function isUserKicked(userId: number): boolean {
  const kickTime = kickedUsers.get(userId);
  if (!kickTime) return false;
  
  // ล้าง blacklist หลังจาก 1 นาที
  const now = new Date();
  if (now.getTime() - kickTime.getTime() > 60000) {
    kickedUsers.delete(userId);
    return false;
  }
  
  return true;
}

export function clearKickedUser(userId: number) {
  kickedUsers.delete(userId);
}

// Login rate limiting functions
export function recordFailedLogin(username: string): { locked: boolean; remainingAttempts: number; lockedUntil?: Date } {
  const now = new Date();
  const attempt = loginAttempts.get(username);

  if (!attempt) {
    loginAttempts.set(username, { count: 1, lastAttempt: now });
    return { locked: false, remainingAttempts: 4 };
  }

  // ถ้าถูก lock อยู่
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return { locked: true, remainingAttempts: 0, lockedUntil: attempt.lockedUntil };
  }

  // ถ้าผ่านไป 15 นาที reset count
  const timeDiff = now.getTime() - attempt.lastAttempt.getTime();
  if (timeDiff > 15 * 60 * 1000) {
    loginAttempts.set(username, { count: 1, lastAttempt: now });
    return { locked: false, remainingAttempts: 4 };
  }

  // เพิ่ม count
  attempt.count += 1;
  attempt.lastAttempt = now;

  // ถ้าล็อกอินผิด 5 ครั้ง -> lock 5 นาที
  if (attempt.count >= 5) {
    attempt.lockedUntil = new Date(now.getTime() + 5 * 60 * 1000);
    loginAttempts.set(username, attempt);
    return { locked: true, remainingAttempts: 0, lockedUntil: attempt.lockedUntil };
  }

  loginAttempts.set(username, attempt);
  return { locked: false, remainingAttempts: 5 - attempt.count };
}

export function checkLoginLock(username: string): { locked: boolean; lockedUntil?: Date } {
  const attempt = loginAttempts.get(username);
  if (!attempt || !attempt.lockedUntil) {
    return { locked: false };
  }

  const now = new Date();
  if (now >= attempt.lockedUntil) {
    // หมดเวลา lock แล้ว
    loginAttempts.delete(username);
    return { locked: false };
  }

  return { locked: true, lockedUntil: attempt.lockedUntil };
}

export function clearLoginAttempts(username: string) {
  loginAttempts.delete(username);
}

export function updateSessionActivity(token: string) {
  const session = activeSessions.get(token);
  if (session) {
    session.lastActive = new Date();
    activeSessions.set(token, session);
  }
}

export function getSession(token: string): SessionData | undefined {
  return activeSessions.get(token);
}

export function hasActiveSessionForUser(userId: number): boolean {
  return sessionsByUserId.has(userId);
}

export function getAllSessions(): SessionData[] {
  return Array.from(activeSessions.values());
}

export function getActiveSessions(maxInactiveMinutes: number = 30): SessionData[] {
  const now = new Date();
  const threshold = new Date(now.getTime() - maxInactiveMinutes * 60 * 1000);
  
  const sessions = Array.from(activeSessions.values()).filter(
    session => session.lastActive >= threshold
  );
  
  console.log('📊 Active sessions:', { 
    total: activeSessions.size, 
    active: sessions.length,
    threshold: maxInactiveMinutes 
  });
  
  return sessions;
}

export function getOnlineUserIds(maxInactiveMinutes: number = 30): number[] {
  return getActiveSessions(maxInactiveMinutes).map(s => s.userId);
}

// Clean up old sessions และ login attempts every 30 minutes
setInterval(() => {
  const now = new Date();
  const sessionThreshold = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour
  const attemptThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours
  
  // ล้าง sessions เก่า
  for (const [token, session] of activeSessions.entries()) {
    if (session.lastActive < sessionThreshold) {
      activeSessions.delete(token);
      sessionsByUserId.delete(session.userId);
    }
  }
  
  // ล้าง login attempts เก่า
  for (const [username, attempt] of loginAttempts.entries()) {
    if (now.getTime() - attempt.lastAttempt.getTime() > attemptThreshold.getTime()) {
      loginAttempts.delete(username);
    }
  }
  
  // ล้าง kicked users เก่า
  for (const [userId, kickTime] of kickedUsers.entries()) {
    if (now.getTime() - kickTime.getTime() > 60000) { // 1 minute
      kickedUsers.delete(userId);
    }
  }
}, 30 * 60 * 1000);
