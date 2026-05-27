import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, variant = 'default', size = 'default', ...props },
    ref
) {
    const variants = {
        default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
        outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
    }

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-12 px-6',
        icon: 'h-10 w-10'
    }

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    )
})

Button.displayName = 'Button'
