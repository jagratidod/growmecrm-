import React from 'react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || (props.name ? `checkbox-${props.name}` : undefined)

    return (
      <label
        htmlFor={inputId}
        className="inline-flex items-center gap-2 cursor-pointer select-none group"
      >
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded border border-slate-400 bg-white peer-checked:bg-slate-700 peer-checked:border-slate-700 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-1 transition-colors flex items-center justify-center ${className}`}
          >
            <svg
              className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform duration-150 stroke-[3]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
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
