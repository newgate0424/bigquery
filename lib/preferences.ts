import { useState, useEffect, useCallback } from 'react';
import { PreferenceNotifications } from './notifications';
import { PreferencesDebouncer } from './preferences-debouncer';

export interface ColorRule {
  id: string;
  column: string;
  condition: 'greater' | 'less' | 'between' | 'contains' | 'equals' | 'not_contains';
  value1: number | string;
  value2?: number | string;
  isPercentage: boolean;
  isTextCondition: boolean;
  color: string;
  backgroundColor: string;
  isBold: boolean;
  enabled: boolean;
}

export interface ColorConfig {
  [columnKey: string]: ColorRule[];
}

export interface UserPreferences {
  id: number;
  userId: number;
  sidebarSettings?: SidebarSettings;
  themeSettings?: ThemeSettings;
  filterSettings?: FilterSettings;
  columnVisibility?: ColumnVisibility;
  columnWidths?: ColumnWidths;
  colorConfiguration?: ColorConfig;
  tableSettings?: TableSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface SidebarSettings {
  isOpen: boolean;
  width?: number;
  collapsedMode?: boolean;
}

export interface ThemeSettings {
  primaryColor?: string;
  backgroundColor?: string;
  isDarkMode?: boolean;
  fontFamily?: string;
  fontSize?: number;
  customColors?: {
    [key: string]: string;
  };
}

export interface SortSettings {
  column: string;
  direction: 'asc' | 'desc';
  timestamp?: number;
}

export interface FilterSettings {
  dateRange?: {
    from?: string; // Store as ISO string for JSON compatibility
    to?: string;
  };
  searchText?: string;
  selectedTeam?: string;
  selectedAdser?: string;
  selectedAdvertiser?: string;
  pageDisplayMode?: string;
  selectedStatus?: string;
  statusFilter?: string;
  showInactiveContent?: boolean;
  sortSettings?: SortSettings;
}

export interface ColumnVisibility {
  [columnKey: string]: boolean;
}

export interface ColumnWidths {
  [columnKey: string]: number;
}

export interface TableSettings {
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc' | null;
  };
  pageSize?: number;
  currentPage?: number;
}

