import React from 'react';
import { brandFavicon } from '../lib/brandAssets';
import { cn } from '../lib/utils';

type BrandMarkProps = React.ComponentProps<'img'>;

export function BrandMark({ className, alt = 'VloerGroep icoon', ...props }: BrandMarkProps) {
  return (
    <img
      src={brandFavicon}
      alt={alt}
      className={cn('h-10 w-10 rounded-xl object-cover shrink-0', className)}
      {...props}
    />
  );
}
