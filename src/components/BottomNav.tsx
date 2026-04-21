import React from 'react';
import { Button } from './Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
}

export function BottomNav({ 
  onNext, 
  onBack, 
  nextLabel = "Volgende", 
  backLabel = "Vorige",
  nextDisabled = false 
}: BottomNavProps) {
  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:pb-[max(env(safe-area-inset-bottom),1rem)] bg-[#061010]/80 backdrop-blur-2xl border-t border-white/5"
    >
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between px-2 sm:px-6">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} className="!px-4 !py-3 text-[14px]">
            <ChevronLeft size={18} className="mr-1 -ml-1" /> <span className="hidden sm:inline">{backLabel}</span>
          </Button>
        ) : (
          <div className="w-10" /> /* Spacer */
        )}
        <Button onClick={onNext} disabled={nextDisabled} className="!px-6 !py-3 text-[15px] flex items-center shadow-lg shadow-amber-gold/20">
          {nextLabel} <ChevronRight size={18} className="ml-1 -mr-1" />
        </Button>
      </div>
    </motion.div>
  );
}
