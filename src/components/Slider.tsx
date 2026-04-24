import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface SliderProps {
  label: string;
  description?: string;
  infoTooltip?: {
    title?: string;
    body: string;
  };
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
  infoTooltip,
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
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
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
        "group relative overflow-hidden rounded-[24px] border border-white/9 bg-[linear-gradient(180deg,rgba(38,38,38,0.44),rgba(18,18,18,0.22))] p-5 sm:p-6 backdrop-blur-2xl shadow-[0_14px_34px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300 hover:border-white/12 hover:shadow-[0_16px_38px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.025)] focus-within:border-amber-gold/24 focus-within:shadow-[0_0_0_4px_rgba(224,172,62,0.05),0_16px_38px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.025)]",
        className,
      )}
    >
       <div className="mb-2 flex items-start justify-between gap-4">
         <div className="flex min-w-0 flex-1 items-start gap-3 text-left">
           {icon && <div className="rounded-xl bg-amber-gold/8 p-2.5 text-amber-gold transition-all duration-200 group-hover:bg-amber-gold/10 group-focus-within:bg-amber-gold/12">{icon}</div>}
           <div className="flex min-w-0 flex-1 flex-col items-start text-left">
             <div className="flex w-full items-start gap-2">
               <label htmlFor={sliderId} className="block flex-1 text-left font-semibold leading-tight text-white">{label}</label>
               {infoTooltip ? (
                 <div
                   className="relative shrink-0"
                   onMouseEnter={() => setTooltipOpen(true)}
                   onMouseLeave={() => setTooltipOpen(false)}
                 >
                   <button
                     type="button"
                     aria-label={infoTooltip.title || 'Uitleg'}
                     aria-expanded={tooltipOpen}
                     onClick={() => setTooltipOpen((current) => !current)}
                     onBlur={() => setTooltipOpen(false)}
                     className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 hover:border-white/16 hover:bg-white/[0.08] hover:text-white/82"
                   >
                     <Info size={13} />
                   </button>
                   <div
                     className={cn(
                       'pointer-events-none absolute right-0 top-8 z-20 w-[260px] rounded-[18px] border border-white/10 bg-[#141414]/95 p-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl transition-all duration-200',
                       tooltipOpen ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                     )}
                   >
                     {infoTooltip.title ? (
                       <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-gold">
                         {infoTooltip.title}
                       </div>
                     ) : null}
                     <p className="text-[12px] leading-5 text-white/78">
                       {infoTooltip.body}
                     </p>
                   </div>
                 </div>
               ) : null}
             </div>
             {description && <span id={descriptionId} className="mt-1 block w-full text-left text-[12px] leading-5 text-white/80">{description}</span>}
           </div>
         </div>
         <div className="flex min-w-[72px] flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/8 bg-[rgba(20,20,20,0.9)] px-4 py-1.5 text-center font-display text-base font-bold text-amber-gold shadow-[inset_0_1px_6px_rgba(0,0,0,0.24)] transition-colors duration-200 group-focus-within:border-amber-gold/18 sm:text-lg">
           {formatValue(value)}
         </div>
       </div>
       
       <div className="relative px-1 pb-7 pt-4 sm:pb-8">
         
         {/* Custom Track Background for better depth */}
         <div className="pointer-events-none absolute left-1 right-1 top-[22px] h-2 rounded-full bg-[rgba(10,10,10,0.96)] shadow-[inset_0_1px_3px_rgba(255,255,255,0.015),inset_0_2px_5px_rgba(0,0,0,0.38)]" />
         
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
