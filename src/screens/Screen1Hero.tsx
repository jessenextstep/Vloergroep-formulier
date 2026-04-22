import React from 'react';
import { Button } from '../components/Button';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { heroScreen1 } from '../lib/brandAssets';
import { ArrowRight, BarChart3, CheckCircle2, Clock3, WalletCards } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export default function Screen1Hero({ onNext }: Props) {
  const highlights = [
    {
      title: 'Tijdlekken direct zichtbaar',
      text: 'Zie waar planning, administratie en communicatie nu onnodig tijd kosten.',
      icon: <Clock3 size={18} />,
    },
    {
      title: 'Cashflow sneller vrij',
      text: 'Ontdek hoeveel werkkapitaal vastzit en hoe snel VloerGroep dat kan versnellen.',
      icon: <WalletCards size={18} />,
    },
    {
      title: 'Grotere klussen beter pakken',
      text: 'Bereken waar samenwerking en betere leads direct extra omzet kunnen opleveren.',
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <div className="flex flex-col items-center pt-2">
      <div className="relative mb-8 w-full overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,24,0.96),rgba(8,15,15,0.92))] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:mb-10 md:px-10 md:py-10">
        <ScreenHeroImage
          src={heroScreen1}
          alt="VloerGroep introductie"
          className="mb-8"
        />

        <span className="mb-5 inline-flex items-center rounded-full border border-amber-gold/20 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-gold">
          VloerGroep Groeiscan
        </span>

        <h1 className="mb-4 text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white md:text-6xl">
          Ontdek in 2 minuten waar een VloerGroep demo voor jouw bedrijf direct winst oplevert
        </h1>

        <p className="mb-8 max-w-3xl text-base leading-relaxed text-white/78 md:text-xl">
          We rekenen direct door waar tijd, cashflow en grotere projecten nu blijven liggen. Daarna sturen we je scan automatisch mee en kan VloerGroep gericht een demo voorbereiden die past bij jouw situatie.
        </p>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-white/8 bg-[#0b1515]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-amber-gold/12 p-3 text-amber-gold">
                {item.icon}
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">{item.title}</h2>
              <p className="text-sm leading-6 text-white/72">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[24px] border border-white/8 bg-[#0b1515]/75 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 text-sm text-white/75 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-gold shrink-0" />
              Scan gebaseerd op jouw werkweek
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-gold shrink-0" />
              Gericht op een demo die past
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-gold shrink-0" />
              Moderne bevestiging per mail
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full mb-32 md:mb-12">
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
