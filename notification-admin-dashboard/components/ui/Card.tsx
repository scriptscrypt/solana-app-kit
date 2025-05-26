import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
    return (
        <div
            className={clsx(
                'bg-gray-800 border border-gray-700 rounded-lg shadow-lg',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
    return (
        <div
            className={clsx(
                'px-6 py-4 border-b border-gray-700',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
    return (
        <h3
            className={clsx(
                'text-lg font-semibold text-white',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
    return (
        <div
            className={clsx(
                'px-6 py-4',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
} 