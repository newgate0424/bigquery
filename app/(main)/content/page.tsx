'use client';

import DataTable from "@/components/DataTable";
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

export default function ContentPage() {
  const { effectiveTheme } = useTheme();
  
  return (
    <div 
      className={cn(
        "min-h-screen transition-colors duration-200",
        effectiveTheme === 'dark' 
          ? "bg-slate-900 text-slate-100" 
          : "bg-slate-50 text-slate-900"
      )}
      data-page="content"
    >
      <DataTable />
    </div>
  );
}