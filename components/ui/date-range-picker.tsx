"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

export function DateRangePicker({
  date,
  onDateChange,
  placeholder = "เลือกช่วงวันที่",
  className,
}: DateRangePickerProps) {
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date)
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeQuickSelect, setActiveQuickSelect] = React.useState<string | null>(null)

  // Set default date range to current month if no date is provided
  React.useEffect(() => {
    if (!date) {
      const today = new Date()
      const firstDayOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1))
      const lastDayOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0))
      
      const defaultRange = { from: firstDayOfMonth, to: lastDayOfMonth }
      setTempDate(defaultRange)
      onDateChange?.(defaultRange)
    }
  }, [date, onDateChange])

  // ฟังก์ชันสำหรับตัวเลือกด่วน
  const handleQuickSelect = (type: string) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let newRange: DateRange | undefined
    
    switch (type) {
      case 'today':
        const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
        newRange = { from: todayUTC, to: todayUTC }
        break
      case 'yesterday':
        const yesterdayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1))
        newRange = { from: yesterdayUTC, to: yesterdayUTC }
        break
      case 'thisMonth':
        const firstDayOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1))
        const lastDayOfMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0))
        
        newRange = { from: firstDayOfMonth, to: lastDayOfMonth }
        break
      case 'lastMonth':
        const firstDayOfLastMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth() - 1, 1))
        const lastDayOfLastMonth = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 0))
        
        newRange = { from: firstDayOfLastMonth, to: lastDayOfLastMonth }
        break
      case 'thisYear':
        const firstDayOfYear = new Date(Date.UTC(today.getFullYear(), 0, 1))
        const lastDayOfYear = new Date(Date.UTC(today.getFullYear(), 11, 31))
        newRange = { from: firstDayOfYear, to: lastDayOfYear }
        break
    }
    
    setTempDate(newRange)
    setActiveQuickSelect(type)
  }

  // ฟังก์ชันยืนยันการเลือก
  const handleApply = () => {
    onDateChange?.(tempDate)
    setIsOpen(false)
  }

  // ฟังก์ชันยกเลิก
  const handleCancel = () => {
    setTempDate(date)
    setActiveQuickSelect(null)
    setIsOpen(false)
  }

  // ฟังก์ชันเมื่อเลือกวันที่ด้วยปฏิทิน
  const handleCalendarSelect = (range: DateRange | undefined) => {
    setTempDate(range)
    setActiveQuickSelect(null) // ล้าง quick select เมื่อเลือกจากปฏิทิน
  }

  // อัปเดต tempDate เมื่อ date เปลี่ยน
  React.useEffect(() => {
    setTempDate(date)
    setActiveQuickSelect(null)
  }, [date])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal text-ms",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3 w-3" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-none p-0" align="start" side="bottom">
          <div className="flex">
            {/* ตัวเลือกด่วนทางซ้าย */}
            <div className="border-r p-3 space-y-2 w-[130px]">
              <div className="text-sm font-medium text-gray-700 mb-2">ตัวเลือกด่วน</div>
              <div className="space-y-1">
                <Button
                  variant={activeQuickSelect === 'today' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start text-sm h-8 px-2"
                  onClick={() => handleQuickSelect('today')}
                >
                  วันนี้
                </Button>
                <Button
                  variant={activeQuickSelect === 'yesterday' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start text-sm h-8 px-2"
                  onClick={() => handleQuickSelect('yesterday')}
                >
                  เมื่อวาน
                </Button>
                <Button
                  variant={activeQuickSelect === 'thisMonth' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start text-sm h-8 px-2"
                  onClick={() => handleQuickSelect('thisMonth')}
                >
                  เดือนนี้
                </Button>
                <Button
                  variant={activeQuickSelect === 'lastMonth' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start text-sm h-8 px-2"
                  onClick={() => handleQuickSelect('lastMonth')}
                >
                  เดือนที่แล้ว
                </Button>
                <Button
                  variant={activeQuickSelect === 'thisYear' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start text-sm h-8 px-2"
                  onClick={() => handleQuickSelect('thisYear')}
                >
                  ปีนี้
                </Button>
              </div>
            </div>
            
            {/* ปฏิทินทางขวา */}
            <div className="flex flex-col">
              <Calendar
                mode="range"
                defaultMonth={tempDate?.from || new Date()}
                selected={tempDate}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                className="p-1"
              />
              
              {/* ปุ่มตกลงและยกเลิก */}
              <div className="border-t p-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-3"
                  onClick={handleCancel}
                >
                  ยกเลิก
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-7 px-3"
                  onClick={handleApply}
                >
                  ตกลง
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}