'use client';

import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import type { GenericInputProps } from './types';

export type { GenericInputProps };

export const GenericInput = forwardRef<HTMLInputElement, GenericInputProps>(
  (
    {
      label,
      error,
      hint,
      required,
      disabled,
      className = '',
      inputClassName,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            disabled={disabled}
            className={`
              block w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'}
              ${inputClassName}
            `}
            aria-invalid={hasError}
            aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
            {...props}
          />

          {hasError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>

        {error && (
          <p id={`${props.id}-error`} className="text-sm text-red-600 flex items-center gap-1">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${props.id}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

GenericInput.displayName = 'GenericInput';
