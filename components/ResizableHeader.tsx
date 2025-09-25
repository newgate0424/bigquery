"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { TableHead } from "@/components/ui/table"
import { ChevronUp, ChevronDown, ChevronsUpDown, GripVertical } from "lucide-react"

interface ResizableHeaderProps {
  sortKey: string
  className?: string
  width: number
  minWidth?: number
  maxWidth?: number
  onWidthChange: (width: number) => void
  sortConfig: { key: string; direction: 'asc' | 'desc' | null }
  onSort: (key: string) => void
  children: React.ReactNode
}

export function ResizableHeader({
  sortKey,
  className = "",
  width,
  minWidth = 60,
  maxWidth = 500,
  onWidthChange,
  sortConfig,
  onSort,
  children
}: ResizableHeaderProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [currentWidth, setCurrentWidth] = useState(width)
  const headerRef = useRef<HTMLTableCellElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update current width when prop changes
  useEffect(() => {
    setCurrentWidth(width)
  }, [width])

  const getSortIcon = () => {
    if (sortConfig.key === sortKey) {
      if (sortConfig.direction === 'asc') {
        return <ChevronUp className="h-3 w-3" />
      } else if (sortConfig.direction === 'desc') {
        return <ChevronDown className="h-3 w-3" />
      }
    }
    return <ChevronsUpDown className="h-3 w-3 opacity-50" />
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(currentWidth)
  }, [currentWidth])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    
    const deltaX = e.clientX - startX
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
    setCurrentWidth(newWidth)
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Throttle the onWidthChange callback to avoid too frequent updates
    saveTimeoutRef.current = setTimeout(() => {
      onWidthChange(newWidth)
      console.log(`🔄 Column ${sortKey} width changed to: ${newWidth}px`)
    }, 100) // 100ms throttle
  }, [isResizing, startX, startWidth, minWidth, maxWidth, onWidthChange, sortKey])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    
    // Final save on mouse up
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      onWidthChange(currentWidth)
      console.log(`💾 Final column ${sortKey} width saved: ${currentWidth}px`)
    }
  }, [currentWidth, onWidthChange, sortKey])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const handleSort = () => {
    onSort(sortKey)
  }

  return (
    <TableHead 
      ref={headerRef}
      className={`relative border-r border-slate-200 bg-slate-50 dark:bg-slate-700 ${className} select-none overflow-hidden`}
      style={{ width: `${currentWidth}px`, minWidth: `${currentWidth}px`, maxWidth: `${currentWidth}px` }}
    >
      <div className="flex items-center justify-center relative overflow-hidden">
        <button
          onClick={handleSort}
          className="flex items-center justify-between w-full text-[14px] font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center px-1 min-w-0 text-slate-700 dark:text-slate-200"
        >
          <span className="flex-1 text-center truncate pr-1">{children}</span>
          <span className="flex-shrink-0">{getSortIcon()}</span>
        </button>
        
        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 hover:w-1.5 transition-all duration-150 flex items-center justify-center group"
          style={{ zIndex: 10 }}
        >
          <GripVertical className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </TableHead>
  )
}