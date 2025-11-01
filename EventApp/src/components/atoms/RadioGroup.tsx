"use client"

import type React from "react"

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  label?: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  name: string
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, value, onChange, error, name }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-foreground mb-2">{label}</label>}
      <div className="flex gap-6">
        {options.map((option) => (
          <label key={option.value} className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-primary border-input focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="text-foreground">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
