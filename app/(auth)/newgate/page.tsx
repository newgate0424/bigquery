"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "สมัครสมาชิกไม่สำเร็จ");
      setSuccess(true);
      setUsername("");
      setPassword("");
      setRole("admin");
      
      // ถ้าได้ token กลับมา (สมัคร admin คนแรก) ให้ล็อกอินอัตโนมัติ
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => router.push("/overview"), 1000);
      } else {
        // ถ้าไม่ได้ token (admin สร้าง user ใหม่) แสดงข้อความสำเร็จ
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">สมัครสมาชิก</h2>
      {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded">{error}</div>}
      {success && <div className="text-green-600 mb-2 p-2 bg-green-50 rounded">สมัครสมาชิกสำเร็จ!</div>}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Username</label>
        <input 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Role</label>
        <select 
          value={role} 
          onChange={e => setRole(e.target.value as "admin" | "staff")}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </div>
      <button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-colors" 
        disabled={loading}
      >
        {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
