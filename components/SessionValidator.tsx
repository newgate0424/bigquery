'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SessionExpiredModal from './SessionExpiredModal';

export default function SessionValidator() {
  const router = useRouter();
  const pathname = usePathname();
  const isValidating = useRef(false);
  const hasShownAlert = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleModalConfirm = () => {
    setShowModal(false);
    router.push('/login');
  };

  useEffect(() => {
    // ไม่ต้องเช็คในหน้า login
    if (pathname === '/login' || pathname === '/newgate') {
      hasShownAlert.current = false; // Reset เมื่อกลับมาหน้า login
      setShowModal(false); // ปิด modal ถ้าเปิดอยู่
      return;
    }

    const validateSession = async () => {
      // ป้องกันการเรียกซ้ำ
      if (isValidating.current) return;
      isValidating.current = true;

      try {
        const token = document.cookie.split('token=')[1]?.split(';')[0];
        if (!token) {
          isValidating.current = false;
          return;
        }

        const response = await fetch('/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ reason: 'Unknown' }));
          
          // ลบ cookie
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          
          // แสดง modal ตามสาเหตุ (แสดงครั้งเดียว)
          if (data.reason === 'Session not found' && !hasShownAlert.current) {
            hasShownAlert.current = true;
            
            // กำหนดข้อความตามสาเหตุ
            setModalMessage('คุณได้ออกจากระบบ\n\nอาจเป็นเพราะคุณเข้าสู่ระบบจากอุปกรณ์อื่น\nหรือถูกผู้ดูแลเตะออก\n\nกรุณาเข้าสู่ระบบใหม่');
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
      } finally {
        isValidating.current = false;
      }
    };

    // เช็คทันทีหลังจาก 500ms (แทนที่จะรอ 2 วินาที)
    const initialTimer = setTimeout(validateSession, 500);

    // เช็คทุก 10 วินาที (ลดจาก 3 วินาที เพื่อลด server load)
    const interval = setInterval(validateSession, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [pathname, router]);

  return (
    <SessionExpiredModal 
      isOpen={showModal}
      message={modalMessage}
      onConfirm={handleModalConfirm}
    />
  );
}
