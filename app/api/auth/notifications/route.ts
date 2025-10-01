import { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

// เก็บ active connections ตาม userId
const activeConnections = new Map<number, ReadableStreamDefaultController[]>();

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication จาก cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.log('🔒 No token provided for SSE connection');
      return new Response('Unauthorized', { 
        status: 401,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    // ตรวจสอบความถูกต้องของ token
    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch (error) {
      console.log('🔒 Invalid token for SSE connection:', error);
      return new Response('Unauthorized - Invalid token', { 
        status: 401,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    const userId = Number(decoded.id || decoded.userId);
    
    if (!userId) {
      console.log('🔒 No user ID in token for SSE connection');
      return new Response('Unauthorized - Invalid user', { 
        status: 401,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    console.log(`📡 Starting SSE connection for user ${userId}`);

    // สร้าง Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        console.log(`📡 SSE connection established for user ${userId}`);
        
        // เก็บ controller ไว้สำหรับส่งข้อความ
        if (!activeConnections.has(userId)) {
          activeConnections.set(userId, []);
        }
        activeConnections.get(userId)!.push(controller);

        // ส่งข้อความต้อนรับ
        const welcomeMessage = `data: ${JSON.stringify({
          type: 'connected',
          message: 'เชื่อมต่อระบบการแจ้งเตือนสำเร็จ',
          timestamp: new Date().toISOString()
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(welcomeMessage));

        // ส่ง heartbeat ทุก 30 วินาที
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
          } catch (error) {
            clearInterval(heartbeat);
            // ลบ controller ที่ปิดแล้ว
            removeController(userId, controller);
          }
        }, 30000);

        // เมื่อ connection ปิด
        request.signal.addEventListener('abort', () => {
          console.log(`📡 SSE connection closed for user ${userId}`);
          clearInterval(heartbeat);
          removeController(userId, controller);
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error('SSE setup error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}

// ฟังก์ชันช่วยลบ controller
function removeController(userId: number, controller: ReadableStreamDefaultController) {
  const controllers = activeConnections.get(userId) || [];
  const index = controllers.indexOf(controller);
  if (index > -1) {
    controllers.splice(index, 1);
  }
  if (controllers.length === 0) {
    activeConnections.delete(userId);
  }
}

// ฟังก์ชันสำหรับส่งการแจ้งเตือน
export function notifyUserSessions(userId: number, message: string, type: string = 'session_alert') {
  const controllers = activeConnections.get(userId) || [];
  
  if (controllers.length > 0) {
    console.log(`🔔 Sending notification to ${controllers.length} connections for user ${userId}: ${message}`);
    
    const eventData = JSON.stringify({
      type,
      message,
      timestamp: new Date().toISOString()
    });

    const sseMessage = `event: ${type}\ndata: ${eventData}\n\n`;
    const encodedMessage = new TextEncoder().encode(sseMessage);

    // ส่งไปทุก controller ของ user นี้
    controllers.forEach((controller, index) => {
      try {
        controller.enqueue(encodedMessage);
      } catch (error) {
        console.log(`❌ Failed to send notification to connection ${index}`);
        // ลบ controller ที่ไม่สามารถส่งได้
        controllers.splice(index, 1);
      }
    });

    // ถ้าไม่มี controller ที่ active แล้ว ลบออกจาก Map
    if (controllers.length === 0) {
      activeConnections.delete(userId);
    }
  } else {
    console.log(`📭 No active connections for user ${userId}`);
  }
}