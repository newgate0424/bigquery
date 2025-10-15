'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Activity, Users, Clock, Monitor, RefreshCw, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  role: string;
  isOnline?: boolean;
}

interface SessionData {
  userId: number;
  username: string;
  role: string;
  loginAt: string; // เปลี่ยนจาก Date เป็น string
  lastActive: string; // เปลี่ยนจาก Date เป็น string
  ipAddress?: string;
  userAgent?: string;
}

interface UserSessionData {
  users: User[];
  activeSessions: SessionData[];
  onlineCount: number;
  currentUserRole?: string; // เพิ่ม role ของคนที่ดู
}

export default function UserActivityMonitor() {
  const router = useRouter();
  const [data, setData] = useState<UserSessionData>({
    users: [],
    activeSessions: [],
    onlineCount: 0,
    currentUserRole: undefined
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kickingUserId, setKickingUserId] = useState<number | null>(null);

  const getToken = () => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        return value;
      }
    }
    return null;
  };

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        console.error('Unauthorized or Forbidden');
        router.push('/login');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error('Failed to fetch user sessions:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 5000); // Refresh every 5 seconds (ลดจาก 3 วินาที)
    return () => clearInterval(interval);
  }, []);

  const handleKickUser = async (userId: number, username: string) => {
    if (!confirm(`คุณต้องการเตะ "${username}" ออกจากระบบหรือไม่?`)) {
      return;
    }

    setKickingUserId(userId);
    try {
      const token = getToken();
      if (!token) {
        alert('ไม่พบ token กรุณาเข้าสู่ระบบใหม่');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user-sessions/kick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        await fetchData(true); // Refresh data
        alert(`เตะ "${username}" ออกจากระบบสำเร็จ`);
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.error}`);
      }
    } catch (error) {
      console.error('Error kicking user:', error);
      alert('เกิดข้อผิดพลาดในการเตะผู้ใช้');
    } finally {
      setKickingUserId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return `${days} วันที่แล้ว`;
  };

  const getBrowserName = (userAgent?: string) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const onlineUsers = data.users.filter(u => u.isOnline);
  const offlineUsers = data.users.filter(u => !u.isOnline);
  const adminCount = data.users.filter(u => u.role === 'admin').length;
  const staffCount = data.users.filter(u => u.role === 'staff').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>

        </div>
        <Button 
          onClick={() => fetchData(true)} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'กำลังโหลด...' : 'รีเฟรช'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ออนไลน์</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.onlineCount}</div>
            <p className="text-xs text-muted-foreground">
              จากทั้งหมด {data.users.length} คน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ดูแลระบบ</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adminCount}</div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">พนักงาน</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{staffCount}</div>
            <p className="text-xs text-muted-foreground">Staff users</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Online Users and Activity Logs */}
      <Tabs defaultValue="online" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="online">
            <Wifi className="h-4 w-4 mr-2" />
            ออนไลน์ ({data.onlineCount})
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-2" />
            ล็อกการใช้งาน
          </TabsTrigger>
        </TabsList>

        {/* Online Users Tab */}
        <TabsContent value="online" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-green-600" />
                ออนไลน์
              </CardTitle>
              <CardDescription>รายชื่อผู้ใช้ที่กำลังใช้งานระบบอยู่</CardDescription>
            </CardHeader>
            <CardContent>
              {data.activeSessions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <WifiOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>ไม่มีผู้ใช้ออนไลน์</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {data.activeSessions.map((session) => (
                    <div 
                      key={`${session.userId}-${session.loginAt}`}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{session.username}</div>
                          <Badge variant={session.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {session.role}
                          </Badge>
                        </div>
                      </div>
                      {/* แสดงปุ่มเตะเฉพาะ admin และเป้าหมายไม่ใช่ admin */}
                      {data.currentUserRole === 'admin' && session.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
                          onClick={() => handleKickUser(session.userId, session.username)}
                          disabled={kickingUserId === session.userId}
                          title="เตะออกจากระบบ"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                ล็อกการใช้งานทั้งหมด
              </CardTitle>
              <CardDescription>ประวัติการเข้าสู่ระบบและออกจากระบบ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.activeSessions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>ยังไม่มีล็อกการใช้งาน</p>
                  </div>
                ) : (
                  data.activeSessions.map((session) => (
                    <div 
                      key={`log-${session.userId}-${session.loginAt}`}
                      className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{session.username}</span>
                          <Badge variant={session.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {session.role}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                            เข้าสู่ระบบ
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(session.loginAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Monitor className="h-3 w-3" />
                            <span>{getBrowserName(session.userAgent)}</span>
                            {session.ipAddress && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-xs">{session.ipAddress}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          <Activity className="h-3 w-3 mr-1" />
                          {formatDate(session.lastActive)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
