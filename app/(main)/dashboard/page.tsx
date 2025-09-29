"use client";
import React from "react";
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { effectiveTheme } = useTheme();
  
  return (
    <div 
      className={cn(
        "h-screen p-4 sm:p-6 transition-colors duration-200",
        effectiveTheme === 'dark' 
          ? "bg-slate-900 text-slate-100" 
          : "bg-slate-50 text-slate-900"
      )} 
      data-page="dashboard"
    >
      <div className="max-w-5xl mx-auto py-12">
        <h1 className={cn(
          "text-3xl font-bold mb-4 transition-colors duration-200",
          effectiveTheme === 'dark' ? "text-slate-100" : "text-slate-900"
        )}>Dashboard</h1>
        <p className={cn(
          "text-lg mb-8 transition-colors duration-200",
          effectiveTheme === 'dark' ? "text-slate-400" : "text-slate-600"
        )}>
          ยินดีต้อนรับสู่หน้า Dashboard หลักของระบบ คุณสามารถเข้าถึงข้อมูลและฟีเจอร์ต่าง ๆ ได้จากเมนูด้านข้าง
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={cn(
            "rounded-lg shadow p-6 transition-colors duration-200 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50",
            effectiveTheme === 'dark'
              ? "bg-slate-800/80 shadow-slate-900/50"
              : "bg-white/80 shadow-slate-200/50"
          )}>
            <h2 className={cn(
              "text-xl font-semibold mb-2 transition-colors duration-200",
              effectiveTheme === 'dark' ? "text-slate-100" : "text-slate-900"
            )}>Monitor Dashboard</h2>
            <p className={cn(
              "mb-4 transition-colors duration-200",
              effectiveTheme === 'dark' ? "text-slate-400" : "text-slate-600"
            )}>ตรวจสอบและวิเคราะห์ข้อมูลการตลาดแบบเรียลไทม์</p>
            <a href="/monitor" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">ไปยัง Monitor</a>
          </div>
          <div className={cn(
            "rounded-lg shadow p-6 transition-colors duration-200 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50",
            effectiveTheme === 'dark'
              ? "bg-slate-800/80 shadow-slate-900/50"
              : "bg-white/80 shadow-slate-200/50"
          )}>
            <h2 className={cn(
              "text-xl font-semibold mb-2 transition-colors duration-200",
              effectiveTheme === 'dark' ? "text-slate-100" : "text-slate-900"
            )}>Users Management</h2>
            <p className={cn(
              "mb-4 transition-colors duration-200",
              effectiveTheme === 'dark' ? "text-slate-400" : "text-slate-600"
            )}>จัดการผู้ใช้งานและสิทธิ์การเข้าถึง</p>
            <a href="/users" className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition">ไปยัง Users</a>
          </div>
        </div>
      </div>
    </div>
  );
}
