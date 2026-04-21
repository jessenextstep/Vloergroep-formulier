import React from 'react';
import { cn } from '../lib/utils';
import { Plus, Minus } from 'lucide-react';

interface StepperProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 10000,
  step = 1,
  prefix = '',
  suffix = '',
  className
}: StepperProps) {
  const handleDecrement = () => onChange(Math.max(min, value - step));
  const handleIncrement = () => onChange(Math.min(max, value + step));

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-charcoal/40 border border-white/5", className)}>
      <span className="text-[17px] font-medium text-white/90">{label}</span>
      <div className="flex items-center gap-4 bg-near-black p-1.5 rounded-xl border border-white/10 shrink-0">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="p-2.5 rounded-lg text-white/70 hover:text-amber-gold hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
        <div className="w-20 text-center font-mono text-lg font-medium text-white">
          {prefix}{value}{suffix}
        </div>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="p-2.5 rounded-lg text-white/70 hover:text-amber-gold hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
