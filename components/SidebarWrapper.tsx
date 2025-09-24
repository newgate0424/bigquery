"use client";
import React, { useState } from "react";
import { MainSidebar, SidebarProvider } from "@/components/MainSidebar";
import { Header } from "@/components/Header";
import { useTheme } from "@/lib/theme-context";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  
  // Create background style based on selected background
  const backgroundStyle = React.useMemo(() => {
    if (colors.background.startsWith('linear-gradient')) {
      return { background: colors.background };
    } else if (colors.background.startsWith('#')) {
      return { backgroundColor: colors.background };
    } else {
      // Fallback to default gradient
      return {};
    }
  }, [colors.background]);
  
  // แสดง layout แบบเต็มรูปแบบเสมอ (เพราะใช้เฉพาะใน main layout)
  return (
    <SidebarProvider>
      <div 
        className="flex h-screen transition-colors"
        style={backgroundStyle}
      >
        {/* Column 1: Main Sidebar */}
        <MainSidebar />
        
        {/* Column 2 & 3: Content area (will be split by DataTable component) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-hidden">
            <div className="h-full">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
