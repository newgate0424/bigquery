"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, LogIn } from "lucide-react";

interface SessionExpiredModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

export default function SessionExpiredModal({ isOpen, message, onConfirm }: SessionExpiredModalProps) {
  // ป้องกัน scroll เมื่อ modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Enter key
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen) {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [isOpen, onConfirm]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0
      }}
    >
      <div 
        className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-600/30 max-w-md w-full mx-4 transform animate-in zoom-in duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-orange-500 dark:text-orange-400" />
          </div>
        </div>
        
        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
            เซสชันหมดอายุ
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
        
        {/* Button */}
        <button
          onClick={onConfirm}
          className="w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center font-medium shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl transform hover:scale-105"
        >
          <LogIn className="h-4 w-4 mr-2" />
          เข้าสู่ระบบอีกครั้ง
        </button>
      </div>
    </div>
  );

  // ใช้ Portal เพื่อ render ที่ document.body
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
