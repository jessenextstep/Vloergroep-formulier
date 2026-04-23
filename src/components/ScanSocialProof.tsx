import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

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
const SOCIAL_PROOF_COUNT_STORAGE_KEY = 'vloergroep-social-proof-count/v1';
const SOCIAL_PROOF_ANIMATED_STORAGE_KEY = 'vloergroep-social-proof-animated/v1';

function parseSocialProofCount(value: string) {
  const match = value.match(/^(\d+)(\+)?$/);

  if (!match) {
    return null;
  }

  return {
    baseCount: Number(match[1]),
    suffix: match[2] ?? '',
  };
}

function formatSocialProofCount(value: number, suffix: string) {
  return `${new Intl.NumberFormat('nl-NL').format(value)}${suffix}`;
}

export function ScanSocialProof({
  className,
  title = '{{count}} vakmannen deden deze scan al',
  align = 'left',
}: ScanSocialProofProps) {
  const parsedCount = React.useMemo(() => parseSocialProofCount(socialProofCount), []);
  const shouldReduceMotion = useReducedMotion();
  const [displayCount, setDisplayCount] = React.useState<number | null>(() => {
    if (!parsedCount || typeof window === 'undefined') {
      return parsedCount?.baseCount ?? null;
    }

    try {
      const stored = window.sessionStorage.getItem(SOCIAL_PROOF_COUNT_STORAGE_KEY);
      const storedCount = stored ? Number.parseInt(stored, 10) : Number.NaN;
      return Number.isFinite(storedCount) ? Math.max(storedCount, parsedCount.baseCount) : parsedCount.baseCount;
    } catch {
      return parsedCount.baseCount;
    }
  });

  React.useEffect(() => {
    if (!parsedCount || shouldReduceMotion || typeof window === 'undefined') {
      return;
    }

    try {
      if (window.sessionStorage.getItem(SOCIAL_PROOF_ANIMATED_STORAGE_KEY) === '1') {
        return;
      }
    } catch {
      return;
    }

    const steps = Math.random() < 0.5 ? 1 : 2;
    const timers: number[] = [];

    for (let index = 0; index < steps; index += 1) {
      const delay = 1500 + index * (560 + Math.round(Math.random() * 320));
      timers.push(
        window.setTimeout(() => {
          setDisplayCount((current) => {
            const safeCurrent = typeof current === 'number' ? current : parsedCount.baseCount;
            const next = safeCurrent + 1;

            try {
              window.sessionStorage.setItem(SOCIAL_PROOF_COUNT_STORAGE_KEY, String(next));
            } catch {
              // Ignore storage failures and keep the UI responsive.
            }

            return next;
          });
        }, delay),
      );
    }

    timers.push(
      window.setTimeout(() => {
        try {
          window.sessionStorage.setItem(SOCIAL_PROOF_ANIMATED_STORAGE_KEY, '1');
        } catch {
          // Ignore storage failures and keep the UI responsive.
        }
      }, 1500 + steps * 1000),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [parsedCount, shouldReduceMotion]);

  const formattedCount = parsedCount && typeof displayCount === 'number'
    ? formatSocialProofCount(displayCount, parsedCount.suffix)
    : socialProofCount;
  const [titlePrefix, titleSuffix] = title.includes('{{count}}')
    ? title.split('{{count}}')
    : ['', title];

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
          {titlePrefix}
          <span className="relative inline-grid min-w-max align-baseline">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={formattedCount}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.94, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{
                  opacity: 0,
                  y: -12,
                  scale: 1.04,
                  filter: 'blur(4px)',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.7 }}
                className="inline-flex items-center font-semibold text-white/84"
              >
                {formattedCount}
              </motion.span>
            </AnimatePresence>
          </span>
          {titleSuffix}
        </div>
      </div>
    </div>
  );
}
