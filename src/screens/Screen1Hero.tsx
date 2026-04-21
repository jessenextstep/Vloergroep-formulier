import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CheckCircle2, ShieldCheck, TrendingUp, Clock } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export default function Screen1Hero({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center pt-2">
      {/* Mobile-only header image */}
      <img 
        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=400" 
        alt="VloerGroep Start" 
        referrerPolicy="no-referrer"
        className="w-full h-40 object-cover rounded-[24px] mb-8 border border-white/5 shadow-2xl block md:hidden bg-near-black"
      />

      <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white text-center mb-5 leading-tight">
        Ontdek wat VloerGroep jouw bedrijf kan opleveren
      </h1>
      
      <p className="text-base md:text-xl text-[#FBEFD5]/60 text-center max-w-2xl mb-10">
        In 2 minuten zie je hoeveel tijd, omzet, werkcapaciteit en cashflow er voor jouw bedrijf kan vrijkomen.
      </p>

      <Card className="w-full mb-12 !p-8">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-[17px] text-[#FBEFD5]">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="text-amber-gold shrink-0 mt-0.5" size={20} />
            <span>Minder regelstress</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="text-amber-gold shrink-0 mt-0.5" size={20} />
            <span>Veiliger en sneller betaald</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="text-amber-gold shrink-0 mt-0.5" size={20} />
            <span>Meer grip op je planning</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="text-amber-gold shrink-0 mt-0.5" size={20} />
            <span>Ruimte voor grotere klussen</span>
          </li>
        </ul>
      </Card>

      <div className="flex flex-col items-center w-full mb-32 md:mb-12">
        <Button onClick={onNext} className="w-full sm:w-auto sm:px-12 py-4 text-lg hidden md:inline-flex">
          Start mijn groeiscan
        </Button>
        <p className="text-sm text-white/40 mt-6 text-center">
          Gebaseerd op praktijkdata uit de bouwsector
        </p>
      </div>

      {/* Sticky footer for mobile to feel like starting a game/app */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 pb-[max(env(safe-area-inset-bottom),1rem)] bg-[#061010]/90 backdrop-blur-3xl border-t border-amber-gold/20 flex justify-center md:hidden">
        <div className="w-full max-w-2xl mx-auto flex">
          <Button onClick={onNext} className="w-full !py-4 text-[18px] shadow-[0_0_40px_rgba(224,172,62,0.2)] hover:shadow-[0_0_60px_rgba(224,172,62,0.4)] active:scale-95 group overflow-hidden relative">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
