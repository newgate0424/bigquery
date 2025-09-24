"use client";
import React from "react";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Dashboard</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        ยินดีต้อนรับสู่หน้า Dashboard หลักของระบบ คุณสามารถเข้าถึงข้อมูลและฟีเจอร์ต่าง ๆ ได้จากเมนูด้านข้าง
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Monitor Dashboard</h2>
          <p className="text-gray-600 mb-4">ตรวจสอบและวิเคราะห์ข้อมูลการตลาดแบบเรียลไทม์</p>
          <a href="/monitor" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">ไปยัง Monitor</a>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Users Management</h2>
          <p className="text-gray-600 mb-4">จัดการผู้ใช้งานและสิทธิ์การเข้าถึง</p>
          <a href="/users" className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition">ไปยัง Users</a>
        </div>
      </div>
    </div>
  );
}
