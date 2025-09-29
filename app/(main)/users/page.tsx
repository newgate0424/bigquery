'use client';
import React from 'react';
import UserManagement from '@/components/UserManagement';
import { Card } from "@/components/ui/card";
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const { effectiveTheme } = useTheme();
  
  return (
    <div 
      className={cn(
        "h-screen p-4 sm:p-6 transition-colors duration-200 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900",
        effectiveTheme === 'dark' 
          ? "text-slate-100" 
          : "text-slate-900"
      )} 
      data-page="users"
    >
      <Card className={cn(
        "h-full overflow-hidden border-0 shadow-lg transition-colors duration-200",
        effectiveTheme === 'dark'
          ? "bg-slate-800/30 backdrop-blur-md shadow-slate-900/50"
          : "bg-white/30 backdrop-blur-md shadow-slate-200/50"
      )}>
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <UserManagement />
          </div>
        </div>
      </Card>
    </div>
  );
}
