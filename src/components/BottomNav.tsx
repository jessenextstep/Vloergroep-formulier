import React from 'react';
import { Button } from './Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface BottomNavProps {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
}

function BottomNavComponent({ 
  onNext, 
  onBack, 
  nextLabel = "Volgende", 
  backLabel = "Vorige",
  nextDisabled = false 
}: BottomNavProps) {
  return (
    <nav
      aria-label="Stapnavigatie"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#061010]/88 p-3 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-2xl sm:p-4 sm:pb-[max(env(safe-area-inset-bottom),1rem)]"
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
    </nav>
  );
}

BottomNavComponent.displayName = 'BottomNav';

export const BottomNav = React.memo(BottomNavComponent);