// ฟังก์ชันสำหรับเรียก API preferences
export class PreferencesAPI {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  // Utility function for retry logic
  private static async withRetry<T>(
    operation: () => Promise<T>, 
    retries: number = this.MAX_RETRIES,
    delay: number = this.RETRY_DELAY
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Don't retry auth errors or on last retry
      if (retries > 0 && !this.isAuthError(error)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(operation, retries - 1, delay * 1.5); // Exponential backoff
      }
      throw error;
    }
  }

  // Check if error is authentication related (don't retry these)
  private static isAuthError(error: unknown): boolean {
    return (error as { status?: number })?.status === 401 || (error as { status?: number })?.status === 403;
  }

  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // ดึงข้อมูล preferences ทั้งหมด
  static async getPreferences(): Promise<UserPreferences | null> {
    return this.withRetry(async () => {
      const response = await fetch('/api/preferences', {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        
        // If unauthorized, user might not be logged in
        if (response.status === 401) {
          console.warn('User not authenticated, preferences not available');
          const authError = new Error('Unauthorized');
          (authError as Error & { status: number }).status = 401;
          throw authError;
        }
        
        // Try to get error message from response
        try {
          const errorData = await response.json();
          console.error('API Error Details:', errorData);
          const apiError = new Error(errorData.error || 'API Error');
          (apiError as Error & { status: number }).status = response.status;
          throw apiError;
        } catch {
          console.error('Could not parse error response');
          const apiError = new Error('API Error');
          (apiError as Error & { status: number }).status = response.status;
          throw apiError;
        }
      }

      return await response.json();
    }).catch(error => {
      if (this.isAuthError(error)) {
        console.warn('Authentication error, returning null');
        return null;
      }
      console.error('Failed to fetch preferences after retries:', error);
      return null; // Return null on network errors to allow fallback to localStorage
    });
  }

  // บันทึก preferences ทั้งหมด
  static async savePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(preferences)
      });

      return response.ok;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  // อัปเดตเฉพาะส่วนที่ต้องการ
  static async updatePreferences(
    type: 'sidebar' | 'theme' | 'filter' | 'columns' | 'widths' | 'colors' | 'table',
    data: SidebarSettings | ThemeSettings | FilterSettings | ColumnVisibility | ColumnWidths | ColorConfig | TableSettings
  ): Promise<boolean> {
    // ตรวจสอบว่าผู้ใช้ยัง login อยู่หรือไม่
    const token = localStorage.getItem('token');
    if (!token) {
      console.log(`Skipping ${type} preferences update - user not authenticated`);
      return false;
    }
    
    return this.withRetry(async () => {
      const payload = { type, data };
      
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = `Failed to update ${type} preferences`;
        try {
          const errorData = await response.text();
          if (errorData) {
            errorMessage += `: ${errorData}`;
          }
        } catch (e) {
          // Ignore parsing error
        }
        const apiError = new Error(errorMessage);
        (apiError as Error & { status: number }).status = response.status;
        throw apiError;
      }

      return true;
    }).catch(error => {
      console.error(`Error updating ${type} preferences:`, error);
      // Don't fail silently - let user know about sync issues
      if (!this.isAuthError(error)) {
        // Show user notification about sync failure
        const typeNames: Record<string, string> = {
          sidebar: 'แถบด้านข้าง',
          theme: 'ธีม',
          filter: 'ตัวกรอง',
          columns: 'คอลัมน์',
          widths: 'ความกว้างคอลัมน์',
          colors: 'สีและรูปแบบ',
          table: 'ตาราง'
        };
        
        PreferenceNotifications.syncError(typeNames[type] || type);
      }
      return false;
    });
  }

  // อัปเดต sidebar settings
  static async saveSidebarSettings(sidebarSettings: SidebarSettings): Promise<boolean> {
    return this.updatePreferences('sidebar', sidebarSettings);
  }

  // อัปเดต theme settings
  static async saveThemeSettings(themeSettings: ThemeSettings): Promise<boolean> {
    return this.updatePreferences('theme', themeSettings);
  }

  // อัปเดต filter settings
  static async saveFilterSettings(filterSettings: FilterSettings): Promise<boolean> {
    return this.updatePreferences('filter', filterSettings);
  }

  // อัปเดต column visibility
  static async saveColumnVisibility(columnVisibility: ColumnVisibility): Promise<boolean> {
    return this.updatePreferences('columns', columnVisibility);
  }

  // อัปเดต column widths
  static async saveColumnWidths(columnWidths: ColumnWidths): Promise<boolean> {
    return this.updatePreferences('widths', columnWidths);
  }

  // อัปเดต color configuration
  static async saveColorConfiguration(colorConfiguration: ColorConfig): Promise<boolean> {
    return this.updatePreferences('colors', colorConfiguration);
  }

  // อัปเดต table settings
  static async saveTableSettings(tableSettings: TableSettings): Promise<boolean> {
    return this.updatePreferences('table', tableSettings);
  }
}

