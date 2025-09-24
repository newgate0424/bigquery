"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "@/lib/theme-context"
import { Bell, Search, Settings, User, Moon, Sun, ChevronDown, Clock, LogOut, UserCog, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/MainSidebar"
import LogoutModal from "@/components/LogoutModal"

// Page title mapping
const pageTitles: { [key: string]: string } = {
  "/": "หน้าแรก",
  "/overview": "ภาพรวมระบบ",
  "/dashboard": "แดชบอร์ด", 
  "/content": "เนื้อหา",
  "/monitor": "Monitor",
  "/settings": "ตั้งค่า",
  "/users": "จัดการผู้ใช้",
  "/login": "เข้าสู่ระบบ",
  "/register": "สมัครสมาชิก"
}

// Breadcrumb generator
const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = [{ label: 'หน้าแรก', href: '/' }]
  
  let currentPath = ''
  segments.forEach(segment => {
    currentPath += `/${segment}`
    const title = pageTitles[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
    breadcrumbs.push({ label: title, href: currentPath })
  })
  
  return breadcrumbs
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { effectiveTheme, setMode, colors } = useTheme()
  const { toggleSidebar } = useSidebar()
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const isDark = effectiveTheme === 'dark'
  const breadcrumbs = generateBreadcrumbs(pathname)
  const pageTitle = pageTitles[pathname] || '170sa'

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark')
  }

  const handleSettingsClick = () => {
    router.push('/settings')
  }

  const handleNotificationsClick = () => {
    // แสดง dropdown หรือไปหน้า notifications
    setNotifications(0) // Reset การแจ้งเตือน
    console.log('เปิดการแจ้งเตือน')
  }

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu)
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
    setShowUserMenu(false)
  }

  const handleLogoutConfirm = async () => {
    if (isLoggingOut) return
    
    try {
      setIsLoggingOut(true)
      setShowLogoutConfirm(false)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      // ลบข้อมูลออกจากระบบไม่ว่าผลลัพธ์ของ API จะเป็นอย่างไร
      localStorage.removeItem('user')
      setUser(null)
      router.push('/login')
      
    } catch (error) {
      console.error('Logout error:', error)
      // แม้เกิด error ก็ให้ลบข้อมูลและไป login
      localStorage.removeItem('user')
      setUser(null)
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleProfileClick = () => {
    router.push('/users')
    setShowUserMenu(false)
  }

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Load user data
  useEffect(() => {
    if (!isHydrated) return
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        setUser(JSON.parse(userStr))
      }
    } catch {}
  }, [isHydrated])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as Element
        if (!target.closest('[data-user-menu]')) {
          setShowUserMenu(false)
        }
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showLogoutConfirm) {
          setShowLogoutConfirm(false)
        } else if (showUserMenu) {
          setShowUserMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showUserMenu, showLogoutConfirm])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  if (!isHydrated) {
    return (
      <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-600/50">
        <div className="animate-pulse h-full bg-slate-200/50 dark:bg-slate-700/50"></div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-600/50 shadow-lg">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Hamburger Menu, Breadcrumbs & Page Title */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all group border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md"
            title="เปิด/ปิด Sidebar"
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: colors.primary }}
              ></div>
              {pageTitle}
            </h1>
            <nav className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>}
                  <span className={cn(
                    "transition-colors cursor-pointer",
                    index === breadcrumbs.length - 1 
                      ? "font-medium" 
                      : ""
                  )}
                  style={index === breadcrumbs.length - 1 
                    ? { color: colors.primary }
                    : {}
                  }
                  onMouseEnter={(e) => {
                    if (index !== breadcrumbs.length - 1) {
                      e.currentTarget.style.color = colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== breadcrumbs.length - 1) {
                      e.currentTarget.style.color = '';
                    }
                  }}
                  >
                    {crumb.label}
                  </span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Right: Time, User Info, Theme Toggle, Notifications */}
        <div className="flex items-center space-x-3">
          {/* Date & Time */}
          <div className="hidden lg:flex flex-col items-end text-sm bg-slate-50/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-200/50 dark:border-slate-600/50">
            <div className="text-slate-700 dark:text-slate-200 font-semibold tabular-nums">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {formatDate(currentTime).split(' ').slice(0, 2).join(' ')}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all group border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md"
            title={isDark ? "เปลี่ยนเป็น Light Mode" : "เปลี่ยนเป็น Dark Mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 group-hover:text-slate-700 transition-colors" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={handleNotificationsClick}
              className="p-2.5 bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all group border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md"
            >
              <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-400 to-pink-400 rounded-full text-xs text-white flex items-center justify-center shadow-sm animate-pulse">
                  <span className="text-[10px] font-bold">{notifications}</span>
                </span>
              )}
            </button>
          </div>

          {/* Settings */}
          <button 
            onClick={handleSettingsClick}
            className="p-2.5 bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all group border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md"
          >
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors group-hover:rotate-90" />
          </button>

          {/* User Menu */}
          {user && (
            <div className="relative" data-user-menu>
              <button
                onClick={handleUserMenuClick}
                className="flex items-center space-x-2 backdrop-blur-sm rounded-xl px-3 py-2 transition-all cursor-pointer group border shadow-sm hover:shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}10)`,
                  borderColor: `${colors.primary}40`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary}30, ${colors.primary}20)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}10)`;
                }}
              >
                <div 
                  className="p-1.5 rounded-lg shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}CC)` }}
                >
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {user.username}
                  </span>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: colors.primary }}
                  >
                    {user.role}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "h-3 w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all",
                  showUserMenu ? "rotate-180" : ""
                )} />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-600/50 py-2 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors"
                  >
                    <UserCog className="h-4 w-4 mr-3" />
                    จัดการผู้ใช้
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    disabled={isLoggingOut}
                    className={cn(
                      "w-full flex items-center px-4 py-2 text-sm transition-colors",
                      isLoggingOut 
                        ? "text-slate-400 dark:text-slate-500 cursor-not-allowed" 
                        : "text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20"
                    )}
                  >
                    <LogOut className={cn(
                      "h-4 w-4 mr-3 transition-transform",
                      isLoggingOut && "animate-spin"
                    )} />
                    {isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </header>
  )
}