import React from 'react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="w-full h-1 bg-[#2d2d2d] rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-amber-gold rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(Math.max(1, currentStep) / totalSteps) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
}