// Hook สำหรับใช้ใน React components
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncer = PreferencesDebouncer.getInstance();

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping preferences load');
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔍 Loading user preferences from database...');
      const userPrefs = await PreferencesAPI.getPreferences();
      console.log('✅ User preferences loaded successfully:', userPrefs);
      
      if (userPrefs?.columnWidths) {
        console.log('📏 Column widths found in preferences:', userPrefs.columnWidths);
      } else {
        console.log('📏 No column widths found in preferences');
      }
      
      setPreferences(userPrefs);
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load preferences on component mount
    loadPreferences();
    
    // Listen for user login events to reload preferences
    const handleUserLogin = (event: CustomEvent) => {
      console.log('User logged in event received, reloading preferences...', event.detail);
      loadPreferences();
    };

    // Handle logout - cancel all pending preferences updates
    const handleUserLogout = () => {
      console.log('User logged out - cancelling all preference updates');
      debouncer.cancelAll();
      setPreferences(null);
      setLoading(false);
      setError(null);
    };

    // Add event listeners
    window.addEventListener('userLoggedIn', handleUserLogin as EventListener);
    window.addEventListener('userLoggedOut', handleUserLogout as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin as EventListener);
      window.removeEventListener('userLoggedOut', handleUserLogout as EventListener);
      // Cancel any pending updates when component unmounts
      debouncer.cancelAll();
    };
  }, [loadPreferences]);

  const updateSidebarSettings = useCallback(async (sidebarSettings: SidebarSettings) => {
    // บันทึกใน localStorage ทันที
    localStorage.setItem('sidebarSettings', JSON.stringify(sidebarSettings));
    
    // Update local state immediately - DISABLED for debugging
    if (false) {
      setPreferences(prevPrefs => {
        if (prevPrefs) {
          return {
            ...prevPrefs,
            sidebarSettings
          };
        }
        return prevPrefs;
      });
    }
    
    // Debounce API call
    debouncer.debounceUpdate('sidebar', sidebarSettings, async () => {
      const success = await PreferencesAPI.saveSidebarSettings(sidebarSettings);
      if (!success) {
        console.warn('Failed to sync sidebar settings to server');
      }
      return success;
    });
    
    return true; // Return immediately since we update localStorage
  }, [debouncer]);

  const updateThemeSettings = useCallback(async (themeSettings: ThemeSettings) => {
    // บันทึกใน localStorage ทันที
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
    
    // Update local state immediately - DISABLED for debugging
    if (false) {
      setPreferences(prevPrefs => {
        if (prevPrefs) {
          return {
            ...prevPrefs,
            themeSettings
          };
        }
        return prevPrefs;
      });
    }
    
    // Debounce API call
    debouncer.debounceUpdate('theme', themeSettings, async () => {
      const success = await PreferencesAPI.saveThemeSettings(themeSettings);
      if (!success) {
        console.warn('Failed to sync theme settings to server');
      }
      return success;
    });
    
    return true;
  }, [debouncer]);

  const updateFilterSettings = useCallback(async (filterSettings: FilterSettings) => {
    // บันทึกใน localStorage ทันที
    localStorage.setItem('filterSettings', JSON.stringify(filterSettings));
    
    // Update local state immediately - DISABLED for debugging
    if (false) {
      setPreferences(prevPrefs => {
        if (prevPrefs) {
          return {
            ...prevPrefs,
            filterSettings
          };
        }
        return prevPrefs;
      });
    }
    
    // Debounce API call
    debouncer.debounceUpdate('filter', filterSettings, async () => {
      const success = await PreferencesAPI.saveFilterSettings(filterSettings);
      if (!success) {
        console.warn('Failed to sync filter settings to server');
      }
      return success;
    });
    
    return true;
  }, [debouncer]);

  const updateColumnVisibility = useCallback(async (columnVisibility: ColumnVisibility) => {
    // บันทึกใน localStorage ทันที
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
    
    // Update local state immediately - DISABLED for debugging
    if (false) {
      setPreferences(prevPrefs => {
        if (prevPrefs) {
          return {
            ...prevPrefs,
            columnVisibility
          };
        }
        return prevPrefs;
      });
    }
    
    // Debounce API call
    debouncer.debounceUpdate('columns', columnVisibility, async () => {
      const success = await PreferencesAPI.saveColumnVisibility(columnVisibility);
      if (!success) {
        console.warn('Failed to sync column visibility to server');
      }
      return success;
    });
    
    return true;
  }, [debouncer]);

  const updateColumnWidths = useCallback(async (columnWidths: ColumnWidths) => {
    // บันทึกใน localStorage ทันที
    localStorage.setItem('columnWidths', JSON.stringify(columnWidths));
    
    // Update local state immediately - DISABLED for debugging
    if (false) {
      setPreferences(prevPrefs => {
        if (prevPrefs) {
          return {
            ...prevPrefs,
            columnWidths
          };
        }
        return prevPrefs;
      });
    }
    
    // Debounce API call
    debouncer.debounceUpdate('widths', columnWidths, async () => {
      const success = await PreferencesAPI.saveColumnWidths(columnWidths);
      if (!success) {
        console.warn('Failed to sync column widths to server');
      }
      return success;
    });
    
    return true;
  }, [debouncer]);

  const updateColorConfiguration = useCallback(async (colorConfiguration: ColorConfig) => {
    // บันทึกใน localStorage ทันที
    localStorage.setItem('colorConfiguration', JSON.stringify(colorConfiguration));
    
    const success = await PreferencesAPI.saveColorConfiguration(colorConfiguration);
    if (false && success) { // DISABLED for debugging
      setPreferences(prevPrefs => {
        if (prevPrefs) {
          return {
            ...prevPrefs,
            colorConfiguration
          };
        }
        return prevPrefs;
      });
    }
    return success;
  }, []);

  const updateTableSettings = useCallback(async (tableSettings: TableSettings) => {
    // บันทึกใน localStorage ทันที
    localStorage.setItem('tableSettings', JSON.stringify(tableSettings));
    
    const success = await PreferencesAPI.saveTableSettings(tableSettings);
    if (false && success) { // DISABLED for debugging
      setPreferences(prevPrefs => {
        if (prevPrefs) {
          return {
            ...prevPrefs,
            tableSettings
          };
        }
        return prevPrefs;
      });
    }
    return success;
  }, []);

  return {
    preferences,
    loading,
    error,
    updateSidebarSettings,
    updateThemeSettings,
    updateFilterSettings,
    updateColumnVisibility,
    updateColumnWidths,
    updateColorConfiguration,
    updateTableSettings
  };
}