import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, selected, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white/[0.02] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] shadow-black/50 rounded-[28px] p-6 sm:p-8 transition-all duration-300 relative",
          interactive && "cursor-pointer hover:border-amber-gold/40 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)]",
          selected && "border-amber-gold/60 bg-amber-gold/[0.03] shadow-[0_0_30px_rgba(224,172,62,0.2)]",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 rounded-[28px] border-[0.5px] border-white/10 pointer-events-none mix-blend-overlay" />
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
