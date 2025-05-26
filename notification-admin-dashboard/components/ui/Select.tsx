import React from 'react';
import { clsx } from 'clsx';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
    onChange?: (value: string) => void;
}

export function Select({
    label,
    error,
    helperText,
    options,
    placeholder,
    required,
    className,
    onChange,
    value,
    ...props
}: SelectProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}
            <select
                className={clsx(
                    'block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                    className
                )}
                value={value}
                onChange={handleChange}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled className="text-gray-400">
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-700 text-white">
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-400">{helperText}</p>
            )}
        </div>
    );
} 