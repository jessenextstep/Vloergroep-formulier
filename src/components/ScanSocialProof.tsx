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
}

const vakmanPhotos = [vakman1, vakman2, vakman3, vakman4, vakman5, vakman7];
const socialProofCount = (import.meta.env.VITE_SCAN_SOCIAL_PROOF_COUNT as string | undefined)?.trim() || '100+';

export function ScanSocialProof({
  className,
  title = `Al door ${socialProofCount} vakmannen ingevuld`,
}: ScanSocialProofProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-left',
        className,
      )}
    >
      <div className="flex shrink-0 items-center pl-1">
        {vakmanPhotos.map((photo, index) => (
          <img
            key={photo}
            src={photo}
            alt=""
            aria-hidden="true"
            className={cn(
              'h-9 w-9 rounded-full border border-white/12 object-cover shadow-[0_10px_24px_rgba(0,0,0,0.18)]',
              index > 0 && '-ml-2.5',
            )}
          />
        ))}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-medium tracking-[-0.02em] text-white/72 md:text-[14px]">
          {title}
        </div>
      </div>
    </div>
  );
}
