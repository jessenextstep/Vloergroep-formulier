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
      className="min-h-[320px] w-full opacity-0"
    >
      <span className="sr-only">Scherm laden...</span>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(() => loadStoredStep());
  const [state, setState] = useState<QuizState>(() => loadStoredQuizState());
  const [sessionStartedAt] = useState(() => Date.now());
  const prefersReducedMotion = useReducedMotion();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<1 | -1>(1);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncMotionPreference = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    syncMotionPreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncMotionPreference);
      return () => mediaQuery.removeEventListener('change', syncMotionPreference);
    }

    mediaQuery.addListener(syncMotionPreference);
    return () => mediaQuery.removeListener(syncMotionPreference);
  }, []);

  const shouldUseSimpleMotion = prefersReducedMotion;

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion || isMobileViewport ? 'auto' : 'smooth' });
  }, [isMobileViewport, prefersReducedMotion, step]);

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

  useEffect(() => {
    const preloadAllScreens = () => {
      SCREEN_PRELOADERS.forEach((loader) => {
        void loader();
      });
    };

    const preloadTimer = window.setTimeout(preloadAllScreens, 260);
    return () => window.clearTimeout(preloadTimer);
  }, []);

  const handleNext = useCallback(() => {
    setTransitionDirection(1);
    setStep((currentStep) => Math.min(LAST_APP_STEP, currentStep + 1));
  }, []);

  const handleBack = useCallback(() => {
    setTransitionDirection(-1);
    setStep((currentStep) => Math.max(0, currentStep - 1));
  }, []);

  const updateState = useCallback((updates: Partial<QuizState>) => {
    setState((currentState) => ({ ...currentState, ...updates }));
  }, []);

  const currentResults = useMemo(() => calculateResults(state), [state]);
  const showProgressHeader = step > 0 && step <= TOTAL_STEPS;
  const showIntroMobileHeader = step === 0;
  const hasCompactStickyFooter = step === 0;
  const hasStandardStickyFooter = (step > 0 && step <= TOTAL_STEPS) || step === 7;
  const mainBottomPaddingClass = hasCompactStickyFooter
    ? 'pb-[108px] md:pb-28'
    : hasStandardStickyFooter
      ? 'pb-[140px] md:pb-28'
      : 'pb-10 md:pb-28';

  const screenVariants = useMemo(
    () =>
      shouldUseSimpleMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          }
        : isMobileViewport
          ? {
              initial: (direction: 1 | -1) => ({
                opacity: 0,
                clipPath: direction > 0 ? 'inset(0 0 0 10%)' : 'inset(0 10% 0 0)',
              }),
              animate: {
                opacity: 1,
                clipPath: 'inset(0 0 0 0)',
              },
              exit: (direction: 1 | -1) => ({
                opacity: 0,
                clipPath: direction > 0 ? 'inset(0 10% 0 0)' : 'inset(0 0 0 10%)',
              }),
            }
          : {
              initial: { opacity: 0, clipPath: 'inset(2% 0 0 0)' },
              animate: { opacity: 1, clipPath: 'inset(0 0 0 0)' },
              exit: { opacity: 0, clipPath: 'inset(0 0 2% 0)' },
            },
    [isMobileViewport, shouldUseSimpleMotion],
  );

  const screenTransition = useMemo(
    () => ({
      duration: shouldUseSimpleMotion ? 0.18 : isMobileViewport ? 0.32 : 0.24,
      ease: [0.22, 1, 0.36, 1] as const,
    }),
    [isMobileViewport, shouldUseSimpleMotion],
  );

  const screenMotionProps = useMemo(
    () => ({
      variants: screenVariants,
      initial: 'initial' as const,
      animate: 'animate' as const,
      exit: 'exit' as const,
      transition: screenTransition,
      custom: transitionDirection,
    }),
    [screenTransition, screenVariants, transitionDirection],
  );

  return (
    <div className="min-h-screen w-full bg-[#061010] text-[#FBEFD5] flex flex-col font-sans selection:bg-amber-gold/30 relative isolate overflow-x-clip">
      <BrandWatermark />
      
      {/* Header / Progress */}
      {showProgressHeader && (
        <header className="z-50 flex items-center justify-between px-6 pb-3 pt-6 sm:px-8 sm:pb-4 sm:pt-8">
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

      {showIntroMobileHeader && (
        <header className="z-50 flex items-center px-6 pb-3 pt-6 md:hidden">
          <BrandLogo className="h-8 sm:h-9" />
        </header>
      )}

      {/* Main Content Area */}
      <main className={`relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pt-2 md:pt-8 ${mainBottomPaddingClass}`}>
        <Suspense fallback={<ScreenFallback />}>
          <AnimatePresence mode="wait" initial={false}>
            
            {step === 0 && (
              <motion.div key="step-0" {...screenMotionProps} className="w-full">
                <Screen1Hero onNext={handleNext} />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step-1" {...screenMotionProps} className="flex h-full w-full flex-col">
                <Screen2WhoAreYou state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" {...screenMotionProps} className="flex h-full w-full flex-col">
                <Screen3Base state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" {...screenMotionProps} className="flex h-full w-full flex-col">
                <Screen4TimeLeak state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step-4" {...screenMotionProps} className="flex h-full w-full flex-col">
                <Screen5Cashflow state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step-5" {...screenMotionProps} className="flex h-full w-full flex-col">
                <Screen7Collab state={state} updateState={updateState} onNext={handleNext} onBack={handleBack} />
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step-6" {...screenMotionProps} className="flex h-full w-full flex-col">
                <Screen8Loading onNext={handleNext} />
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="step-7" {...screenMotionProps} className="mx-auto w-full max-w-4xl">
                <Screen9Results
                  state={state}
                  results={currentResults}
                  onNext={handleNext}
                  onBack={() => {
                    setTransitionDirection(-1);
                    setStep(5);
                  }}
                />
              </motion.div>
            )}

            {step === 8 && (
              <motion.div key="step-8" {...screenMotionProps} className="flex h-full w-full flex-col">
                <Screen10Capture state={state} results={currentResults} sessionStartedAt={sessionStartedAt} />
              </motion.div>
            )}

          </AnimatePresence>
        </Suspense>
      </main>

    </div>
  );
}
