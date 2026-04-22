import React from 'react';
import { cn } from '../lib/utils';

interface SliderProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  marks?: { value: number; label: string }[];
  formatValue?: (val: number) => string;
  className?: string;
}

function SliderComponent({ 
  label, 
  description,
  icon, 
  value, 
  onChange, 
  min = 0, 
  max = 10, 
  step = 0.5,
  marks,
  formatValue = v => `${v}`,
  className 
}: SliderProps) {
  const sliderId = React.useId();
  const descriptionId = description ? `${sliderId}-description` : undefined;
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(19,31,31,0.94),rgba(9,18,18,0.9))] p-5 sm:p-6 backdrop-blur-2xl shadow-[0_18px_40px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-amber-gold/30 hover:shadow-[0_20px_48px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.06)] focus-within:border-amber-gold/45 focus-within:shadow-[0_0_0_4px_rgba(224,172,62,0.08),0_20px_48px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)]",
        className,
      )}
    >
       <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-3">
           {icon && <div className="rounded-xl bg-amber-gold/12 p-2.5 text-amber-gold transition-all duration-200 group-hover:scale-[1.04] group-focus-within:bg-amber-gold/16">{icon}</div>}
           <div className="flex flex-col">
             <label htmlFor={sliderId} className="font-semibold text-white px-2 leading-tight pr-2">{label}</label>
             {description && <span id={descriptionId} className="mt-1 text-[12px] leading-5 text-white/80">{description}</span>}
           </div>
         </div>
         <div className="flex min-w-[72px] flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/12 bg-[#081212]/92 px-4 py-1.5 text-center font-display text-base font-bold text-amber-gold shadow-[inset_0_2px_10px_rgba(0,0,0,0.45)] transition-colors duration-200 group-focus-within:border-amber-gold/30 sm:text-lg">
           {formatValue(value)}
         </div>
       </div>
       
       <div className="relative pt-4 pb-6 px-1">
         
         {/* Custom Track Background for better depth */}
         <div className="pointer-events-none absolute left-1 right-1 top-[22px] h-2 rounded-full bg-[#050c0c] shadow-[inset_0_1px_4px_rgba(255,255,255,0.04),inset_0_2px_6px_rgba(0,0,0,0.6)]" />
         
         <input 
           id={sliderId}
           type="range"
           min={min}
           max={max}
           step={step}
           value={value}
           onChange={e => onChange(parseFloat(e.target.value))}
            className="relative z-10 w-full touch-pan-y"
           aria-label={label}
           aria-describedby={descriptionId}
           aria-valuetext={formatValue(value)}
           style={{
             background: `linear-gradient(to right, var(--color-amber-gold) 0%, var(--color-amber-gold) ${percentage}%, transparent ${percentage}%, transparent 100%)`
           }}
         />
         
         {/* Visible Scale / Tick Marks */}
         {marks && (
           <div className="absolute top-[38px] left-2 right-2 flex justify-between pointer-events-none">
             {marks.map((m, i) => {
                return (
                  <div 
                    key={i} 
                    className="absolute flex flex-col items-center -translate-x-1/2"
                    style={{ left: ((m.value - min) / (max - min)) * 100 + "%" }}
                  >
                    <div className="w-0.5 h-1.5 bg-white/40 rounded-full mb-1" />
                    <span className="text-[10px] text-white/60 font-medium whitespace-nowrap">
                      {m.label}
                    </span>
                  </div>
                );
             })}
           </div>
         )}
       </div>
    </div>
  );
}

SliderComponent.displayName = 'Slider';

export const Slider = React.memo(SliderComponent);
