"use client";
import SidebarWrapper from "@/components/SidebarWrapper";
import AuthGuard from "@/components/AuthGuard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarWrapper>
      <AuthGuard>{children}</AuthGuard>
    </SidebarWrapper>
  );
}