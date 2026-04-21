import React from 'react';
import { QuizState, LeadScenario } from '../types';
import { BottomNav } from '../components/BottomNav';
import { Card } from '../components/Card';
import { Check } from 'lucide-react';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen6Leads({ state, updateState, onNext, onBack }: Props) {
  
  const scenarioOptions: { label: string; value: LeadScenario; desc: string }[] = [
    { label: 'Voorzichtig', value: 'conservative', desc: '+5% conversie op de juiste leads' },
    { label: 'Realistisch', value: 'realistic', desc: '+10% conversie op de juiste leads' },
    { label: 'Ambitieus', value: 'ambitious', desc: '+12,5% conversie op de juiste leads' },
  ];

  const handleSelect = (val: LeadScenario) => {
    updateState({ leadScenario: val });
    // Friendly auto-advance after small delay so they see the feedback
    setTimeout(() => {
      onNext();
    }, 350);
  };

  return (
    <div className="flex-1 flex flex-col pt-4 md:py-8 max-w-2xl mx-auto w-full">
      
      {/* Mobile-only header image */}
      <img 
        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=300" 
        alt="Betere Leads" 
        referrerPolicy="no-referrer"
        className="w-full h-32 object-cover rounded-2xl mb-6 border border-white/5 shadow-lg block md:hidden bg-near-black"
      />

      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Groei via betere leads</h2>
        <p className="text-base text-[#FBEFD5]/60 pr-2 mb-4">
          Via het netwerk kom je aan goedgekwalificeerde aanvragen, zonder race naar de bodem. 
        </p>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-charcoal/30 border border-white/5 text-xs text-[#FBEFD5]/50 leading-relaxed mb-6">
          <p>We rekenen in de scan met <strong>gemiddeld 6 extra leads per maand</strong> die beter bij je passen.</p>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <label className="block text-lg font-semibold text-white/90 mb-4">
          Hoe ambitieus schat jij de conversie-winst uit deze betere leads in?
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarioOptions.map(opt => (
            <Card
              key={opt.value}
              interactive
              selected={state.leadScenario === opt.value}
              onClick={() => handleSelect(opt.value)}
              className="flex flex-col p-5 gap-3 relative overflow-hidden text-center md:text-left"
            >
              {state.leadScenario === opt.value && (
                <div className="absolute top-4 right-4 text-amber-gold">
                  <Check size={18} strokeWidth={3} />
                </div>
              )}
              <span className="font-semibold text-lg pr-6">{opt.label}</span>
              <span className="text-sm text-[#FBEFD5]/50 leading-relaxed">{opt.desc}</span>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} />
      </div>
      <p className="text-center text-sm text-[#FBEFD5]/30 mt-6">
        Je antwoorden worden alleen gebruikt om je scan te berekenen.
      </p>
    </div>
  );
}
