import React from 'react';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { heroScreen1 } from '../lib/brandAssets';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export default function Screen1Hero({ onNext }: Props) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col pt-4 md:py-8">
      <div className="mb-4 flex md:hidden">
        <div className="rounded-[20px] border border-white/10 bg-[#061010]/88 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <BrandLogo className="h-6 w-auto" />
        </div>
      </div>

      <div className="relative mb-8">
        <ScreenHeroImage
          src={heroScreen1}
          alt="VloerGroep introductie"
        />
        <div className="pointer-events-none absolute left-4 top-4 hidden rounded-[20px] border border-white/10 bg-[#061010]/88 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl md:block">
          <BrandLogo className="h-6 w-auto sm:h-7" />
        </div>
      </div>

      <div className="mb-8 text-center md:text-left">
        <span className="mb-4 inline-flex items-center rounded-full border border-amber-gold/20 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-gold">
          VloerGroep Groeiscan
        </span>

        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          Bereken hoeveel jouw bedrijf kan groeien met VloerGroep
        </h1>

        <p className="max-w-3xl text-base leading-relaxed text-white/78 md:text-xl">
          In ongeveer 2 minuten zie je waar tijd, cashflow en omzetkansen nu blijven liggen. Daarna krijg je direct jouw scan op basis van je antwoorden.
        </p>
      </div>

      <div className="mb-10 rounded-[24px] border border-white/8 bg-[#0b1515]/75 px-5 py-4">
        <div className="grid grid-cols-1 gap-3 text-sm text-white/75 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-amber-gold" />
            Gebaseerd op jouw werkweek
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-amber-gold" />
            Direct inzicht in groeipotentie
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-amber-gold" />
            Kort en concreet
          </div>
        </div>
      </div>

      <div className="mb-32 flex w-full flex-col items-center md:mb-12">
        <Button onClick={onNext} className="w-full sm:w-auto sm:px-12 py-4 text-lg hidden md:inline-flex shadow-lg">
          Start de groeiscan <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 pb-[max(env(safe-area-inset-bottom),1rem)] bg-[#061010]/95 backdrop-blur-xl border-t border-white/5 flex justify-center md:hidden">
        <div className="w-full max-w-2xl mx-auto flex">
          <Button onClick={onNext} className="w-full !py-4 text-[18px] shadow-lg active:scale-95 group overflow-hidden relative">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start de scan
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
