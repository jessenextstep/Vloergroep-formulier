import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { brandWatermarkIcon } from '../lib/brandAssets';

interface Props {
  onNext: () => void;
}

export default function Screen8Loading({ onNext }: Props) {
  const [currentLine, setCurrentLine] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const lines = useMemo(
    () => [
      "Data veilig verwerken...",
      "Tijdlekken analyseren...",
      "Groeipotentieel berekenen...",
      "Jouw business case opstellen..."
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const lineDelay = prefersReducedMotion ? 900 : 1100;
    const finishDelay = prefersReducedMotion ? 200 : 350;

    const cycleLines = async () => {
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) {
          return;
        }
        setCurrentLine(i);
        await new Promise(res => {
          const timeoutId = window.setTimeout(res, lineDelay);
          timers.push(timeoutId);
        });
      }
      const finalTimeout = window.setTimeout(() => {
        if (!cancelled) {
          onNext();
        }
      }, finishDelay);
      timers.push(finalTimeout);
    };

    cycleLines();

    return () => {
      cancelled = true;
      timers.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [lines, onNext, prefersReducedMotion]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto w-full">
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
        <motion.div
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.04, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border border-amber-gold/18 bg-amber-gold/6 shadow-[0_0_42px_rgba(224,172,62,0.14)]"
        />

        <motion.div
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border border-white/10 border-t-amber-gold/70 will-change-transform"
        />

        <div className="relative z-10 rounded-full bg-[linear-gradient(180deg,rgba(38,38,38,0.62),rgba(18,18,18,0.38))] p-5 text-amber-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
          <motion.div
            animate={prefersReducedMotion ? undefined : { scale: [0.96, 1.04, 0.96], rotate: [0, 0, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-9 w-9 bg-amber-gold drop-shadow-[0_0_10px_rgba(224,172,62,0.45)]"
            style={{
              WebkitMask: `url("${brandWatermarkIcon}") center / contain no-repeat`,
              mask: `url("${brandWatermarkIcon}") center / contain no-repeat`,
            }}
          >
          </motion.div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold font-display mb-6 tracking-tight text-white">Scan afronden...</h2>

      <div className="relative flex h-10 w-full items-center justify-center overflow-hidden" role="status" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentLine}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16, filter: prefersReducedMotion ? 'blur(0px)' : 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -16, filter: prefersReducedMotion ? 'blur(0px)' : 'blur(4px)' }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.35 }}
            className="absolute text-amber-gold/90 text-sm md:text-base font-medium whitespace-normal w-full px-4 text-center leading-snug"
          >
            {lines[currentLine]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Line */}
      <div className="w-48 h-1 bg-white/5 rounded-full mt-10 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-transparent via-amber-gold to-transparent"
          initial={prefersReducedMotion ? false : { x: "-100%" }}
          animate={prefersReducedMotion ? { x: "0%" } : { x: "100%" }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 1.5, repeat: Infinity, ease: "linear" }
          }
        />
      </div>
      
    </div>
  );
}
