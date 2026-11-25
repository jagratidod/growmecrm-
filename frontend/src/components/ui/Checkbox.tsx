import React from 'react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, checked, ...props }, ref) => {
    const inputId = id || (props.name ? `checkbox-${props.name}` : undefined)

    return (
      <label
        htmlFor={inputId}
        className="inline-flex items-center gap-2.5 cursor-pointer select-none group"
      >
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center ${
              checked
                ? 'bg-[#453372] border-[#453372] text-white shadow-xs'
                : 'border-slate-300 bg-white group-hover:border-[#453372]'
            } ${className}`}
          >
            {checked && (
              <svg
                className="w-3 h-3 text-white stroke-[3]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
          {label}
        </span>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
