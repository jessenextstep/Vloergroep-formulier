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
  caption?: string;
}

const vakmanPhotos = [vakman1, vakman2, vakman3, vakman4, vakman5, vakman7];
const socialProofCount = (import.meta.env.VITE_SCAN_SOCIAL_PROOF_COUNT as string | undefined)?.trim() || '100+';

export function ScanSocialProof({
  className,
  title = `Al door ${socialProofCount} vakmannen ingevuld`,
  caption = 'Kort, concreet en bedoeld om snel te zien wat VloerGroep voor jouw bedrijf kan vrijspelen.',
}: ScanSocialProofProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(30,30,30,0.44),rgba(15,15,15,0.24))] px-4 py-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl',
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
              'h-11 w-11 rounded-full border-2 border-[#0b0b0b] object-cover shadow-[0_10px_24px_rgba(0,0,0,0.22)]',
              index > 0 && '-ml-3',
            )}
          />
        ))}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-semibold tracking-[-0.02em] text-white md:text-[15px]">
          {title}
        </div>
        <p className="mt-1 text-xs leading-5 text-white/56 md:text-[13px]">
          {caption}
        </p>
      </div>
    </div>
  );
}
