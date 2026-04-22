import React from 'react';
import { QuizState } from '../types';
import { BottomNav } from '../components/BottomNav';
import { Slider } from '../components/Slider';
import { formatCurrency } from '../lib/utils';
import { motion } from 'framer-motion';
import { Wallet, Clock, CalendarDays } from 'lucide-react';

interface Props {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen3Base({ state, updateState, onNext, onBack }: Props) {
  
  const yearlyHours = state.hoursPerWeek * state.weeksPerYear;
  const yearlyRevenue = yearlyHours * state.hourlyRate;

  return (
    <div className="flex-1 flex flex-col pt-4 md:py-8 max-w-2xl mx-auto w-full">
      
      {/* Mobile-only header image */}
      <img 
        src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800&h=300" 
        alt="Omzet basis" 
        referrerPolicy="no-referrer"
        className="w-full h-32 object-cover rounded-[20px] mb-6 border border-white/5 shadow-md block md:hidden bg-near-black"
      />

      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-3 tracking-tight text-white">
          {state.firstName ? `Wat is je tarief en werkweek, ${state.firstName}?` : 'Wat is je uurtarief en uren per week?'}
        </h2>
        <p className="text-base text-[#FBEFD5]/80 pr-2">
          Deze basisgegevens gebruiken we om jouw financiële groeipotentieel te berekenen.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <Slider
          label="Uurtarief"
          icon={<Wallet size={20} />}
          value={state.hourlyRate}
          onChange={(v) => updateState({ hourlyRate: v })}
          min={30}
          max={150}
          step={5}
          marks={[
            { value: 30, label: '€30' },
            { value: 90, label: '€90' },
            { value: 150, label: '€150' },
          ]}
          formatValue={v => `€ ${v}`}
        />
        
        <Slider
          label="Factureerbare uren per week"
          description="Uren die je écht aan de klant doorberekent"
          icon={<Clock size={20} />}
          value={state.hoursPerWeek}
          onChange={(v) => updateState({ hoursPerWeek: v })}
          min={10}
          max={60}
          step={2}
          marks={[
            { value: 10, label: '10' },
            { value: 35, label: '35' },
            { value: 60, label: '60' },
          ]}
          formatValue={v => `${v} u`}
        />

        <Slider
          label="Werkweken per jaar"
          icon={<CalendarDays size={20} />}
          value={state.weeksPerYear}
          onChange={(v) => updateState({ weeksPerYear: v })}
          min={25}
          max={52}
          step={1}
          marks={[
            { value: 25, label: '25' },
            { value: 40, label: '40' },
            { value: 52, label: '52' },
          ]}
          formatValue={v => `${v} w`}
        />
      </div>

      <motion.div 
        key={`${yearlyHours}-${yearlyRevenue}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 bg-amber-gold/5 border border-amber-gold/20 rounded-2xl p-5 text-center"
      >
        <p className="text-amber-gold/90 text-[15px] font-medium">
          Dat komt neer op ongeveer <span className="text-amber-gold">{yearlyHours} uur</span> per jaar en <span className="text-amber-gold">{formatCurrency(yearlyRevenue)}</span> omzet.
        </p>
      </motion.div>

      <div className="mt-auto">
        <BottomNav onNext={onNext} onBack={onBack} />
      </div>
      <p className="text-center text-sm text-white/30 mt-6">
        Je antwoorden worden alleen gebruikt om je scan te berekenen.
      </p>
    </div>
  );
}
