import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { QuizState, defaultQuizState } from './types';
import { calculateResults } from './lib/calculations';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import { BrandLogo } from './components/BrandLogo';
import { BrandWatermark } from './components/BrandWatermark';
import { StepIndicator } from './components/StepIndicator';

const TOTAL_STEPS = 5;
const LAST_APP_STEP = 8;
const QUIZ_STORAGE_KEY = 'vloergroep-groeiscan-state/v1';
const QUIZ_PROGRESS_STORAGE_KEY = 'vloergroep-groeiscan-progress/v1';
const STORAGE_WRITE_DELAY_MS = 180;

const loadScreen1Hero = () => import('./screens/Screen1Hero');
const loadScreen2WhoAreYou = () => import('./screens/Screen2WhoAreYou');
const loadScreen3Base = () => import('./screens/Screen3Base');
const loadScreen4TimeLeak = () => import('./screens/Screen4TimeLeak');
const loadScreen5Cashflow = () => import('./screens/Screen5Cashflow');
const loadScreen7Collab = () => import('./screens/Screen7Collab');
const loadScreen8Loading = () => import('./screens/Screen8Loading');
const loadScreen9Results = () => import('./screens/Screen9Results');
const loadScreen10Capture = () => import('./screens/Screen10Capture');

const Screen1Hero = lazy(loadScreen1Hero);
const Screen2WhoAreYou = lazy(loadScreen2WhoAreYou);
const Screen3Base = lazy(loadScreen3Base);
const Screen4TimeLeak = lazy(loadScreen4TimeLeak);
const Screen5Cashflow = lazy(loadScreen5Cashflow);
const Screen7Collab = lazy(loadScreen7Collab);
const Screen8Loading = lazy(loadScreen8Loading);
const Screen9Results = lazy(loadScreen9Results);
const Screen10Capture = lazy(loadScreen10Capture);

const SCREEN_PRELOADERS = [
  loadScreen1Hero,
  loadScreen2WhoAreYou,
  loadScreen3Base,
  loadScreen4TimeLeak,
  loadScreen5Cashflow,
  loadScreen7Collab,
  loadScreen8Loading,
  loadScreen9Results,
  loadScreen10Capture,
];

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

function sanitizeStoredStep(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const normalizedStep = Math.max(0, Math.min(LAST_APP_STEP, Math.trunc(value)));
  return normalizedStep === 6 ? 7 : normalizedStep;
}

function loadStoredStep() {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    const storedStep = window.localStorage.getItem(QUIZ_PROGRESS_STORAGE_KEY);
    if (!storedStep) {
      return 0;
    }

    return sanitizeStoredStep(Number.parseInt(storedStep, 10));
  } catch {
    return 0;
  }
}

function ScreenFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[320px] w-full items-center justify-center"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-amber-gold/20 border-t-amber-gold shadow-[0_0_32px_rgba(224,172,62,0.18)] motion-reduce:animate-none" />
      <span className="sr-only">Scherm laden...</span>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(() => loadStoredStep());
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
    const persistTimer = window.setTimeout(() => {
      window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
    }, STORAGE_WRITE_DELAY_MS);

    return () => window.clearTimeout(persistTimer);
  }, [state]);

  useEffect(() => {
    const persistTimer = window.setTimeout(() => {
      window.localStorage.setItem(
        QUIZ_PROGRESS_STORAGE_KEY,
        String(sanitizeStoredStep(step)),
      );
    }, 80);

    return () => window.clearTimeout(persistTimer);
  }, [step]);

  useEffect(() => {
    const nextScreenLoader = SCREEN_PRELOADERS[step + 1];
    if (!nextScreenLoader) {
      return;
    }

    const preloadTimer = window.setTimeout(() => {
      void nextScreenLoader();
    }, 180);

    return () => window.clearTimeout(preloadTimer);
  }, [step]);

  const handleNext = useCallback(() => {
    setStep((currentStep) => Math.min(LAST_APP_STEP, currentStep + 1));
  }, []);

  const handleBack = useCallback(() => {
    setStep((currentStep) => Math.max(0, currentStep - 1));
  }, []);

  const updateState = useCallback((updates: Partial<QuizState>) => {
    setState((currentState) => ({ ...currentState, ...updates }));
  }, []);

  const currentResults = useMemo(() => calculateResults(state), [state]);

  const screenTransition = useMemo(
    () =>
      shouldUseSimpleMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.18, ease: 'easeOut' as const },
          }
        : {
            initial: { opacity: 0, y: 12, scale: 0.996 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -6, scale: 0.996 },
            transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
          },
    [shouldUseSimpleMotion],
  );

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
        <Suspense fallback={<ScreenFallback />}>
          <AnimatePresence mode="wait" initial={false}>
            
            {step === 0 && (
              <motion.div key="step-0" {...screenTransition} className="w-full">
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
        </Suspense>
      </main>

    </div>
  );
}
