"use client";

import { CalendarDays, User, Filter, Eye, Grid } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useUserPreferences, FilterSettings } from "@/lib/preferences";
import { useEffect, useState } from 'react';

type PageDisplayMode = 'grid' | 'list' | 'compact';
type StatusFilter = 'all' | 'active' | 'inactive' | 'pending';

interface ContentFilterSidebarProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedAdser: string;
  setSelectedAdser: (adser: string) => void;
  advertisers: string[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function ContentFilterSidebar({ dateRange, setDateRange, selectedAdser, setSelectedAdser, advertisers, isLoading, onRefresh }: ContentFilterSidebarProps) {
  const { preferences, updateFilterSettings } = useUserPreferences();
  
  // Local state for additional filter options
  const [pageDisplayMode, setPageDisplayMode] = useState<PageDisplayMode>('grid');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showInactiveContent, setShowInactiveContent] = useState(false);

  // Load filter preferences from database or localStorage
  useEffect(() => {
    if (preferences?.filterSettings) {
      const filters = preferences.filterSettings;
      console.log('Loading filter preferences from database:', filters);
      
      // Restore date range
      if (filters.dateRange?.from && filters.dateRange?.to) {
        const restoredRange = {
          from: new Date(filters.dateRange.from),
          to: new Date(filters.dateRange.to)
        };
        setDateRange(restoredRange);
      }
      
      // Restore other filters
      if (filters.selectedAdser) {
        setSelectedAdser(filters.selectedAdser);
      }
      setPageDisplayMode((filters.pageDisplayMode as PageDisplayMode) || 'grid');
      setStatusFilter((filters.statusFilter as StatusFilter) || 'all');
      setShowInactiveContent(filters.showInactiveContent || false);
      
      return;
    }
    
    // Fallback to localStorage for backwards compatibility
    const savedFilters = localStorage.getItem('content-filter-settings');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters) as FilterSettings;
        console.log('Loading filters from localStorage, will sync to database:', filters);
        
        // Apply settings from localStorage
        if (filters.dateRange?.from && filters.dateRange?.to) {
          const restoredRange = {
            from: new Date(filters.dateRange.from),
            to: new Date(filters.dateRange.to)
          };
          setDateRange(restoredRange);
        }
        if (filters.selectedAdser) {
          setSelectedAdser(filters.selectedAdser);
        }
        setPageDisplayMode((filters.pageDisplayMode as PageDisplayMode) || 'grid');
        setStatusFilter((filters.statusFilter as StatusFilter) || 'all');
        setShowInactiveContent(filters.showInactiveContent || false);
        
        // Sync to database
        if (updateFilterSettings) {
          updateFilterSettings(filters);
        }
      } catch (error) {
        console.error('Failed to parse saved filter settings:', error);
      }
    }
  }, [preferences?.filterSettings, setDateRange, setSelectedAdser]);

  // Save filter preferences to both localStorage and database
  const saveFilterPreferences = (newFilters: Partial<FilterSettings>) => {
    const currentFilters: FilterSettings = {
      dateRange: dateRange ? {
        from: dateRange.from?.toISOString(),
        to: dateRange.to?.toISOString()
      } : undefined,
      selectedAdser,
      pageDisplayMode,
      statusFilter,
      showInactiveContent,
      ...newFilters
    };
    
    // Save to localStorage for immediate response
    localStorage.setItem('content-filter-settings', JSON.stringify(currentFilters));
    
    // Save to database for persistence across devices
    if (updateFilterSettings) {
      updateFilterSettings(currentFilters);
      console.log('Filter preferences saved:', currentFilters);
    }
  };

  // Enhanced handlers for filter changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    saveFilterPreferences({
      dateRange: range ? {
        from: range.from?.toISOString(),
        to: range.to?.toISOString()
      } : undefined
    });
  };

  const handleAdserChange = (adser: string) => {
    setSelectedAdser(adser);
    saveFilterPreferences({ selectedAdser: adser });
  };

  const handleDisplayModeChange = (mode: PageDisplayMode) => {
    setPageDisplayMode(mode);
    saveFilterPreferences({ pageDisplayMode: mode });
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    saveFilterPreferences({ statusFilter: status });
  };

  const handleShowInactiveChange = (show: boolean) => {
    setShowInactiveContent(show);
    saveFilterPreferences({ showInactiveContent: show });
  };

  return (
    <aside className="w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-6">
      {/* Date Range Filter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="h-4 w-4 text-green-600" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ช่วงวันที่</label>
        </div>
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateRangeChange}
          className="w-full"
        />
      </div>

      {/* Advertiser Filter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-purple-600" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ผู้ลงโฆษณา</label>
        </div>
        <select
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={selectedAdser}
          onChange={e => handleAdserChange(e.target.value)}
        >
          <option value="all">ทั้งหมด</option>
          {advertisers.map(adser => (
            <option key={adser} value={adser}>{adser}</option>
          ))}
        </select>
      </div>

      {/* Page Display Mode */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Grid className="h-4 w-4 text-blue-600" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">รูปแบบการแสดง</label>
        </div>
        <select
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={pageDisplayMode}
          onChange={e => handleDisplayModeChange(e.target.value as PageDisplayMode)}
        >
          <option value="grid">ตาราง</option>
          <option value="list">รายการ</option>
          <option value="compact">แบบกะทัดรัด</option>
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-orange-600" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">สถานะ</label>
        </div>
        <select
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={statusFilter}
          onChange={e => handleStatusFilterChange(e.target.value as StatusFilter)}
        >
          <option value="all">ทั้งหมด</option>
          <option value="active">ใช้งานอยู่</option>
          <option value="inactive">หยุดใช้งาน</option>
          <option value="pending">รอดำเนินการ</option>
        </select>
      </div>

      {/* Show Inactive Content Toggle */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-4 w-4 text-indigo-600" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">แสดงเนื้อหา</label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showInactiveContent}
            onChange={e => handleShowInactiveChange(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-gray-600 dark:text-gray-400">แสดงเนื้อหาที่หยุดใช้งาน</span>
        </label>
      </div>

      {/* Refresh Button */}
      <button
        className="w-full py-2 px-4 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition mt-6"
        onClick={onRefresh}
        disabled={isLoading}
      >
        รีเฟรชข้อมูล
      </button>
    </aside>
  );
}
