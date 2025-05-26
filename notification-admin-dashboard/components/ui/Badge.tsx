import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gray';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function Badge({
    variant = 'default',
    size = 'md',
    children,
    className,
    ...props
}: BadgeProps) {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';

    const variantClasses = {
        default: 'bg-gray-700 text-gray-300',
        success: 'bg-green-900/50 text-green-300 border border-green-700',
        warning: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
        error: 'bg-red-900/50 text-red-300 border border-red-700',
        info: 'bg-blue-900/50 text-blue-300 border border-blue-700',
        gray: 'bg-gray-700 text-gray-300',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={clsx(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
} 