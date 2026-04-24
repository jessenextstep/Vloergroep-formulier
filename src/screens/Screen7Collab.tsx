import React from 'react';
import { QuizState } from '../types';
import { BottomNav } from '../components/BottomNav';
import { ProofCallout } from '../components/ProofCallout';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { Slider } from '../components/Slider';
import { AnimatedResultValue, StepResultCard } from '../components/StepResultCard';
import { heroScreen6 } from '../lib/brandAssets';
import { BriefcaseBusiness } from 'lucide-react';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen7Collab({ state, updateState, onNext, onBack }: Props) {
  const missedProjectsLabel =
    state.missedProjects === 0
      ? 'geen grote klussen'
      : state.missedProjects === 20
        ? '20+ grote klussen'
        : `${state.missedProjects} grote ${state.missedProjects === 1 ? 'klus' : 'klussen'}`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pt-1 md:pb-8 md:pt-5">
      <ScreenHeroImage
        src={heroScreen6}
        alt="Samenwerken aan grotere vloerprojecten"
        className="mb-6"
      />

      <div className="mb-10 text-center md:text-left">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold mb-4">Groeikans</span>
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-3 tracking-tight text-white">Hoeveel grote klussen moet je weleens afwijzen?</h2>
        <p className="text-base text-[#FBEFD5]/80">
          Denk aan klussen die nu te groot zijn voor je eigen planning of bezetting. Met VloerGroep kun je daarvoor gericht samenwerken met andere vakmannen, zodat je vaker ja kunt zeggen tegen werk dat je nu moet laten lopen.
        </p>
      </div>

      <div className="space-y-12 mb-12">
        <Slider
          label="Gemiste grote klussen per jaar"
          description="Een ruwe inschatting is genoeg. Denk aan grote opdrachten die je nu afwijst of doorschuift omdat planning, capaciteit of samenwerking ontbreekt."
          icon={<BriefcaseBusiness size={20} />}
          value={state.missedProjects}
          onChange={(v) => updateState({ missedProjects: v })}
          min={0}
          max={20}
          step={1}
          tickEvery={5}
          marks={[
            { value: 0, label: '0' },
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: 15, label: '15' },
            { value: 20, label: '20+' },
          ]}
          formatValue={(v) => (v >= 20 ? '20+' : `${v}`)}
        />
      </div>

      <ProofCallout
        title="Wist je dat VloerGroep grotere klussen veiliger laat samenwerken?"
        body="Samenwerken voelt vaak als risico. Met het netwerk en het projectdepot van VloerGroep kun je grotere klussen zakelijker verdelen, samen afronden en financieel beter borgen."
      />

      <StepResultCard>
        <p className="text-sm font-medium leading-7 text-white md:text-base">
          Je geeft aan dat je nu <AnimatedResultValue value={missedProjectsLabel} /> per jaar laat liggen door capaciteit of samenwerking.
        </p>
      </StepResultCard>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} nextLabel="Bereken mijn scan" />
      </div>
    </div>
  );
}
