import { useEffect, useRef } from 'react';

interface NotificationData {
  type: string;
  message: string;
  timestamp: string;
}

export function useSessionNotifications() {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // ตรวจสอบว่ามี token หรือไม่ก่อนเชื่อมต่อ
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      console.log('🔒 No authentication token found, skipping SSE connection');
      return;
    }

    // สร้าง EventSource connection
    const eventSource = new EventSource('/api/auth/notifications');
    eventSourceRef.current = eventSource;

    // รับการแจ้งเตือนเมื่อมีการ login จากเครื่องอื่น
    eventSource.addEventListener('session_warning', (event) => {
      try {
        const data: NotificationData = JSON.parse(event.data);
        console.log('🔔 Session warning received:', data);
        
        // แสดงการแจ้งเตือน
        showSessionWarning(data.message);
      } catch (error) {
        console.error('Error parsing session warning:', error);
      }
    });

    // รับการแจ้งเตือนทั่วไป
    eventSource.addEventListener('session_alert', (event) => {
      try {
        const data: NotificationData = JSON.parse(event.data);
        console.log('📢 Session alert received:', data);
        
        // แสดงการแจ้งเตือน
        showSessionAlert(data.message);
      } catch (error) {
        console.error('Error parsing session alert:', error);
      }
    });

    // รับข้อความ connected
    eventSource.addEventListener('message', (event) => {
      try {
        const data: NotificationData = JSON.parse(event.data);
        if (data.type === 'connected') {
          console.log('✅ Session notifications connected:', data.message);
        }
      } catch (error) {
        // ไม่ต้องแสดง error สำหรับ heartbeat
      }
    });

    // จัดการ errors
    eventSource.onerror = (error) => {
      // ลดการแสดง error log ลง
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('🔒 Session notifications disconnected');
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log('🔄 Session notifications reconnecting...');
      } else {
        console.warn('⚠️ Session notifications connection issue');
      }
    };

    // จัดการเมื่อ connection เปิด
    eventSource.onopen = () => {
      console.log('📡 Session notifications connected successfully');
    };

    // Cleanup เมื่อ component unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        console.log('📡 Session notifications disconnected');
      }
    };
  }, []);

  // ปิด connection manually
  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  return { disconnect };
}

// ฟังก์ชันแสดงการแจ้งเตือนแบบ warning
function showSessionWarning(message: string) {
  // สร้าง notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
    z-index: 9999;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    animation: slideIn 0.3s ease-out;
    border-left: 4px solid #fff;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 18px;">⚠️</span>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">การแจ้งเตือนเซสชัน</div>
        <div>${message}</div>
      </div>
    </div>
  `;

  // เพิ่ม CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // ลบการแจ้งเตือนหลังจาก 8 วินาที
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 8000);

  // เล่นเสียงแจ้งเตือน (ถ้ามี)
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBj2a3PLEcyQFLYDO8tiJOQcZZ7zs56BODwxPqOPwtmMcBj2b3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQFLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQFLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtWIcBj+a3PLEcyQGLYDO8tiJOQcZZ7zs56BODwxPpuHvtW');
  } catch (error) {
    // ไม่สามารถเล่นเสียงได้
  }
}

// ฟังก์ชันแสดงการแจ้งเตือนทั่วไป
function showSessionAlert(message: string) {
  // สร้าง notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3);
    z-index: 9999;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    animation: slideIn 0.3s ease-out;
    border-left: 4px solid #fff;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 18px;">🔔</span>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">การแจ้งเตือน</div>
        <div>${message}</div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // ลบการแจ้งเตือนหลังจาก 5 วินาที
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}