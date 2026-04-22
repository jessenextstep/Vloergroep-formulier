import React, { useState } from 'react';
import { QuizState, TeamSize } from '../types';
import { BottomNav } from '../components/BottomNav';
import { Card } from '../components/Card';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { TextField } from '../components/TextField';
import { heroScreen2 } from '../lib/brandAssets';
import { User, Users, Building2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen2WhoAreYou({ state, updateState, onNext, onBack }: Props) {
  const [showError, setShowError] = useState(false);

  const teamOptions: { value: TeamSize; label: string; icon: React.ReactNode }[] = [
    { value: 'alone', label: 'Ik werk alleen', icon: <User size={24} /> },
    { value: '1-2', label: 'Ik werk met 1\u20132 man', icon: <Users size={24} /> },
    { value: 'small-team', label: 'Klein team (3\u20135 man)', icon: <Building2 size={24} /> },
    { value: 'large-team', label: 'Groter team (6+ personen)', icon: <TrendingUp size={24} /> },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col pt-1 md:pb-8 md:pt-5">
      <ScreenHeroImage
        src={heroScreen2}
        alt="Bedrijfsprofiel VloerGroep"
        className="mb-6"
      />

      <div className="mb-8 text-center md:text-left">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold mb-4">Profiel</span>
        <h2 id="team-size-label" className="text-3xl md:text-4xl font-bold font-display mb-3 tracking-tight text-white">Met hoeveel mensen werk je?</h2>
        <p className="text-base text-white/80 leading-relaxed">
          We stemmen de calculatie af op jouw actuele bedrijfsgrootte.
        </p>
      </div>

      <AnimatePresence>
        {showError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            id="team-size-error"
            className="mb-6 text-amber-gold bg-amber-gold/10 p-3 lg:p-4 rounded-xl border border-amber-gold/20 text-sm md:text-base text-center"
          >
            Selecteer eerst met hoeveel mensen je werkt om verder te gaan.
          </motion.div>
        )}
      </AnimatePresence>

      <div
        role="radiogroup"
        aria-labelledby="team-size-label"
        aria-describedby={showError ? 'team-size-error' : undefined}
        className="grid grid-cols-2 gap-3 mb-10"
      >
        {teamOptions.map((opt) => (
          <Card
            key={opt.value}
            role="radio"
            interactive
            selected={state.teamSize === opt.value}
            onClick={() => {
              updateState({ teamSize: opt.value });
              if (showError) setShowError(false);
            }}
            className={`flex flex-col items-center justify-center p-4 text-center gap-3 ${showError && state.teamSize === '' ? 'border-amber-gold/50 shadow-[0_0_15px_rgba(224,172,62,0.15)] ring-1 ring-amber-gold/50' : ''}`}
          >
            <div className={`p-3 rounded-2xl ${state.teamSize === opt.value ? 'bg-near-black text-amber-gold' : 'bg-white/5 text-white/50'}`}>
              {opt.icon}
            </div>
            <span className="font-medium text-lg">{opt.label}</span>
          </Card>
        ))}
      </div>

      <div className="space-y-4 mb-12">
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
        <BottomNav 
          onNext={() => {
            if (!state.teamSize) {
              setShowError(true);
              const el = document.getElementById('team-size-error') || document.querySelector('h2');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              return;
            }
            onNext();
          }} 
          onBack={onBack} 
        />
      </div>
    </div>
  );
}
