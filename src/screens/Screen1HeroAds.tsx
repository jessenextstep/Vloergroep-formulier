import React from 'react';
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';

import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { heroScreen1 } from '../lib/brandAssets';

interface Props {
  onNext: () => void;
}

export default function Screen1HeroAds({ onNext }: Props) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col pt-0 md:py-8">
      <div className="relative mb-8">
        <ScreenHeroImage
          src={heroScreen1}
          alt="Vakman groeiscan van VloerGroep"
        />
        <div className="pointer-events-none absolute left-4 top-4 hidden rounded-[20px] border border-white/10 bg-[#090909]/88 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl md:block">
          <BrandLogo className="h-6 w-auto sm:h-7" />
        </div>
      </div>

      <div className="mb-8 text-center md:text-left">
        <span className="mb-4 inline-flex items-center rounded-full border border-amber-gold/20 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-gold">
          Gratis vakman scan
        </span>

        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          Ontdek waar jouw vloerbedrijf nu tijd, cashflow en omzet laat liggen
        </h1>

        <p className="max-w-3xl text-base leading-relaxed text-white/78 md:text-xl">
          Beantwoord 5 korte vragen en ontvang jouw persoonlijke scan direct per mail. Kort, concreet en gemaakt voor vakmannen die slimmer willen groeien.
        </p>
      </div>

      <div className="mb-10 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(38,38,38,0.4),rgba(18,18,18,0.18))] px-5 py-4 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 text-sm text-white/75 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-amber-gold" />
            In 2 minuten ingevuld
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="shrink-0 text-amber-gold" />
            Uitslag direct per mail
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="shrink-0 text-amber-gold" />
            Geen verplicht gesprek
          </div>
        </div>
      </div>

      <div className="hidden w-full flex-col items-center md:mb-12 md:flex">
        <Button onClick={onNext} className="hidden w-full py-4 text-lg shadow-lg sm:w-auto sm:px-12 md:inline-flex">
          Start mijn scan <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center border-t border-white/5 bg-[#050505]/94 p-4 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex w-full max-w-2xl">
          <Button onClick={onNext} className="group relative w-full overflow-hidden !py-4 text-[18px] shadow-lg active:scale-95">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start mijn scan
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
