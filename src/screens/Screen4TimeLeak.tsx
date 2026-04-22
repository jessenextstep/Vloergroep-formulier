import React from 'react';
import { QuizState } from '../types';
import { BottomNav } from '../components/BottomNav';
import { ProofCallout } from '../components/ProofCallout';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { Slider } from '../components/Slider';
import { heroScreen4 } from '../lib/brandAssets';
import { motion } from 'framer-motion';
import { FileText, CalendarClock, MessageSquare, DollarSign } from 'lucide-react';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen4TimeLeak({ state, updateState, onNext, onBack }: Props) {
  
  const totalHours = state.timeAdmin + state.timePlanning + state.timeComm + state.timePayment;
  
  const formatHrs = (val: number) => val === 0 ? '0 u' : val >= 2 ? '2+ u' : `${val} u`;

  const timeMarks = [
    { value: 0, label: '0 u' },
    { value: 0.5, label: '0,5 u' },
    { value: 1.0, label: '1 u' },
    { value: 1.5, label: '1,5 u' },
    { value: 2, label: '2+ u' }
  ];

  return (
    <div className="flex-1 flex flex-col pt-4 md:py-8 max-w-2xl mx-auto w-full">
      <ScreenHeroImage
        src={heroScreen4}
        alt="Tijdlekken in het werkproces"
        className="mb-6"
      />

      <div className="mb-8 text-center md:text-left">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold mb-4">Tijdlekken</span>
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-3 tracking-tight text-white">
          {state.firstName 
            ? `Hoeveel uren vliegen eruit aan dit regelwerk, ${state.firstName}?` 
            : `Hoeveel uren vliegen eruit aan dit regelwerk?`}
        </h2>
        <p className="text-base text-[#FBEFD5]/80 pr-2">
          Selecteer hoeveel uur per week jij (of je team) hieraan kwijt is.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        
        <Slider
          label="Offertes & administratie"
          icon={<FileText size={20} />}
          value={state.timeAdmin}
          onChange={(v) => updateState({ timeAdmin: v })}
          min={0}
          max={2}
          step={0.5}
          marks={timeMarks}
          formatValue={formatHrs}
        />

        <Slider
          label="Planning & afstemming"
          icon={<CalendarClock size={20} />}
          value={state.timePlanning}
          onChange={(v) => updateState({ timePlanning: v })}
          min={0}
          max={2}
          step={0.5}
          marks={timeMarks}
          formatValue={formatHrs}
        />

        <Slider
          label="Appjes & terugzoeken"
          icon={<MessageSquare size={20} />}
          value={state.timeComm}
          onChange={(v) => updateState({ timeComm: v })}
          min={0}
          max={2}
          step={0.5}
          marks={timeMarks}
          formatValue={formatHrs}
        />

        <Slider
          label="Betalingen najagen"
          icon={<DollarSign size={20} />}
          value={state.timePayment}
          onChange={(v) => updateState({ timePayment: v })}
          min={0}
          max={2}
          step={0.5}
          marks={timeMarks}
          formatValue={formatHrs}
        />

      </div>

      <ProofCallout
        title="Wist je dat VloerGroep juist hier vaak als eerste tijd terugwint?"
        body="Veel vakmannen verliezen hier elke week ongemerkt veel tijd. VloerGroep brengt afspraken, communicatie en betalingen samen op één plek. Daar begint je eerste winst."
      />

      <motion.div 
        key={totalHours}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-12 bg-charcoal/30 rounded-2xl p-5 text-center flex items-center justify-center gap-4 border border-white/5"
      >
        <p className="text-white/90 text-sm md:text-base font-medium">
          Je geeft nu ongeveer <span className="text-amber-gold">{totalHours} uur per week</span> uit aan regelen.
        </p>
      </motion.div>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} />
      </div>
    </div>
  );
}
