import React from 'react';
import { Building2, User, Users } from 'lucide-react';

import { BottomNav } from '../components/BottomNav';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { Slider } from '../components/Slider';
import { TextField } from '../components/TextField';
import { heroScreen2 } from '../lib/brandAssets';
import { QuizState } from '../types';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatTeamCount(value: number) {
  return value >= 25 ? '25+' : `${value}`;
}

export default function Screen2WhoAreYou({ state, updateState, onNext, onBack }: Props) {
  const teamMarks = [
    { value: 1, label: '1' },
    { value: 3, label: '3' },
    { value: 5, label: '5' },
    { value: 8, label: '8' },
    { value: 12, label: '12' },
    { value: 18, label: '18' },
    { value: 25, label: '25+' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pt-1 md:pb-8 md:pt-5">
      <ScreenHeroImage
        src={heroScreen2}
        alt="Bedrijfsprofiel VloerGroep"
        className="mb-6"
      />

      <div className="mb-8 text-center md:text-left">
        <span className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold">
          Profiel
        </span>
        <h2 className="mb-3 text-3xl font-bold font-display tracking-tight text-white md:text-4xl">
          Hoeveel mensen werken er bij jullie mee op de vloer?
        </h2>
        <p className="text-base leading-relaxed text-white/80">
          Tel jezelf en de mensen mee die normaal factureerbare uren draaien. Kantoor of administratie hoef je hier niet mee te tellen.
        </p>
      </div>

      <div className="mb-10">
        <Slider
          label="Aantal mensen in uitvoering"
          description="Gebruik het aantal mensen dat meestal echt werk op locatie uitvoert."
          icon={<Users size={20} />}
          value={state.teamCount}
          onChange={(value) => updateState({ teamCount: value })}
          min={1}
          max={25}
          step={1}
          tickEvery={2}
          marks={teamMarks}
          formatValue={formatTeamCount}
        />
      </div>

      <div className="mb-12 space-y-4">
        <TextField
          id="profile-first-name"
          label="Voornaam"
          labelHint="Optioneel"
          icon={User}
          type="text"
          placeholder="Bijv. Mark"
          value={state.firstName}
          onChange={(e) => updateState({ firstName: e.target.value })}
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="next"
          maxLength={80}
        />
        <TextField
          id="profile-company-name"
          label="Bedrijfsnaam"
          labelHint="Optioneel"
          icon={Building2}
          type="text"
          placeholder="Bijv. Vloerenbedrijf Jansen"
          value={state.companyName}
          onChange={(e) => updateState({ companyName: e.target.value })}
          autoComplete="organization"
          autoCapitalize="words"
          enterKeyHint="done"
          maxLength={120}
        />
      </div>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} />
      </div>
    </div>
  );
}
