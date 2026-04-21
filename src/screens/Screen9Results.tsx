import React, { useState } from 'react';
import { QuizState, CalculationResults } from '../types';
import { formatCurrency, formatNumber } from '../lib/utils';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  state: QuizState;
  results: CalculationResults;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen9Results({ state, results, onNext, onBack }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto py-8">
      
      {/* Header */}
      <div className="text-center mb-10 w-full">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Dit kan VloerGroep jouw bedrijf opleveren</h1>
        <p className="text-lg text-[#FBEFD5]/60 max-w-2xl mx-auto">
          Op basis van jouw antwoorden en een realistisch scenario.
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
        <Card className="relative overflow-hidden group !p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-amber-gold">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-gold mb-2">Extra omzet p/j</p>
          <h2 className="text-4xl font-bold text-white mb-1">
            {formatCurrency(results.totals.totalExtraRevenue)}
          </h2>
          <p className="text-[11px] text-[#FBEFD5]/40 mt-auto">Groeipotentieel via leads & tijd</p>
        </Card>

        <Card className="relative overflow-hidden group !p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-amber-gold">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-gold mb-2">Extra capaciteit</p>
          <h2 className="text-4xl font-bold text-white mb-1 flex items-baseline gap-1">
            +{formatNumber(results.totals.totalExtraCapacityWeeks, 1)} <span className="text-lg font-light text-[#FBEFD5]/60">weken</span>
          </h2>
          <p className="text-[11px] text-[#FBEFD5]/40 mt-auto">Ruimte voor grotere projecten</p>
        </Card>

        <Card className="relative overflow-hidden group !p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-amber-gold">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-gold mb-2">Cashflow versnelling</p>
          <h2 className="text-4xl font-bold text-white mb-1">
            {formatCurrency(results.cashflow.fasterCashflow)}
          </h2>
          <p className="text-[11px] text-[#FBEFD5]/40 mt-auto">Direct beschikbaar werkkapitaal</p>
        </Card>

        <Card className="relative overflow-hidden group !p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-amber-gold">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-gold mb-2">Extra winst p/j</p>
          <h2 className="text-4xl font-bold text-white mb-1">
            {formatCurrency(results.totals.totalExtraProfit)}
          </h2>
          <p className="text-[11px] text-[#FBEFD5]/40 mt-auto">Op basis van marge ({formatNumber(51.8, 1)}%)</p>
        </Card>
      </div>

      {/* Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
        
        <div className="flex items-center gap-4 p-5 bg-white/[0.02] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl rounded-[28px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="w-10 h-10 shrink-0 rounded-full bg-amber-gold/10 flex items-center justify-center text-amber-gold font-bold">1</div>
          <div>
            <h4 className="text-sm font-semibold text-white">Tijdswinst per week</h4>
            <p className="text-xs text-[#FBEFD5]/50">{formatNumber(results.timeSaved.hoursPerWeekSaved, 1)} uur minder administratie</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-white/[0.02] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl rounded-[28px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="w-10 h-10 shrink-0 rounded-full bg-amber-gold/10 flex items-center justify-center text-amber-gold font-bold">2</div>
          <div>
            <h4 className="text-sm font-semibold text-white">Groei door betere leads</h4>
            <p className="text-xs text-[#FBEFD5]/50">Conversie en stroom verbeteren</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-white/[0.02] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl rounded-[28px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="w-10 h-10 shrink-0 rounded-full bg-amber-gold/10 flex items-center justify-center text-amber-gold font-bold">3</div>
          <div>
            <h4 className="text-sm font-semibold text-white">Grotere klussen samen</h4>
            <p className="text-xs text-[#FBEFD5]/50">{state.missedProjects}x meepakken via teamwerk</p>
          </div>
        </div>
        
      </div>

      {/* Details Toggle */}
      <div className="flex justify-center mb-12">
         <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors py-2 px-4 rounded-full bg-white/5"
          >
            {showDetails ? 'Verberg details' : 'Hoe is dit berekend?'}
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
         </button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="prose prose-invert prose-p:text-white/60 prose-strong:text-white/90 max-w-none text-sm bg-white/[0.02] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 md:p-8 rounded-[28px] mb-12">
              <h4 className="text-lg font-semibold mt-0">Hoe we dit hebben berekend</h4>
              <p>Geen schatting uit de lucht, maar een nuchtere berekening gebaseerd op de cijfers die je zojuist hebt ingevuld.</p>
              
              <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-amber-gold">
                <li><strong>Tijdswinst:</strong> Je gaf aan {results.timeSaved.hoursPerWeekSaved} uur per week kwijt te zijn aan regelen buiten de klus. We rekenen dat je daarvan 85% realistisch kan omzetten in betaald werk.</li>
                <li><strong>Groeipotentieel (Leads):</strong> Met een {state.leadScenario === 'conservative' ? 'voorzichtige (5%)' : state.leadScenario === 'realistic' ? 'realistische (10%)' : 'ambitieuze (12,5%)'} verbetering in conversie door betere leads, gecombineerd met jouw gemiddelde klus van {state.hoursPerLead} uur.</li>
                {state.missedProjects > 0 && (
                  <li><strong>Groeipotentieel (Samenwerking):</strong> {state.missedProjects} x extra grote klussen per jaar die je anders moest laten liggen.</li>
                )}
                <li><strong>Cashflow:</strong> Is geen extra omzet. Dit is het deel van je omzet ({state.percentageVloergroep}%) dat niet meer {state.paymentDays} dagen vastzit, maar veel sneller vrijkomt via een veilig projectdepot.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to push content above sticky footer */}
      <div className="h-32 w-full shrink-0" />

      {/* Sticky footer for both mobile and desktop with primary CTA */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 pb-[max(env(safe-area-inset-bottom),1rem)] bg-[#061010]/90 backdrop-blur-3xl border-t border-white/5"
      >
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between px-2 sm:px-6">
          <button onClick={onBack} className="text-white/40 hover:text-white transition-colors text-sm font-medium hidden sm:block">
            Aanpassen
          </button>
          <div className="flex w-full sm:w-auto ml-auto">
            <Button onClick={onNext} className="w-full sm:w-auto !px-10 !py-4 text-[16px] xl:text-[18px] shadow-xl shadow-amber-gold/20 active:scale-95">
              Plan een VloerGroep Demo
            </Button>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
