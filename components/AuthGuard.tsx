"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      console.log('AuthGuard checking:', pathname);
      
      try {
        // ตรวจสอบ token จาก localStorage
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        console.log('Token exists:', !!token, 'User data exists:', !!userData);
        
        if (!token || !userData) {
          console.log('No auth, redirecting to login');
          setIsAuthenticated(false);
          setIsChecking(false);
          window.location.replace("/login");
          return;
        }

        // ถ้ามี token ให้ถือว่า authenticated
        console.log('Authenticated, showing content');
        setIsAuthenticated(true);
        setIsChecking(false);
        
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setIsChecking(false);
        window.location.replace("/login");
      }
    };

    // เพิ่ม timeout เพื่อป้องกัน infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Auth check timeout, checking localStorage again...');
      const token = localStorage.getItem("token");
      if (token) {
        console.log('Found token after timeout, showing content');
        setIsAuthenticated(true);
      } else {
        console.log('No token after timeout, redirecting to login');
        window.location.replace("/login");
      }
      setIsChecking(false);
    }, 2000); // ลดเวลาเหลือ 2 วินาที

    checkAuth();
    
    return () => clearTimeout(timeoutId);
  }, [pathname]); // เอา router ออก

  // แสดง loading screen ขณะตรวจสอบ authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
          <button 
            onClick={() => {
              setIsAuthenticated(true);
              setIsChecking(false);
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ข้าม
          </button>
        </div>
      </div>
    );
  }

  // แสดงเนื้อหา
  return <>{children}</>;
}
