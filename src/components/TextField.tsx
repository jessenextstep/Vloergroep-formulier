import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '../lib/utils';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  labelHint?: string;
  helperText?: string;
  error?: string;
  icon?: LucideIcon;
  containerClassName?: string;
  inputClassName?: string;
}

const TextFieldBase = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      labelHint,
      helperText,
      error,
      icon: Icon,
      className,
      containerClassName,
      inputClassName,
      value,
      disabled,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [helperId, errorId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;
    const hasValue =
      typeof value === 'string'
        ? value.trim().length > 0
        : typeof value === 'number'
          ? true
          : Array.isArray(value)
            ? value.length > 0
            : false;

    return (
      <div className={cn('space-y-2.5', containerClassName)}>
        <label
          htmlFor={inputId}
          className="flex items-center gap-2 pl-1 text-[13px] font-semibold tracking-[0.01em] text-white/92"
        >
          <span>{label}</span>
          {labelHint ? <span className="text-[12px] font-medium text-white/42">{labelHint}</span> : null}
        </label>

        <div className="group relative">
          {Icon ? (
            <div
              className={cn(
                'pointer-events-none absolute left-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-200',
                error
                  ? 'bg-red-400/12 text-red-300'
                  : hasValue
                    ? 'bg-amber-gold/14 text-amber-gold'
                    : 'bg-white/[0.04] text-white/40 group-hover:text-white/58 group-focus-within:bg-white/[0.06] group-focus-within:text-amber-gold',
              )}
              aria-hidden="true"
            >
              <Icon size={17} strokeWidth={2.1} />
            </div>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            value={value}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              'block min-h-[58px] w-full rounded-[22px] border bg-[linear-gradient(180deg,rgba(15,27,27,0.98),rgba(10,20,20,0.94))] px-5 py-4 text-[16px] font-medium text-white shadow-[0_18px_36px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background-color,color] duration-200 placeholder:text-white/40 hover:border-white/22 focus:border-amber-gold/55 focus:bg-[linear-gradient(180deg,rgba(18,32,32,0.98),rgba(11,22,22,0.96))] focus:shadow-[0_0_0_4px_rgba(224,172,62,0.12),0_18px_36px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] focus:outline-none disabled:cursor-not-allowed disabled:border-white/8 disabled:text-white/48 disabled:placeholder:text-white/24 md:text-[17px]',
              Icon ? 'pl-[3.6rem] pr-5' : 'px-5',
              error &&
                'border-red-400/55 bg-[linear-gradient(180deg,rgba(24,14,16,0.98),rgba(17,10,12,0.96))] hover:border-red-400/65 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(248,113,113,0.12),0_18px_36px_rgba(0,0,0,0.22)]',
              !error && hasValue && 'border-white/18',
              !error && !hasValue && 'border-white/14',
              className,
              inputClassName,
            )}
            {...props}
          />
        </div>

        {helperText ? (
          <p id={helperId} className="pl-1 text-[12px] leading-5 text-white/58">
            {helperText}
          </p>
        ) : null}

        {error ? (
          <p id={errorId} role="alert" className="pl-1 text-[12px] font-medium leading-5 text-red-300">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

TextFieldBase.displayName = 'TextField';

export const TextField = React.memo(TextFieldBase);
