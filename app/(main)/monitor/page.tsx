'use client';

import DataTable from "@/components/DataTable";
import { useTheme } from '@/lib/theme-context';
import { Suspense } from "react";

// Loading component
function LoadingDataTable() {
  return (
    <div className="space-y-4">
      <div className="mb-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col">
          <div className="h-5 bg-gray-200 rounded w-20 mb-1"></div>
          <div className="h-10 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="flex flex-col">
          <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex flex-col">
          <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg text-gray-600">กำลังโหลดข้อมูลจาก BigQuery...</p>
        <p className="text-sm text-gray-500">ใช้ Client-side loading เพื่อประสิทธิภาพที่ดีขึ้น</p>
      </div>
    </div>
  );
}

export default function MonitorPage() {
  
  return (
    <div className="h-full w-full" data-page="monitor">
      <Suspense fallback={<LoadingDataTable />}>
        <DataTable />
      </Suspense>
    </div>
  );
}