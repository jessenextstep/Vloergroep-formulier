import React from 'react';
import { cn } from '../lib/utils';

type ScreenHeroImageProps = React.ComponentProps<'img'>;

export function ScreenHeroImage({ className, alt = '', ...props }: ScreenHeroImageProps) {
  return (
    <div className={cn('overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1717] shadow-[0_18px_52px_rgba(0,0,0,0.28)]', className)}>
      <img
        alt={alt}
        className="block h-[190px] w-full object-cover md:h-[230px]"
        {...props}
      />
    </div>
  );
}
