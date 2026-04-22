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

export function Slider({ 
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
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-2 p-5 sm:p-6 rounded-[24px] bg-white/10 border border-white/20 backdrop-blur-xl transition-all duration-300 hover:border-amber-gold/50 hover:bg-white/20 relative overflow-hidden group", className)}>
       <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-3">
           {icon && <div className="text-amber-gold bg-amber-gold/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>}
           <div className="flex flex-col">
             <label htmlFor={sliderId} className="font-semibold text-white px-2 leading-tight pr-2">{label}</label>
             {description && <span className="text-[12px] text-white/70 mt-1">{description}</span>}
           </div>
         </div>
         <div className="font-bold font-display text-amber-gold text-base sm:text-lg bg-near-black px-4 py-1.5 rounded-full border border-white/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] whitespace-nowrap flex-shrink-0 min-w-[72px] text-center flex items-center justify-center">
           {formatValue(value)}
         </div>
       </div>
       
       <div className="relative pt-4 pb-6 px-1">
         
         {/* Custom Track Background for better depth */}
         <div className="absolute top-[22px] left-1 right-1 h-2 bg-[#1a1a1a] rounded-full shadow-inner pointer-events-none" />
         
         <input 
           id={sliderId}
           type="range"
           min={min}
           max={max}
           step={step}
           value={value}
           onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full relative z-10"
           aria-label={label}
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
