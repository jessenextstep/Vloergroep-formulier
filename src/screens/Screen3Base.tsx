import React from 'react';
import { QuizState } from '../types';
import { BottomNav } from '../components/BottomNav';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { Slider } from '../components/Slider';
import { AnimatedResultValue, StepResultCard } from '../components/StepResultCard';
import { heroScreen3 } from '../lib/brandAssets';
import { formatCurrency } from '../lib/utils';
import { getFteEstimate } from '../lib/calculations';
import { Wallet, Clock, CalendarDays } from 'lucide-react';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen3Base({ state, updateState, onNext, onBack }: Props) {
  const teamFactor = getFteEstimate(state.teamCount);
  const yearlyHours = state.hoursPerWeek * state.weeksPerYear * teamFactor;
  const yearlyRevenue = yearlyHours * state.hourlyRate;
  const hourlyRateMarks = [
    { value: 30, label: '€30' },
    { value: 60, label: '€60' },
    { value: 90, label: '€90' },
    { value: 120, label: '€120' },
    { value: 150, label: '€150' },
  ];
  const yearlyWeeksMarks = [
    { value: 25, label: '25' },
    { value: 30, label: '30' },
    { value: 35, label: '35' },
    { value: 40, label: '40' },
    { value: 45, label: '45' },
    { value: 52, label: '52' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pt-1 md:pb-8 md:pt-5">
      <ScreenHeroImage
        src={heroScreen3}
        alt="Uurtarief en werkweek overzicht"
        className="mb-6"
      />

      <div className="mb-8 text-center md:text-left">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold mb-4">Basis</span>
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-3 tracking-tight text-white">
          {state.firstName
            ? `Wat rekenen jullie gemiddeld per uur en hoeveel weken per jaar werken jullie, ${state.firstName}?`
            : 'Wat rekenen jullie gemiddeld per uur en hoeveel weken per jaar werken jullie?'}
        </h2>
        <p className="text-base text-[#FBEFD5]/80 pr-2">
          We rekenen hier met gemiddelden per werkende vakman op de vloer. Alle bedragen in de scan zijn indicatief en ex. btw.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <Slider
          label="Gemiddeld uurtarief ex. btw"
          description="Gebruik het uurtarief dat je gemiddeld aan klanten doorbelast voor uitvoerend werk."
          icon={<Wallet size={20} />}
          value={state.hourlyRate}
          onChange={(v) => updateState({ hourlyRate: v })}
          min={30}
          max={150}
          step={1}
          tickEvery={10}
          marks={hourlyRateMarks}
          formatValue={v => `€ ${v}`}
        />
        
        <Slider
          label="Gemiddeld factureerbare uren per week p.p."
          description="Het gemiddelde aantal uren dat 1 vakman per week echt aan klanten kan doorbelasten. Tel alleen uitvoerende uren mee."
          infoTooltip={{
            title: 'Voorbeeld',
            body: 'Bij Vloerbedrijf De Boer werkt een vakman 40 uur. Hij is 30 uur echt op de klus bezig. De rest gaat naar rijden, klantcontact en voorbereiding. Dan vul je 30 uur p.p. in.',
          }}
          icon={<Clock size={20} />}
          value={state.hoursPerWeek}
          onChange={(v) => updateState({ hoursPerWeek: v })}
          min={10}
          max={45}
          step={1}
          tickEvery={5}
          marks={[
            { value: 10, label: '10' },
            { value: 18, label: '18' },
            { value: 25, label: '25' },
            { value: 32, label: '32' },
            { value: 40, label: '40' },
            { value: 45, label: '45' },
          ]}
          formatValue={v => `${v} u`}
        />

        <Slider
          label="Werkweken per jaar"
          description="Hoeveel weken werkt een vakman bij jullie gemiddeld echt in een jaar? Trek dus vakanties, feestdagen, ziekte en rustige weken er al vanaf."
          icon={<CalendarDays size={20} />}
          value={state.weeksPerYear}
          onChange={(v) => updateState({ weeksPerYear: v })}
          min={25}
          max={52}
          step={1}
          marks={yearlyWeeksMarks}
          formatValue={v => `${v} w`}
        />
      </div>

      <StepResultCard>
        <p className="text-[15px] font-medium leading-7 text-white md:text-base">
          Dat komt neer op ongeveer{' '}
          <AnimatedResultValue value={`${yearlyHours} uur`} />{' '}
          per jaar en{' '}
          <AnimatedResultValue value={formatCurrency(yearlyRevenue)} />{' '}
          omzet ex. btw
          {teamFactor > 1 ? ` voor ${teamFactor} mensen in uitvoering` : ''}.
        </p>
      </StepResultCard>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} />
      </div>
    </div>
  );
}
