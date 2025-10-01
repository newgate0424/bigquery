import { prisma } from './prisma';

export interface ActiveSession {
  sessionId: string;
  userId: number;
  deviceInfo: string;
  ipAddress: string;
  createdAt: Date;
  lastUsedAt: Date;
}

export class SessionService {
  // ตรวจสอบและลบ session เดิมทั้งหมดของผู้ใช้
  static async deactivateUserSessions(userId: number): Promise<number> {
    try {
      const result = await prisma.userSession.updateMany({
        where: {
          userId,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      console.log(`🔒 Deactivated ${result.count} sessions for user ${userId}`);
      return result.count;
    } catch (error) {
      console.error('Error deactivating user sessions:', error);
      return 0;
    }
  }

  // สร้าง session ใหม่
  static async createSession(
    userId: number,
    username: string,
    token: string,
    userAgent?: string,
    ipAddress?: string,
    deviceInfo?: string
  ): Promise<boolean> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 ชั่วโมง

      await prisma.userSession.create({
        data: {
          userId,
          token,
          userAgent: userAgent?.substring(0, 500),
          ipAddress: ipAddress?.substring(0, 45),
          deviceInfo: deviceInfo?.substring(0, 500),
          expiresAt,
          isActive: true
        }
      });

      console.log(`✅ Created new session for user ${username} (${userId})`);
      return true;
    } catch (error) {
      console.error('Error creating session:', error);
      return false;
    }
  }

  // ตรวจสอบว่า token นี้ active อยู่หรือไม่
  static async isTokenActive(token: string): Promise<boolean> {
    try {
      const session = await prisma.userSession.findFirst({
        where: {
          token,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (session) {
        // อัปเดต lastUsedAt
        await prisma.userSession.update({
          where: { id: session.id },
          data: { lastUsedAt: new Date() }
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  }

  // ดึงรายการ active sessions ของผู้ใช้
  static async getUserActiveSessions(userId: number): Promise<ActiveSession[]> {
    try {
      const sessions = await prisma.userSession.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: { lastUsedAt: 'desc' }
      });

      return sessions.map(session => ({
        sessionId: session.id,
        userId: session.userId,
        deviceInfo: session.deviceInfo || 'Unknown Device',
        ipAddress: session.ipAddress || 'Unknown IP',
        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt
      }));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // ปิด session เฉพาะ
  static async deactivateSession(sessionId: string): Promise<boolean> {
    try {
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { isActive: false }
      });

      console.log(`🔒 Deactivated session: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('Error deactivating session:', error);
      return false;
    }
  }

  // ปิด session ด้วย token
  static async deactivateSessionByToken(token: string): Promise<boolean> {
    try {
      const result = await prisma.userSession.updateMany({
        where: {
          token,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      console.log(`🔒 Deactivated session by token: ${token.substring(0, 20)}...`);
      return result.count > 0;
    } catch (error) {
      console.error('Error deactivating session by token:', error);
      return false;
    }
  }

  // ลบ session ที่หมดอายุ
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.userSession.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false }
          ]
        }
      });

      console.log(`🧹 Cleaned up ${result.count} expired/inactive sessions`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      return 0;
    }
  }

  // แยกข้อมูล device จาก User-Agent
  static parseDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';

    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    // Browser detection
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // OS detection
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Device type detection
    if (userAgent.includes('Mobile')) device = 'Mobile';
    else if (userAgent.includes('Tablet')) device = 'Tablet';

    return `${browser} on ${os} (${device})`;
  }

  // ดึงข้อมูลจาก request headers
  static extractRequestInfo(headers: any) {
    const userAgent = headers.get?.('user-agent') || headers['user-agent'];
    const ipAddress = headers.get?.('x-forwarded-for') || 
                     headers.get?.('x-real-ip') || 
                     headers['x-forwarded-for'] ||
                     headers['x-real-ip'] ||
                     'unknown';

    const deviceInfo = this.parseDeviceInfo(userAgent);

    return {
      userAgent,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      deviceInfo
    };
  }
}