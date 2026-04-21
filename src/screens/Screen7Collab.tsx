import React from 'react';
import { QuizState, MissedProjects, WillCollaborate } from '../types';
import { BottomNav } from '../components/BottomNav';
import { SegmentedControl } from '../components/SegmentedControl';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen7Collab({ state, updateState, onNext, onBack }: Props) {
  
  const missedOptions: { label: string; value: MissedProjects }[] = [
    { label: 'Geen', value: 0 },
    { label: '1 per jaar', value: 1 },
    { label: '2 per jaar', value: 2 },
    { label: '3+ per jaar', value: 3 },
  ];

  const willOptions: { label: string; value: WillCollaborate }[] = [
    { label: 'Misschien', value: 'maybe' },
    { label: 'Zeker weten', value: 'certainly' },
  ];

  return (
    <div className="flex-1 flex flex-col pt-4 md:py-8 max-w-2xl mx-auto w-full">
      
      {/* Mobile-only header image */}
      <img 
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800&h=300" 
        alt="Samenwerking" 
        referrerPolicy="no-referrer"
        className="w-full h-32 object-cover rounded-2xl mb-6 border border-white/5 shadow-lg block md:hidden bg-near-black"
      />

      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Groei via samenwerking</h2>
        <p className="text-base text-[#FBEFD5]/60">
          Grote, mooie projecten moet je soms afwijzen omdat je handjes of capaciteit mist. Met VloerGroep kun je gericht samenwerken met andere vakmannen, zodat je die klussen wél kunt aannemen.
        </p>
      </div>

      <div className="space-y-12 mb-12">
        
        <div className="space-y-5">
          <label className="block text-xl font-semibold text-white">Hoeveel grotere klussen zeg je nu jaarlijks af uit tijd- of capaciteitsgebrek?</label>
          <div className="grid grid-cols-2 gap-3">
            {missedOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`py-4 px-4 rounded-2xl font-medium border transition-all ${
                  state.missedProjects === opt.value 
                    ? 'bg-amber-gold/10 border-amber-gold text-amber-gold'
                    : 'bg-white/5 border-white/10 text-[#FBEFD5]/70 hover:bg-white/10'
                }`}
                onClick={() => updateState({ missedProjects: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {state.missedProjects > 0 && (
          <>
            <div className="w-full h-px bg-white/10" />
            <div className="space-y-5">
              <label className="block text-xl font-semibold text-white">Zou je die wél aannemen als je kon samenwerken via het netwerk?</label>
              <SegmentedControl
                options={willOptions}
                value={state.willCollaborate === 'yes' ? 'certainly' : state.willCollaborate} // quick map mapping
                onChange={(v) => updateState({ willCollaborate: v })}
                size="lg"
              />
            </div>
          </>
        )}

      </div>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} nextLabel={state.missedProjects === 0 ? "Volgende" : "Bereken mijn scan"} />
      </div>
      <p className="text-center text-sm text-white/30 mt-6">
        Je antwoorden worden alleen gebruikt om je scan te berekenen.
      </p>
    </div>
  );
}
