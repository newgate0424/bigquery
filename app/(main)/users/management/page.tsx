'use client';
import React from 'react';
import UserManagement from '@/components/UserManagement';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
  const { effectiveTheme, colors } = useTheme();
  
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
      data-page="user-management"
    >
      <Card className={cn(
        "h-full overflow-hidden border-0 shadow-lg transition-colors duration-200",
        effectiveTheme === 'dark'
          ? "bg-slate-800/30 backdrop-blur-md shadow-slate-900/50"
          : "bg-white/30 backdrop-blur-md shadow-slate-200/50"
      )}>
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <Link href="/users">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  กลับไปภาพรวม
                </Button>
              </Link>
            </div>
            <UserManagement />
          </div>
        </div>
      </Card>
    </div>
  );
}
