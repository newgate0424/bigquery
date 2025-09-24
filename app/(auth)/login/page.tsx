"use client";
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Function to trigger preferences loading across the app
const triggerPreferencesLoad = () => {
  // Dispatch a custom event to notify components that user has logged in
  const event = new CustomEvent('userLoggedIn', {
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(event);
  
  console.log('Preferences load event dispatched');
};

export default function LoginPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้ login อยู่แล้วหรือไม่
    const checkExistingAuth = async () => {
      try {
        const existingToken = localStorage.getItem('token');
        const existingUser = localStorage.getItem('user');

        if (existingToken && existingUser) {
          // มี token แล้ว redirect ไปหน้าหลักทันที
          router.replace('/overview');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingAuth();
  }, [router]);

  const handleLogin = async (jwt: string, user: Record<string, unknown>) => {
    console.log('Login successful, storing data and redirecting...');
    console.log('Token:', jwt);
    console.log('User:', user);
    
    // ล้าง localStorage ก่อน
    localStorage.clear();
    
    // เก็บข้อมูลใหม่
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set cookie manually ด้วย
    document.cookie = `token=${jwt}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    
    // ตรวจสอบว่าเก็บไว้แล้ว
    console.log('Stored token:', localStorage.getItem('token'));
    console.log('Stored user:', localStorage.getItem('user'));
    console.log('Document cookie:', document.cookie);
    
    // Trigger preferences loading for logged in user
    try {
      console.log('Triggering preferences load after login...');
      triggerPreferencesLoad();
      
      // Give a small delay to allow preferences to start loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Auto-sync triggered successfully');
    } catch (error) {
      console.error('Error triggering preferences load:', error);
      // Don't block login if preferences fail
    }
    
    // Redirect ทันที ไม่มี alert และ setTimeout
    console.log('Redirecting to overview...');
    window.location.replace('/overview');
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return <LoginForm onLogin={handleLogin} />;
}
