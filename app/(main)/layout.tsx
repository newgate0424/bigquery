"use client";
import { ThemeProvider } from "@/lib/theme-context";
import SidebarWrapper from "@/components/SidebarWrapper";
import AuthGuard from "@/components/AuthGuard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarWrapper>
        <AuthGuard>{children}</AuthGuard>
      </SidebarWrapper>
    </ThemeProvider>
  );
}