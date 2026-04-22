import React from 'react';
import { brandLogo } from '../lib/brandAssets';
import { cn } from '../lib/utils';

type BrandLogoProps = React.ComponentProps<'img'>;

export function BrandLogo({ className, alt = 'VloerGroep', ...props }: BrandLogoProps) {
  return (
    <img
      src={brandLogo}
      alt={alt}
      className={cn('h-8 w-auto object-contain', className)}
      {...props}
    />
  );
}
