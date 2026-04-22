import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export default function Screen1Hero({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center pt-2">
      {/* Mobile-only header image */}
      <img 
        src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800&h=400" 
        alt="VloerGroep Start" 
        referrerPolicy="no-referrer"
        className="w-full h-32 md:h-40 object-cover rounded-[20px] mb-6 md:mb-8 border border-white/5 shadow-lg block md:hidden bg-near-black"
      />

      <span className="text-amber-gold uppercase tracking-wider text-[10px] md:text-xs font-semibold mb-3 text-center">Voor vakmannen die goed werk leveren</span>
      <h1 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-white text-center mb-5 leading-tight">
        Goed werk verdient een systeem om te groeien
      </h1>
      
      <p className="text-[15px] md:text-lg text-[#FBEFD5]/80 text-center max-w-2xl mb-8 md:mb-10 lg:leading-relaxed">
        VloerGroep is hét platform voor alle vloerprojecten. Of je nu grote werken aanneemt of kleine klussen doet, de administratie en rommelige planning die erbij komen kijken kosten geld. Ontdek met deze korte Groeiscan direct wat het voor jouw specifieke situatie oplevert om alles overzichtelijk via één systeem te laten lopen.
      </p>

      <Card className="w-full mb-8 md:mb-12 !p-6 md:!p-8 shadow-lg border-white/[0.08]">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-8 text-base md:text-[17px] text-[#FBEFD5]">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="text-amber-gold shrink-0 mt-0.5" size={20} />
            <span>Grotere klussen samen aanpakken</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="text-amber-gold shrink-0 mt-0.5" size={20} />
            <span>Planning in 1 centraal overzicht</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="text-amber-gold shrink-0 mt-0.5" size={20} />
            <span>Veilig en snel betaald via een werkdepot</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="text-amber-gold shrink-0 mt-0.5" size={20} />
            <span>Minder losse appjes & offertes</span>
          </li>
        </ul>
      </Card>

      <div className="flex flex-col items-center w-full mb-32 md:mb-12">
        <Button onClick={onNext} className="w-full sm:w-auto sm:px-12 py-4 text-lg hidden md:inline-flex shadow-lg">
          Bereken mijn groeipotentieel
        </Button>
      </div>

      {/* Sticky footer for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 pb-[max(env(safe-area-inset-bottom),1rem)] bg-[#061010]/95 backdrop-blur-xl border-t border-white/5 flex justify-center md:hidden">
        <div className="w-full max-w-2xl mx-auto flex">
          <Button onClick={onNext} className="w-full !py-4 text-[18px] shadow-lg active:scale-95 group overflow-hidden relative">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Bereken mijn groei
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
