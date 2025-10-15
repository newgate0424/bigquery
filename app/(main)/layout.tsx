"use client";
import SidebarWrapper from "@/components/SidebarWrapper";
import AuthGuard from "@/components/AuthGuard";
import SessionValidator from "@/components/SessionValidator";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarWrapper>
      <AuthGuard>
        <SessionValidator />
        {children}
      </AuthGuard>
    </SidebarWrapper>
  );
}