import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")

  const selectedOption = options.find(option => option.value === selectedValue)

  const handleSelect = (optionValue: string) => {
    if (disabled) return
    
    setSelectedValue(optionValue)
    onValueChange?.(optionValue)
    setIsOpen(false)
  }

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn(
          "truncate",
          !selectedOption && "text-muted-foreground"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 opacity-50 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                  option.disabled && "opacity-50 cursor-not-allowed",
                  selectedValue === option.value && "bg-accent text-accent-foreground"
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
              >
                {selectedValue === option.value && (
                  <Check className="absolute left-2 h-4 w-4" />
                )}
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
