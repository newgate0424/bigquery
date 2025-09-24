"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function LogoutModal({ isOpen, onClose, onConfirm, isLoading }: LogoutModalProps) {
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

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

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
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-600/30 max-w-sm w-full mx-4 transform animate-in zoom-in duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <LogOut className="h-6 w-6 text-red-500 dark:text-red-400" />
          </div>
        </div>
        
        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
            ออกจากระบบ
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-medium border border-slate-200 dark:border-slate-600 hover:shadow-md disabled:opacity-50 text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center font-medium shadow-lg text-sm",
              isLoading
                ? "bg-red-300 dark:bg-red-400/50 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-xl transform hover:scale-105"
            )}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                กำลังออก...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                ออกจากระบบ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ใช้ Portal เพื่อ render ที่ document.body
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}