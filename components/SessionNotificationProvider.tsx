'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSessionNotifications } from '@/lib/hooks/useSessionNotifications';

export default function SessionNotificationProvider() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ตรวจสอบสถานะการล็อกอิน
  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      const isLoggedIn = !!token;
      const isLoginPage = pathname === '/login' || pathname.startsWith('/login');
      
      setIsAuthenticated(isLoggedIn && !isLoginPage);
    };

    checkAuth();
    
    // ตรวจสอบทุกครั้งที่ route เปลี่ยน
    const interval = setInterval(checkAuth, 1000);
    
    return () => clearInterval(interval);
  }, [pathname]);

  // เชื่อมต่อกับ SSE เฉพาะเมื่อ authenticated
  useSessionNotifications();

  return null; // ไม่ต้อง render อะไร
}