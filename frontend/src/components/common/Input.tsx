'use client'

import { forwardRef, InputHTMLAttributes, useId } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || `input-${generatedId}`

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-2)]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 border rounded-lg transition-all',
            'focus:outline-none focus:ring-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-black text-[var(--text-1)] placeholder:text-[var(--text-2)]/50',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 bg-red-500/5'
              : 'border-[var(--border)] focus:border-white/30 focus:ring-white/30 hover:border-white/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-[var(--text-2)]">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
