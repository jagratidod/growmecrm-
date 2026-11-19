import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
  error?: string
  containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      leftIcon,
      rightElement,
      error,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div
          className={`relative flex items-center bg-[#f3f4f6] rounded-xl transition-all duration-200 border ${
            error
              ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
              : 'border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:shadow-sm'
          }`}
        >
          {leftIcon && (
            <div className="pl-4 pr-1 text-slate-700 flex items-center pointer-events-none select-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-transparent px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 font-normal focus:outline-none ${
              leftIcon ? 'pl-2.5' : ''
            } ${rightElement ? 'pr-2' : ''} ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="pr-4 flex items-center">{rightElement}</div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
