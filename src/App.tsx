import React, { useEffect, useState } from 'react';
import { QuizState, defaultQuizState } from './types';
import { calculateResults } from './lib/calculations';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Screens
import Screen1Hero from './screens/Screen1Hero';
import Screen2WhoAreYou from './screens/Screen2WhoAreYou';
import Screen3Base from './screens/Screen3Base';
import Screen4TimeLeak from './screens/Screen4TimeLeak';
import Screen5Cashflow from './screens/Screen5Cashflow';
import Screen7Collab from './screens/Screen7Collab';
import Screen8Loading from './screens/Screen8Loading';
import Screen9Results from './screens/Screen9Results';
import Screen10Capture from './screens/Screen10Capture';

import { BrandLogo } from './components/BrandLogo';
import { BrandWatermark } from './components/BrandWatermark';
import { StepIndicator } from './components/StepIndicator';

const TOTAL_STEPS = 5;
const QUIZ_STORAGE_KEY = 'vloergroep-groeiscan-state/v1';

function loadStoredQuizState() {
  if (typeof window === 'undefined') {
    return defaultQuizState;
  }

  try {
    const storedState = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!storedState) {
      return defaultQuizState;
    }

    return {
      ...defaultQuizState,
      ...JSON.parse(storedState),
    } as QuizState;
  } catch {
    return defaultQuizState;
  }
}

export default function App() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<QuizState>(() => loadStoredQuizState());
  const [sessionStartedAt] = useState(() => Date.now());
  const prefersReducedMotion = useReducedMotion();
  const [useCompactMotion, setUseCompactMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncMotionPreference = () => {
      setUseCompactMotion(mediaQuery.matches);
    };

    syncMotionPreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncMotionPreference);
      return () => mediaQuery.removeEventListener('change', syncMotionPreference);
    }

    mediaQuery.addListener(syncMotionPreference);
    return () => mediaQuery.removeListener(syncMotionPreference);
  }, []);

  const shouldUseSimpleMotion = prefersReducedMotion || useCompactMotion;

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: shouldUseSimpleMotion ? 'auto' : 'smooth' });
  }, [step, shouldUseSimpleMotion]);

  useEffect(() => {
    window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  
  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => Math.max(0, s - 1));
  const updateState = (updates: Partial<QuizState>) => setState(s => ({ ...s, ...updates }));

  const currentResults = calculateResults(state);

  const screenTransition = shouldUseSimpleMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: 'easeOut' as const },
      }
    : {
        initial: { opacity: 0, y: 16, scale: 0.995 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.995 },
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div className="min-h-screen w-full bg-[#061010] text-[#FBEFD5] flex flex-col font-sans selection:bg-amber-gold/30 relative isolate overflow-x-clip">
      <BrandWatermark />
      
      {/* Header / Progress */}
      {step > 0 && step <= TOTAL_STEPS && (
        <header className="flex justify-between items-center p-8 z-50">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-8 sm:h-9" />
          </div>
          <div className="flex flex-col items-end gap-2 w-64 max-w-[40%]">
             <div className="w-full">
                <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
             </div>
             <span className="text-[10px] uppercase tracking-widest text-amber-gold font-medium">
                {step === TOTAL_STEPS ? 'Groeiscan voltooid' : `Stap ${step} van ${TOTAL_STEPS}`}
             </span>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-6 pt-6 md:pt-12 pb-[140px] md:pb-28">
        <AnimatePresence mode="wait">
          
          {step === 0 && (
            <motion.div key="step-0" {...screenTransition} className="w-full max-w-2xl mx-auto">
              <Screen1Hero onNext={handleNext} />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step-1" {...screenTransition} className="w-full h-full flex flex-col">
              <Screen2WhoAreYou state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" {...screenTransition} className="w-full h-full flex flex-col">
              <Screen3Base state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step-3" {...screenTransition} className="w-full h-full flex flex-col">
              <Screen4TimeLeak state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step-4" {...screenTransition} className="w-full h-full flex flex-col">
              <Screen5Cashflow state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step-5" {...screenTransition} className="w-full h-full flex flex-col">
              <Screen7Collab state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step-6" {...screenTransition} className="w-full h-full flex flex-col">
              <Screen8Loading onNext={handleNext} />
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step-7" {...screenTransition} className="w-full max-w-4xl mx-auto">
              <Screen9Results state={state} results={currentResults} onNext={handleNext} onBack={() => setStep(5)} />
            </motion.div>
          )}

          {step === 8 && (
            <motion.div key="step-8" {...screenTransition} className="w-full h-full flex flex-col">
              <Screen10Capture state={state} results={currentResults} sessionStartedAt={sessionStartedAt} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  );
}
