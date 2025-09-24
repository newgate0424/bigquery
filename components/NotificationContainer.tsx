"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Notification, notificationManager } from '@/lib/notifications';

const NotificationComponent: React.FC<{ notification: Notification }> = ({ notification }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div 
      className={`flex items-start p-4 border rounded-lg shadow-sm transition-all duration-300 ${getBgColor()}`}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold ${getTextColor()}`}>
          {notification.title}
        </h4>
        {notification.message && (
          <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
            {notification.message}
          </p>
        )}
      </div>
      <button
        onClick={() => notificationManager.remove(notification.id)}
        className={`flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 ${getTextColor()}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="animate-in slide-in-from-right-full duration-300"
          >
            <NotificationComponent notification={notification} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;