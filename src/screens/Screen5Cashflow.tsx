import React from 'react';
import { QuizState, PaymentDays } from '../types';
import { BottomNav } from '../components/BottomNav';
import { ProofCallout } from '../components/ProofCallout';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { Slider } from '../components/Slider';
import { AnimatedResultValue, StepResultCard } from '../components/StepResultCard';
import { heroScreen5 } from '../lib/brandAssets';
import { Percent } from 'lucide-react';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen5Cashflow({ state, updateState, onNext, onBack }: Props) {
  
  const paymentOptions: { label: string; value: PaymentDays }[] = [
    { label: 'Binnen 14 dagen', value: 14 },
    { label: 'Binnen 30 dagen', value: 30 },
    { label: 'Binnen 45 dagen', value: 45 },
    { label: 'Meer dan 60 dgn', value: 60 },
  ];

  const pctMarks = [
    { value: 25, label: '25%' },
    { value: 40, label: '40%' },
    { value: 55, label: '55%' },
    { value: 70, label: '70%' },
    { value: 85, label: '85%' },
    { value: 100, label: '100%' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pt-1 md:pb-8 md:pt-5">
      <ScreenHeroImage
        src={heroScreen5}
        alt="Cashflow en sneller betaald krijgen"
        className="mb-6"
      />

      <div className="mb-10 text-center md:text-left">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold mb-4">Cashflow</span>
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-3 tracking-tight text-white">Hoe snel krijg je nu meestal betaald?</h2>
        <p className="text-base text-[#FBEFD5]/80">
          VloerGroep werkt met een veilig projectdepot. Kies hier hoelang je vandaag de dag vaak nog op je geld moet wachten.
        </p>
      </div>

      <div className="space-y-10 mb-8">
        
        <fieldset className="space-y-4">
          <legend id="payment-days-label" className="block text-lg font-semibold text-white/90">Hoe snel word jij nu gemiddeld betaald?</legend>
          <div role="radiogroup" aria-labelledby="payment-days-label" className="grid grid-cols-2 gap-3">
            {paymentOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={state.paymentDays === opt.value}
                className={`py-3.5 px-3 rounded-xl text-[14px] leading-snug font-display font-bold tracking-[-0.02em] border transition-all ${
                  state.paymentDays === opt.value 
                    ? 'bg-amber-gold/10 border-amber-gold text-amber-gold shadow-[0_0_15px_rgba(224,172,62,0.15)] ring-1 ring-amber-gold/50'
                    : 'bg-white/5 border-white/10 text-[#FBEFD5]/76 hover:bg-white/10'
                }`}
                onClick={() => updateState({ paymentDays: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="space-y-4">
          <label className="block text-lg font-semibold text-white/90">Hoeveel van je omzet zou je via VloerGroep willen laten lopen?</label>

          <Slider
            label="Aandeel via VloerGroep"
            icon={<Percent size={20} />}
            value={state.percentageVloergroep}
            onChange={(v) => updateState({ percentageVloergroep: v })}
            min={25}
            max={100}
            step={5}
            marks={pctMarks}
            formatValue={v => `${v}%`}
          />

          <ProofCallout
            title="Wist je dat VloerGroep betalingen sneller beschikbaar maakt via het projectdepot?"
            body="Hoe meer omzet je via VloerGroep laat lopen, hoe meer geld sneller vrijkomt en minder lang vastzit in openstaande posten."
          />
        </div>

      </div>

      <StepResultCard>
        <p className="text-sm font-medium leading-7 text-white md:text-base">
          We rekenen nu met <AnimatedResultValue value={`${state.paymentDays} dagen`} /> betaaltermijn en <AnimatedResultValue value={`${state.percentageVloergroep}%`} /> van je omzet via VloerGroep.
        </p>
      </StepResultCard>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} />
      </div>
    </div>
  );
}
