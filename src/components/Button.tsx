import React from 'react';
import { cn } from '../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-display font-black tracking-[-0.03em] [font-weight:800] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-gold focus:ring-offset-near-black disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-[#e0ac3e] text-[#061010] hover:scale-105 shadow-[0_0_30px_rgba(224,172,62,0.3)]",
      secondary: "bg-[#2d2d2d] text-white hover:bg-[#3d3d3d] border border-white/10",
      ghost: "bg-transparent text-[#e0ac3e]/80 hover:text-[#e0ac3e] hover:bg-[#e0ac3e]/10 border border-transparent",
    };

    const sizes = "px-10 py-5 text-lg";

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes,
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
