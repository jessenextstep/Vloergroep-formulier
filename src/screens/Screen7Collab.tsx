import React from 'react';
import { QuizState, MissedProjects } from '../types';
import { BottomNav } from '../components/BottomNav';
import { ProofCallout } from '../components/ProofCallout';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { heroScreen6 } from '../lib/brandAssets';

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

  return (
    <div className="flex-1 flex flex-col pt-4 md:py-8 max-w-2xl mx-auto w-full">
      <ScreenHeroImage
        src={heroScreen6}
        alt="Samenwerken aan grotere vloerprojecten"
        className="mb-6"
      />

      <div className="mb-10 text-center md:text-left">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold mb-4">Groeikans</span>
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-3 tracking-tight text-white">Hoeveel grote klussen moet je weleens afwijzen?</h2>
        <p className="text-base text-[#FBEFD5]/80">
          Met VloerGroep kun je gericht samenwerken met andere vakmannen, zodat je mega projecten die je nu laat schieten wél kunt aannemen.
        </p>
      </div>

      <div className="space-y-12 mb-12">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {missedOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`py-4 px-4 rounded-[20px] font-medium border transition-all ${
                  state.missedProjects === opt.value 
                    ? 'bg-amber-gold/10 border-amber-gold text-amber-gold shadow-[0_0_15px_rgba(224,172,62,0.15)] ring-1 ring-amber-gold/50'
                    : 'bg-white/5 border-white/10 text-[#FBEFD5]/70 hover:bg-white/10'
                }`}
                onClick={() => updateState({ missedProjects: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ProofCallout
        title="Wist je dat VloerGroep grotere klussen veiliger laat samenwerken?"
        body="Samenwerken voelt vaak als risico. Het VloerGroep netwerk en projectdepot zorgen ervoor dat geld veilig wordt verdeeld op een zakelijke manier zonder privé zorgen."
      />

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} nextLabel="Bereken mijn scan" />
      </div>
    </div>
  );
}
