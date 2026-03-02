import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'pill'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none',
          {
            'rounded-xl bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-md focus:ring-primary-500':
              variant === 'primary',
            'rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm focus:ring-primary-500':
              variant === 'secondary',
            'rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500':
              variant === 'ghost',
            'rounded-xl bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-md focus:ring-red-500':
              variant === 'danger',
            'rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-lg focus:ring-primary-500':
              variant === 'pill',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
