import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface SegmentedControlProps<T extends string | number> {
  options: { label: string; value: T; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
  size = 'md',
  layout = 'horizontal',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "flex w-full p-1 bg-near-black border border-white/10 rounded-2xl",
        layout === 'vertical' ? 'flex-col gap-1' : 'flex-row items-center',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex flex-col items-center justify-center font-medium transition-colors w-full rounded-xl z-10",
              size === 'sm' ? "py-2 px-3 text-sm" : 
              size === 'md' ? "py-3 px-4 text-[15px]" : 
              "py-4 px-6 text-base",
              isSelected ? "text-near-black" : "text-white/70 hover:text-white"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={`segment-bg-${options[0].value}`} // simplistic approach
                className="absolute inset-0 bg-amber-gold rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-20 text-center">{option.label}</span>
            {option.description && (
              <span className={cn(
                "relative z-20 text-xs mt-1 text-center",
                isSelected ? "text-near-black/70" : "text-white/40"
              )}>
                {option.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
