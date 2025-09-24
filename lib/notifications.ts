// Simple notification system for user feedback
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 for persistent
}

class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  show(notification: Omit<Notification, 'id'>): string {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = notification.duration ?? 5000; // Default 5 seconds
    const newNotification: Notification = {
      ...notification,
      id,
      duration
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Convenience methods
  success(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }
}

// Global notification manager
export const notificationManager = new NotificationManager();

// Convenience functions for common preference sync notifications
export const PreferenceNotifications = {
  syncSuccess: (type: string) => notificationManager.success(
    'การตั้งค่าถูกบันทึก',
    `การตั้งค่า${type}ได้รับการซิงค์เรียบร้อยแล้ว`,
    3000
  ),

  syncError: (type: string) => notificationManager.warning(
    'การซิงค์ล้มเหลว',
    `การตั้งค่า${type}บันทึกในเครื่องแล้ว แต่ไม่สามารถซิงค์กับเซิร์ฟเวอร์ได้`,
    5000
  ),

  loadError: () => notificationManager.error(
    'โหลดการตั้งค่าล้มเหลว',
    'กำลังใช้การตั้งค่าที่บันทึกไว้ในเครื่อง',
    5000
  ),

  loginSync: () => notificationManager.info(
    'กำลังโหลดการตั้งค่า',
    'กำลังซิงค์การตั้งค่าจากเซิร์ฟเวอร์...',
    2000
  )
};