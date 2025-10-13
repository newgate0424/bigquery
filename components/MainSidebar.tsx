"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme-context"
import { useUserPreferences } from "@/lib/preferences"
import { BarChart3, Monitor, Home, Settings, Database, Users, TrendingUp, CreditCard } from "lucide-react"
import { useState, useEffect, createContext, useContext } from "react"

// Context สำหรับจัดการ sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  toggleSidebar: () => void;
} | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true); // เปลี่ยนค่าเริ่มต้นเป็น true (ปิด)
  const [isHydrated, setIsHydrated] = useState(false);
  const { preferences, updateSidebarSettings } = useUserPreferences();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load sidebar state from preferences or localStorage (fallback)
  useEffect(() => {
    if (!isHydrated) return;
    
    // First try to load from user preferences
    if (preferences?.sidebarSettings?.isOpen !== undefined) {
      setIsCollapsed(!preferences.sidebarSettings.isOpen);
      return;
    }
    
    // Fallback to localStorage for backwards compatibility
    try {
      const savedCollapsed = localStorage.getItem("sidebar-collapsed");
      if (savedCollapsed !== null) {
        const collapsed = JSON.parse(savedCollapsed);
        setIsCollapsed(collapsed);
        // Sync to database
        updateSidebarSettings({ isOpen: !collapsed });
      }
    } catch {}
  }, [isHydrated, preferences?.sidebarSettings?.isOpen]);

  // Save sidebar state to both localStorage and database
  const toggleSidebar = () => {
    if (!isHydrated) return;
    const newCollapsed = !isCollapsed;
    const newIsOpen = !newCollapsed;
    
    setIsCollapsed(newCollapsed);
    
    // Update both localStorage (for immediate response) and database (for persistence)
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newCollapsed));
    } catch {}
    
    // Update database
    updateSidebarSettings({ 
      isOpen: newIsOpen,
      width: newCollapsed ? 64 : 256,  // collapsed width vs expanded width
      collapsedMode: newCollapsed
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

const sidebarItems = [
  {
    title: "ภาพรวม",
    icon: Home,
    href: "/overview",
  },
  {
    title: "Adser",
    icon: TrendingUp,
    href: "/adser",
  },
  {
    title: "Monitor",
    icon: Monitor,
    href: "/monitor",
  },
  {
    title: "Card Maker",
    icon: CreditCard,
    href: "/card-maker",
  },
  {
    title: "Users",
    icon: Users,
    href: "/users",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function MainSidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const { colors } = useTheme();

  return (
    <div className={cn(
      "h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200 border-r border-slate-200/50 dark:border-slate-600/50 transition-all duration-300 shadow-lg relative overflow-hidden",
      isCollapsed ? "w-16" : "w-64"
    )}>

      <div className={cn("p-6", isCollapsed ? "px-2" : "")}>
        {/* Header */}
        <div className={cn(
          "flex items-center mb-8 transition-all duration-300",
          isCollapsed ? "justify-center" : "gap-2"
        )}>
          <div 
            className="p-2 backdrop-blur-sm rounded-xl shadow-md border flex-shrink-0"
            style={{
              backgroundColor: `${colors.primary}20`,
              borderColor: `${colors.primary}40`
            }}
          >
            <Database 
              className="h-8 w-8" 
              style={{ color: colors.primary }}
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-slate-700 dark:text-slate-200 truncate">170sa</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Dashboard</p>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative group",
                  isActive
                    ? "text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200",
                  isCollapsed ? "justify-center" : ""
                )}
                style={isActive ? {
                  backgroundColor: colors.primary,
                  boxShadow: `0 4px 14px 0 ${colors.primary}40`
                } : {}}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '';
                  }
                }}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && item.title}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div 
                    className="absolute left-full ml-2 px-2 py-1 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg backdrop-blur-sm"
                    style={{ backgroundColor: `${colors.primary}E6` }}
                  >
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom Info */}
      <div className={cn(
        "absolute bottom-4 transition-all duration-300",
        isCollapsed ? "left-1 right-1" : "left-4 right-4"
      )}>
        {/* Connected Status */}
        <div className={cn(
          "bg-white/60 dark:bg-slate-600/60 backdrop-blur-sm rounded-lg transition-all duration-300 border shadow-sm",
          isCollapsed ? "p-1.5 mx-auto w-10 h-10 flex items-center justify-center" : "p-3"
        )}
        style={{ borderColor: `${colors.primary}30` }}>
          {isCollapsed ? (
            <div className="relative group">
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: colors.primary }}
              ></div>
              {/* Tooltip for collapsed state */}
              <div 
                className="absolute left-full ml-2 px-2 py-1 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg backdrop-blur-sm"
                style={{ backgroundColor: `${colors.primary}E6` }}
              >
                Connected to 170sa Database
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 truncate">Connected to</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">170sa Database</p>
              <div className="flex items-center gap-1 mt-1 min-w-0">
                <div 
                  className="w-2 h-2 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: colors.primary }}
                ></div>
                <span 
                  className="text-xs truncate"
                  style={{ color: colors.primary }}
                >
                  Online
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}