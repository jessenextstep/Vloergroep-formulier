import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export default function Screen8Loading({ onNext }: Props) {
  const [currentLine, setCurrentLine] = useState(0);

  const lines = [
    "Data veilig verwerken...",
    "Tijdlekken analyseren...",
    "Groeipotentieel berekenen...",
    "Jouw business case opstellen..."
  ];

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const cycleLines = async () => {
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) {
          return;
        }
        setCurrentLine(i);
        await new Promise(res => {
          const timeoutId = window.setTimeout(res, 1250);
          timers.push(timeoutId);
        });
      }
      const finalTimeout = window.setTimeout(() => {
        if (!cancelled) {
          onNext();
        }
      }, 400);
      timers.push(finalTimeout);
    };

    cycleLines();

    return () => {
      cancelled = true;
      timers.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [onNext]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto w-full">
      
      {/* Magical Scanning Orb */}
      <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
        {/* Deep Glow */}
        <motion.div 
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-amber-gold/40 rounded-full blur-[40px]"
        />
        
        {/* Core Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border-[2px] border-[#FBEFD5]/10 border-t-amber-gold rounded-full"
        />
        
        {/* Reverse Ring */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-6 border-[2px] border-amber-gold/20 border-b-amber-gold/60 rounded-full"
        />

        {/* Center Sparkles */}
        <div className="relative z-10 text-amber-gold">
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={40} className="drop-shadow-[0_0_15px_rgba(224,172,62,0.8)]" />
          </motion.div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold font-display mb-6 tracking-tight text-white">Scan afronden...</h2>

      <div className="h-10 relative w-full overflow-hidden flex justify-center items-center" aria-live="polite">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentLine}
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.4 }}
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
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
    </div>
  );
}
