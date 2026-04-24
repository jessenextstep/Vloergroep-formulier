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
  
  const formatHrs = (val: number) => val >= 20 ? '20+ u' : `${val} u`;

  const timeMarks = [
    { value: 0, label: '0 u' },
    { value: 5, label: '5 u' },
    { value: 10, label: '10 u' },
    { value: 15, label: '15 u' },
    { value: 20, label: '20+ u' }
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
          Schat per onderdeel hoeveel uur dit in jullie hele bedrijf per week kost. Dus niet per medewerker, maar het totaal van de organisatie.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        
        <Slider
          label="Offertes & administratie"
          description="Denk aan offertes maken, nacalculatie, facturen en losse administratie in het hele bedrijf."
          icon={<FileText size={20} />}
          value={state.timeAdmin}
          onChange={(v) => updateState({ timeAdmin: v })}
          min={0}
          max={20}
          step={1}
          marks={timeMarks}
          formatValue={formatHrs}
        />

        <Slider
          label="Planning & afstemming"
          description="Denk aan planning maken, schuiven in agenda's, mensen inroosteren en werk afstemmen."
          icon={<CalendarClock size={20} />}
          value={state.timePlanning}
          onChange={(v) => updateState({ timePlanning: v })}
          min={0}
          max={20}
          step={1}
          marks={timeMarks}
          formatValue={formatHrs}
        />

        <Slider
          label="Appjes & terugzoeken"
          description="Denk aan bellen, WhatsApp, terugzoeken van afspraken, foto's en losse communicatie."
          icon={<MessageSquare size={20} />}
          value={state.timeComm}
          onChange={(v) => updateState({ timeComm: v })}
          min={0}
          max={20}
          step={1}
          marks={timeMarks}
          formatValue={formatHrs}
        />

        <Slider
          label="Betalingen najagen"
          description="Denk aan herinneringen sturen, nabellen, controleren wat al wel of niet betaald is."
          icon={<DollarSign size={20} />}
          value={state.timePayment}
          onChange={(v) => updateState({ timePayment: v })}
          min={0}
          max={20}
          step={1}
          marks={timeMarks}
          formatValue={formatHrs}
        />

      </div>

      <ProofCallout
        title="VloerGroep haalt juist hier vaak de eerste tijdswinst vandaan."
        body="Omdat planning, communicatie en betalingen op één plek samenkomen, lekt er minder tijd weg aan zoeken, schakelen en nabellen."
      />

      <StepResultCard>
        <p className="text-sm font-medium leading-7 text-white md:text-base">
          Je geeft nu ongeveer <AnimatedResultValue value={formattedTotalHours} /> per week uit aan regelwerk in de hele organisatie.
        </p>
      </StepResultCard>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} />
      </div>
    </div>
  );
}
