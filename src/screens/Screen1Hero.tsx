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
      title: 'Meer grip op planning',
      text: 'Minder losse afspraken, appjes en zoekwerk tussen projecten.',
      icon: <Clock3 size={18} />,
    },
    {
      title: 'Sneller betaald',
      text: 'Maak cashflow vrij met een duidelijke en veilige projectflow.',
      icon: <WalletCards size={18} />,
    },
    {
      title: 'Groeikansen zichtbaar',
      text: 'Zie waar omzet, tijd en grotere klussen nu blijven liggen.',
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <div className="flex flex-col items-center pt-2">
      <div className="relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-8 md:px-10 md:py-12 shadow-[0_24px_80px_rgba(0,0,0,0.35)] mb-8 md:mb-10">
        <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(224,172,62,0.22),transparent_60%)] pointer-events-none" />
        <div className="absolute -right-12 top-10 h-28 w-28 rounded-full bg-amber-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <ScreenHeroImage
          src={heroScreen1}
          alt="VloerGroep introductie"
          className="mb-8"
        />

        <span className="inline-flex items-center rounded-full border border-amber-gold/20 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-gold mb-5">
          In circa 2 minuten
        </span>

        <h1 className="text-4xl md:text-6xl font-black font-display tracking-[-0.04em] text-white leading-[0.98] mb-4">
          Ontdek waar jouw vloerbedrijf nu tijd, cash en omzet laat liggen
        </h1>

        <p className="text-base md:text-xl text-white/80 max-w-3xl mb-6 leading-relaxed">
          Je krijgt direct een heldere business case op basis van jouw situatie. Kort, concreet en zonder verplichting.
        </p>

        <div className="flex flex-wrap gap-3 mb-8 text-sm">
          <span className="rounded-full bg-white/6 px-4 py-2 text-white/85">Direct inzicht in groeipotentieel</span>
          <span className="rounded-full bg-white/6 px-4 py-2 text-white/85">Geen afspraak nodig om te starten</span>
          <span className="rounded-full bg-white/6 px-4 py-2 text-white/85">Gebaseerd op jouw werkweek</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-white/8 bg-[#0c1818]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-amber-gold/12 p-3 text-amber-gold">
                {item.icon}
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">{item.title}</h2>
              <p className="text-sm leading-6 text-white/72">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[24px] border border-white/8 bg-[#0c1818]/75 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-white/75">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-gold shrink-0" />
              Minder regelwerk
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-gold shrink-0" />
              Sneller betaald
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-gold shrink-0" />
              Meer grip op groei
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full mb-32 md:mb-12">
        <Button onClick={onNext} className="w-full sm:w-auto sm:px-12 py-4 text-lg hidden md:inline-flex shadow-lg">
          Start de groeiscan <ArrowRight size={18} className="ml-2" />
        </Button>
        <p className="hidden md:block mt-4 text-sm text-white/55">
          Geen lange intake. Eerst inzicht, daarna pas contact als jij dat wilt.
        </p>
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
