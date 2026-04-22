import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  selected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, selected, children, onKeyDown, role, tabIndex, ...props }, ref) => {
    const resolvedRole = role ?? (interactive ? 'button' : undefined);

    return (
      <div
        ref={ref}
        role={resolvedRole}
        tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
        aria-pressed={interactive && resolvedRole === 'button' ? selected : undefined}
        aria-checked={interactive && resolvedRole === 'radio' ? selected : undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && interactive && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        className={cn(
          "bg-[linear-gradient(180deg,rgba(58,58,58,0.44),rgba(45,45,45,0.22))] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] shadow-black/50 rounded-[28px] p-6 sm:p-8 transition-all duration-300 relative",
          interactive && "cursor-pointer hover:border-amber-gold/40 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] focus-visible:border-amber-gold/70 focus-visible:bg-white/[0.06]",
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
