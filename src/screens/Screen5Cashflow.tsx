import React from 'react';
import { QuizState, PaymentDays } from '../types';
import { BottomNav } from '../components/BottomNav';
import { Slider } from '../components/Slider';
import { Wallet, Percent, ShieldCheck } from 'lucide-react';

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
      
      {/* Mobile-only header image */}
      <img 
        src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=800&h=300" 
        alt="Direct Betaald" 
        referrerPolicy="no-referrer"
        className="w-full h-32 object-cover rounded-2xl mb-6 border border-white/5 shadow-lg block md:hidden bg-near-black"
      />

      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Direct betaald voor je werk</h2>
        <p className="text-base text-[#FBEFD5]/60">
          Bij VloerGroep staat het geld vooraf veilig in een depot. Dit voorkomt lang wachten op uitbetaling.
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
                    ? 'bg-amber-gold/10 border-amber-gold text-amber-gold shadow-[0_0_15px_rgba(224,172,62,0.15)]'
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
          
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-charcoal/30 border border-white/5 text-xs text-[#FBEFD5]/50 leading-relaxed mb-4">
             <ShieldCheck size={18} className="shrink-0 mt-0.5 text-amber-gold/80" />
             <p>Dit deel van je omzet groeit direct mee in snelheid. Je geld is vliegensvlug beschikbaar doordat wij het debiteurenrisico wegnemen.</p>
          </div>

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
    </div>
  );
}
