import React from 'react';

import vakman1 from '../Afbeeldingen/Vakmannen/Network-effect-Vloerspot-1.webp';
import vakman2 from '../Afbeeldingen/Vakmannen/Network-effect-Vloerspot-2.webp';
import vakman3 from '../Afbeeldingen/Vakmannen/Network-effect-Vloerspot-3.webp';
import vakman4 from '../Afbeeldingen/Vakmannen/Network-effect-Vloerspot-4.webp';
import vakman5 from '../Afbeeldingen/Vakmannen/Network-effect-Vloerspot-5.webp';
import vakman7 from '../Afbeeldingen/Vakmannen/Network-effect-Vloerspot-7.webp';
import { cn } from '../lib/utils';

interface ScanSocialProofProps {
  className?: string;
  title?: string;
  align?: 'left' | 'center';
}

const vakmanPhotos = [vakman1, vakman2, vakman3, vakman4, vakman5, vakman7];
const socialProofCount = (import.meta.env.VITE_SCAN_SOCIAL_PROOF_COUNT as string | undefined)?.trim() || '100+';

export function ScanSocialProof({
  className,
  title = `${socialProofCount} vakmannen deden deze scan al`,
  align = 'left',
}: ScanSocialProofProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 text-left',
        align === 'center' && 'justify-center text-center',
        className,
      )}
    >
      <div className={cn('flex shrink-0 items-center pl-0.5', align === 'center' && 'justify-center')}>
        {vakmanPhotos.map((photo, index) => (
          <img
            key={photo}
            src={photo}
            alt=""
            aria-hidden="true"
            className={cn(
              'h-8 w-8 rounded-full border border-white/10 object-cover ring-[1.5px] ring-[#080805] shadow-[0_8px_18px_rgba(0,0,0,0.2)]',
              index > 0 && '-ml-2',
            )}
          />
        ))}
      </div>

      <div className="min-w-0">
        <div className="text-[13px] font-medium tracking-[-0.02em] text-white/64 md:text-[13px]">
          {title}
        </div>
      </div>
    </div>
  );
}
