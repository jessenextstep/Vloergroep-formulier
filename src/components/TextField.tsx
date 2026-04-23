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
              'pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-200',
                error
                  ? 'text-red-300'
                  : hasValue
                    ? 'text-amber-gold'
                    : 'text-white/34 group-hover:text-white/50 group-focus-within:text-amber-gold',
              )}
              aria-hidden="true"
            >
              <Icon size={17} strokeWidth={2.1} />
            </div>
          ) : null}

          {Icon ? (
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute left-[3rem] top-1/2 z-10 h-5 w-px -translate-y-1/2 transition-colors duration-200',
                error
                  ? 'bg-red-300/35'
                  : hasValue
                    ? 'bg-amber-gold/20'
                    : 'bg-white/8 group-hover:bg-white/12 group-focus-within:bg-amber-gold/20',
              )}
            />
          ) : null}

          <input
            ref={ref}
            id={inputId}
            value={value}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              'block min-h-[58px] w-full rounded-[18px] border bg-[rgba(28,28,28,0.56)] px-5 py-4 text-[16px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-[border-color,box-shadow,background-color,color] duration-200 placeholder:text-white/34 hover:border-white/16 hover:bg-[rgba(31,31,31,0.62)] focus:border-amber-gold/44 focus:bg-[rgba(35,35,35,0.68)] focus:shadow-[0_0_0_4px_rgba(224,172,62,0.06),inset_0_1px_0_rgba(255,255,255,0.025)] focus:outline-none disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-[rgba(24,24,24,0.26)] disabled:text-white/48 disabled:placeholder:text-white/24 md:text-[17px]',
              Icon ? 'pl-[3.6rem] pr-5' : 'px-5',
              error &&
                'border-red-400/55 bg-[rgba(58,34,38,0.42)] hover:border-red-400/65 hover:bg-[rgba(64,36,40,0.46)] focus:border-red-400 focus:bg-[rgba(70,38,42,0.5)] focus:shadow-[0_0_0_4px_rgba(248,113,113,0.10),inset_0_1px_0_rgba(255,255,255,0.03)]',
              !error && hasValue && 'border-white/15 bg-[rgba(30,30,30,0.6)]',
              !error && !hasValue && 'border-white/12',
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
