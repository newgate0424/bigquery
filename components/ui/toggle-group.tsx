"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleGroupProps {
  children: React.ReactNode
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  className?: string
}

interface ToggleGroupItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const ToggleGroupContext = React.createContext<{
  type: "single" | "multiple"
  value: string | string[]
  onValueChange: (value: string | string[]) => void
}>({
  type: "single",
  value: "",
  onValueChange: () => {}
})

export function ToggleGroup({
  children,
  type = "single",
  value = type === "multiple" ? [] : "",
  onValueChange = () => {},
  className,
}: ToggleGroupProps) {
  return (
    <ToggleGroupContext.Provider value={{ type, value, onValueChange }}>
      <div className={cn("flex items-center gap-1", className)}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

export function ToggleGroupItem({
  value,
  children,
  className,
  disabled = false,
}: ToggleGroupItemProps) {
  const { type, value: currentValue, onValueChange } = React.useContext(ToggleGroupContext)
  
  const isSelected = type === "multiple" 
    ? Array.isArray(currentValue) && currentValue.includes(value)
    : currentValue === value

  const handleClick = () => {
    if (disabled) return

    if (type === "multiple") {
      const currentValues = Array.isArray(currentValue) ? currentValue : []
      const newValues = isSelected
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      onValueChange(newValues)
    } else {
      onValueChange(isSelected ? "" : value)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "h-9 px-3 py-2",
        isSelected
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted hover:text-muted-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

ToggleGroup.Item = ToggleGroupItem