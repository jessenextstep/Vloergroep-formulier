import React from 'react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function StepIndicatorComponent({ currentStep, totalSteps }: StepIndicatorProps) {
  const progress = (Math.max(1, currentStep) / totalSteps) * 100;

  return (
    <div
      className="w-full h-1 bg-[#2d2d2d] rounded-full overflow-hidden"
      role="progressbar"
      aria-label="Voortgang groeiscan"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={Math.max(1, currentStep)}
      aria-valuetext={`Stap ${Math.max(1, currentStep)} van ${totalSteps}`}
    >
      <motion.div
        className="h-full bg-amber-gold rounded-full"
        initial={false}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}

StepIndicatorComponent.displayName = 'StepIndicator';

export const StepIndicator = React.memo(StepIndicatorComponent);
