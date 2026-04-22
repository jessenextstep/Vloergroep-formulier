import React from 'react';
import { QuizState, PaymentDays } from '../types';
import { BottomNav } from '../components/BottomNav';
import { ProofCallout } from '../components/ProofCallout';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { Slider } from '../components/Slider';
import { heroScreen5 } from '../lib/brandAssets';
import { Wallet, Percent } from 'lucide-react';

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
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' },
  ];

  return (
    <div className="flex-1 flex flex-col pt-4 md:py-8 max-w-2xl mx-auto w-full">
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
        
        <div className="space-y-4">
          <label className="block text-lg font-semibold text-white/90">Hoe snel word jij nu gemiddeld betaald?</label>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`py-3.5 px-3 rounded-xl text-[14px] leading-snug font-medium border transition-all ${
                  state.paymentDays === opt.value 
                    ? 'bg-amber-gold/10 border-amber-gold text-amber-gold shadow-[0_0_15px_rgba(224,172,62,0.15)] ring-1 ring-amber-gold/50'
                    : 'bg-white/5 border-white/10 text-[#FBEFD5]/60 hover:bg-white/10'
                }`}
                onClick={() => updateState({ paymentDays: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="space-y-4">
          <label className="block text-lg font-semibold text-white/90">Hoeveel van je omzet zou je via VloerGroep willen laten lopen?</label>
          
          <ProofCallout body="Dit deel van je omzet groeit direct mee in snelheid. Je geld is vliegensvlug beschikbaar doordat wij het debiteurenrisico wegnemen." />

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
        </div>

      </div>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} />
      </div>
      <p className="text-center text-sm text-white/50 mt-6">
        Dit gebruiken we om je cashflowvoordeel realistisch in te schatten.
      </p>
    </div>
  );
}
