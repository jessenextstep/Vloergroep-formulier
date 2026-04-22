import React from 'react';
import { QuizState } from '../types';
import { BottomNav } from '../components/BottomNav';
import { ProofCallout } from '../components/ProofCallout';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { Slider } from '../components/Slider';
import { AnimatedResultValue, StepResultCard } from '../components/StepResultCard';
import { heroScreen4 } from '../lib/brandAssets';
import { formatNumber } from '../lib/utils';
import { FileText, CalendarClock, MessageSquare, DollarSign } from 'lucide-react';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen4TimeLeak({ state, updateState, onNext, onBack }: Props) {
  
  const totalHours = state.timeAdmin + state.timePlanning + state.timeComm + state.timePayment;
  const formattedTotalHours = `${formatNumber(totalHours, totalHours % 1 === 0 ? 0 : 1)} uur per week`;
  
  const formatHrs = (val: number) => val === 0 ? '0 u' : val >= 2 ? '2+ u' : `${val} u`;

  const timeMarks = [
    { value: 0, label: '0 u' },
    { value: 0.5, label: '0,5 u' },
    { value: 1.0, label: '1 u' },
    { value: 1.5, label: '1,5 u' },
    { value: 2, label: '2+ u' }
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pt-1 md:pb-8 md:pt-5">
      <ScreenHeroImage
        src={heroScreen4}
        alt="Tijdlekken in het werkproces"
        className="mb-6"
      />

      <div className="mb-8 text-center md:text-left">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold mb-4">Tijdlekken</span>
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-3 tracking-tight text-white">
          {state.firstName 
            ? `Hoeveel tijd gaat er per week op aan regelwerk, ${state.firstName}?` 
            : `Hoeveel tijd gaat er per week op aan regelwerk?`}
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
        title="Wist je dat VloerGroep vaak tijd terugwint op planning, communicatie en betalingen?"
        body="Veel vakmannen verliezen hier elke week ongemerkt tijd. VloerGroep brengt afspraken, communicatie en betalingen samen op één plek."
      />

      <StepResultCard>
        <p className="text-sm font-medium leading-7 text-white md:text-base">
          Je geeft nu ongeveer <AnimatedResultValue value={formattedTotalHours} /> uit aan regelen.
        </p>
      </StepResultCard>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} />
      </div>
    </div>
  );
}
