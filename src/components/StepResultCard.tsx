import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/utils';

type StepResultCardProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
  }
>;

type AnimatedResultValueProps = React.HTMLAttributes<HTMLSpanElement> & {
  value: React.ReactNode;
  className?: string;
};

export function StepResultCard({ className, children, ...props }: StepResultCardProps) {
  return (
    <div
      className={cn(
        'mb-12 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(58,58,58,0.46),rgba(45,45,45,0.22))] p-5 text-center shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AnimatedResultValue({
  value,
  className,
  ...props
}: AnimatedResultValueProps) {
  const displayValue = String(value);

  return (
    <span
      className="relative inline-grid min-w-max align-baseline"
      aria-label={displayValue}
      {...props}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={displayValue}
          layout
          initial={{ opacity: 0, y: 18, scale: 0.92, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{
            opacity: 0,
            y: -18,
            scale: 1.08,
            filter: 'blur(6px)',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 26, mass: 0.7 }}
          className={cn(
            'inline-flex items-center font-semibold text-amber-gold drop-shadow-[0_0_18px_rgba(224,172,62,0.25)]',
            className,
          )}
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
