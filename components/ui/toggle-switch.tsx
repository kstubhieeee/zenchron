"use client"

import { cn } from "@/lib/utils"

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  leftLabel: string
  rightLabel: string
  className?: string
}

export function ToggleSwitch({ checked, onChange, leftLabel, rightLabel, className }: ToggleSwitchProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <span className={cn("text-sm font-medium", !checked ? "text-gray-900" : "text-gray-500")}>{leftLabel}</span>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          checked ? "bg-blue-600" : "bg-gray-200",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
      <span className={cn("text-sm font-medium", checked ? "text-gray-900" : "text-gray-500")}>{rightLabel}</span>
      {checked && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
          -20%
        </span>
      )}
    </div>
  )
}
