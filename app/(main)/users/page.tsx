'use client';
import React, { useState, useEffect } from 'react';
import UserActivityMonitor from '@/components/UserActivityMonitor';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { effectiveTheme, colors } = useTheme();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // ดึง role จาก localStorage หรือ JWT
    const token = document.cookie.split('token=')[1]?.split(';')[0];
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);
  
  return (
    <div 
      className={cn(
        "h-screen p-4 sm:p-6 transition-colors duration-200",
        effectiveTheme === 'dark' 
          ? "text-slate-100" 
          : "text-slate-900"
      )}
      style={{ 
        backgroundColor: colors.background
      }}
      data-page="users"
    >
      <Card className={cn(
        "h-full overflow-hidden border-0 shadow-lg transition-colors duration-200",
        effectiveTheme === 'dark'
          ? "bg-slate-800/30 backdrop-blur-md shadow-slate-900/50"
          : "bg-white/30 backdrop-blur-md shadow-slate-200/50"
      )}>
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">ผู้ใช้งานระบบ</h1>
              </div>
              {userRole === 'admin' && (
                <Button 
                  onClick={() => router.push('/users/management')}
                  variant="default"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  จัดการผู้ใช้
                </Button>
              )}
            </div>
            <UserActivityMonitor />
          </div>
        </div>
      </Card>
    </div>
  );
}
