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
  tickEvery?: number;
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
  tickEvery,
  marks,
  formatValue = v => `${v}`,
  className 
}: SliderProps) {
  const sliderId = React.useId();
  const descriptionId = description ? `${sliderId}-description` : undefined;
  const percentage = ((value - min) / (max - min)) * 100;
  const scaleTicks = React.useMemo(() => {
    if (tickEvery && tickEvery > 0) {
      const ticks = new Set<number>();

      for (let current = min; current <= max; current += tickEvery) {
        ticks.add(Number(current.toFixed(4)));
      }

      ticks.add(min);
      ticks.add(max);
      marks?.forEach((mark) => ticks.add(Number(mark.value.toFixed(4))));

      return Array.from(ticks).sort((a, b) => a - b);
    }

    const totalSteps = Math.round((max - min) / step);

    if (!Number.isFinite(totalSteps) || totalSteps <= 0) {
      return [];
    }

    if (totalSteps <= 18) {
      return Array.from({ length: totalSteps + 1 }, (_, index) => Number((min + index * step).toFixed(4)));
    }

    const interval = Math.ceil(totalSteps / 12);
    const ticks = new Set<number>();

    for (let index = 0; index <= totalSteps; index += interval) {
      ticks.add(Number((min + index * step).toFixed(4)));
    }

    ticks.add(min);
    ticks.add(max);
    marks?.forEach((mark) => ticks.add(Number(mark.value.toFixed(4))));

    return Array.from(ticks).sort((a, b) => a - b);
  }, [marks, max, min, step, tickEvery]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(61,61,61,0.62),rgba(45,45,45,0.42))] p-5 sm:p-6 backdrop-blur-2xl shadow-[0_18px_40px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.035)] transition-all duration-300 hover:border-amber-gold/24 hover:shadow-[0_20px_48px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.045)] focus-within:border-amber-gold/38 focus-within:shadow-[0_0_0_4px_rgba(224,172,62,0.07),0_20px_48px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.045)]",
        className,
      )}
    >
       <div className="mb-2 flex items-start justify-between gap-4">
         <div className="flex min-w-0 flex-1 items-start gap-3 text-left">
           {icon && <div className="rounded-xl bg-amber-gold/12 p-2.5 text-amber-gold transition-all duration-200 group-hover:scale-[1.04] group-focus-within:bg-amber-gold/16">{icon}</div>}
           <div className="flex min-w-0 flex-1 flex-col items-start text-left">
             <label htmlFor={sliderId} className="block w-full text-left font-semibold leading-tight text-white">{label}</label>
             {description && <span id={descriptionId} className="mt-1 block w-full text-left text-[12px] leading-5 text-white/80">{description}</span>}
           </div>
         </div>
         <div className="flex min-w-[72px] flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/12 bg-[rgba(45,45,45,0.88)] px-4 py-1.5 text-center font-display text-base font-bold text-amber-gold shadow-[inset_0_2px_10px_rgba(0,0,0,0.35)] transition-colors duration-200 group-focus-within:border-amber-gold/26 sm:text-lg">
           {formatValue(value)}
         </div>
       </div>
       
       <div className="relative px-1 pb-7 pt-4 sm:pb-8">
         
         {/* Custom Track Background for better depth */}
         <div className="pointer-events-none absolute left-1 right-1 top-[22px] h-2 rounded-full bg-[rgba(24,24,24,0.9)] shadow-[inset_0_1px_4px_rgba(255,255,255,0.03),inset_0_2px_6px_rgba(0,0,0,0.5)]" />
         
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

         {scaleTicks.length > 0 && (
           <div className="pointer-events-none absolute left-2 right-2 top-[36px]">
             {scaleTicks.map((tickValue, index) => {
               const tickPercent = ((tickValue - min) / (max - min)) * 100;
               const edgeAlignedTransform =
                 tickPercent <= 0 ? 'translateX(0%)' : tickPercent >= 100 ? 'translateX(-100%)' : 'translateX(-50%)';

               return (
                 <span
                   key={`${tickValue}-${index}`}
                   className="absolute block h-2 w-px rounded-full bg-white/22"
                   style={{ left: `${tickPercent}%`, transform: edgeAlignedTransform }}
                 />
               );
             })}
           </div>
         )}
         
         {/* Visible Scale / Tick Marks */}
         {marks && (
           <div className="pointer-events-none absolute left-2 right-2 top-[34px]">
             {marks.map((m, i) => {
                const markPercent = ((m.value - min) / (max - min)) * 100;
                const markTransform =
                  markPercent <= 0 ? 'translateX(0%)' : markPercent >= 100 ? 'translateX(-100%)' : 'translateX(-50%)';

                return (
                  <div 
                    key={i} 
                    className="absolute flex flex-col items-center"
                    style={{ left: `${markPercent}%`, transform: markTransform }}
                  >
                    <div className="mb-1 h-2.5 w-0.5 rounded-full bg-white/44" />
                    <span className="whitespace-nowrap text-[10px] font-medium text-white/62 sm:text-[11px]">
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
