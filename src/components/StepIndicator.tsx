import React from 'react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
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
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
}
