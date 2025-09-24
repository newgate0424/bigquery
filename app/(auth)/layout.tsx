"use client";
import { ThemeProvider } from "@/lib/theme-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {children}
      </div>
    </ThemeProvider>
  );
}