import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { QuizState } from '../types';

interface Props {
  state: QuizState;
}

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
}

export default function Screen10Capture({ state }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [intent, setIntent] = useState<'demo' | 'info'>('demo');
  const [formData, setFormData] = useState<FormData>({ 
    name: state.firstName || '', 
    company: state.companyName || '', 
    email: '', 
    phone: '' 
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitErrorMsg, setSubmitErrorMsg] = useState(false);

  const intentOptions = [
    { value: 'demo', label: 'Een demo plannen' },
    { value: 'info', label: 'Eerst meer uitleg' },
  ] as const;

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Naam is verplicht';
    if (!formData.company.trim()) newErrors.company = 'Bedrijfsnaam is verplicht';
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Vul een geldig e-mailadres in';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefoonnummer is verplicht';
    } else if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(formData.phone) || formData.phone.length < 8) {
      newErrors.phone = 'Vul een geldig telefoonnummer in';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (submitErrorMsg) setSubmitErrorMsg(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentErrors = validate();
    const errorKeys = Object.keys(currentErrors);

    if (errorKeys.length === 0) {
      // Simulate API call
      setTimeout(() => {
        setSubmitted(true);
      }, 600);
    } else {
      setSubmitErrorMsg(true);
      // Scroll to the first error field
      const firstErrorField = errorKeys[0];
      const el = document.querySelector(`input[name="${firstErrorField}"]`) as HTMLInputElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Small delay to let smooth scroll start before focusing
        setTimeout(() => el.focus({ preventScroll: true }), 100);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-8 max-w-xl mx-auto w-full">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div 
            key="capture-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Zullen we samen naar jouw situatie kijken?</h2>
              <p className="text-lg text-white/60">
                Deze scan geeft je een realistisch beeld. In een demo laten we zien hoe dit er in de praktijk voor jouw bedrijf uitziet.
              </p>
            </div>

            <form id="capture-form" onSubmit={handleSubmit} className="space-y-6 bg-white/[0.02] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 md:p-8 rounded-[28px]">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 pl-1">Naam</label>
                  <input name="name" value={formData.name} onChange={handleChange} type="text" className={`w-full bg-near-black border-2 rounded-2xl px-5 py-4 text-[16px] md:text-[18px] text-white placeholder-white/20 focus:outline-none transition-all shadow-inner ${errors.name ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/5 focus:border-amber-gold/50 focus:ring-4 focus:ring-amber-gold/10'}`} />
                  {errors.name && <p className="text-red-400 text-xs mt-1.5 pl-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 pl-1">Bedrijfsnaam</label>
                  <input name="company" value={formData.company} onChange={handleChange} type="text" className={`w-full bg-near-black border-2 rounded-2xl px-5 py-4 text-[16px] md:text-[18px] text-white placeholder-white/20 focus:outline-none transition-all shadow-inner ${errors.company ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/5 focus:border-amber-gold/50 focus:ring-4 focus:ring-amber-gold/10'}`} />
                  {errors.company && <p className="text-red-400 text-xs mt-1.5 pl-1">{errors.company}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 pl-1">E-mailadres</label>
                  <input name="email" value={formData.email} onChange={handleChange} type="email" className={`w-full bg-near-black border-2 rounded-2xl px-5 py-4 text-[16px] md:text-[18px] text-white placeholder-white/20 focus:outline-none transition-all shadow-inner ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/5 focus:border-amber-gold/50 focus:ring-4 focus:ring-amber-gold/10'}`} />
                  {errors.email && <p className="text-red-400 text-xs mt-1.5 pl-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 pl-1">Telefoonnummer</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className={`w-full bg-near-black border-2 rounded-2xl px-5 py-4 text-[16px] md:text-[18px] text-white placeholder-white/20 focus:outline-none transition-all shadow-inner ${errors.phone ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-white/5 focus:border-amber-gold/50 focus:ring-4 focus:ring-amber-gold/10'}`} />
                  {errors.phone && <p className="text-red-400 text-xs mt-1.5 pl-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-white/70 mb-3 pl-1">Ik wil graag:</label>
                <div className="space-y-3">
                  {intentOptions.map(opt => (
                    <div 
                      key={opt.value} 
                      onClick={() => setIntent(opt.value)}
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        intent === opt.value 
                          ? 'bg-amber-gold/10 border-amber-gold text-amber-gold shadow-[0_0_20px_rgba(224,172,62,0.15)]' 
                          : 'bg-near-black border-white/5 hover:border-white/20 text-white/60'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                         intent === opt.value ? 'border-amber-gold bg-amber-gold/20' : 'border-white/20 bg-charcoal/50'
                      }`}>
                         {intent === opt.value && <div className="w-2.5 h-2.5 bg-amber-gold rounded-full" />}
                      </div>
                      <span className={`font-medium text-[16px] ${intent === opt.value ? 'text-white' : ''}`}>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 hidden md:block">
                 {submitErrorMsg && (
                   <div className="mb-4 text-amber-gold bg-amber-gold/10 p-3 rounded-xl border border-amber-gold/20 text-sm text-center">
                     Oeps! Er missen nog een aantal vereiste velden. We hebben ze rood gemarkeerd.
                   </div>
                 )}
                 <Button type="submit" fullWidth>Versturen</Button>
              </div>

            </form>

            {/* Spacer to push content above sticky footer on mobile */}
            <div className="h-40 md:h-0 w-full shrink-0" />

            {/* Sticky footer for both mobile and desktop with primary CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 pb-[max(env(safe-area-inset-bottom),1rem)] bg-[#061010]/90 backdrop-blur-3xl border-t border-white/5 md:hidden">
              <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-between px-2 sm:px-6">
                <AnimatePresence>
                  {submitErrorMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mb-3 text-amber-gold bg-amber-gold/10 p-3 rounded-xl border border-amber-gold/20 text-sm text-center w-full"
                    >
                      Oeps! Vul eerst de rood gemarkeerde velden in.
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button type="submit" form="capture-form" className="w-full !py-4 text-[16px] shadow-xl shadow-amber-gold/20 active:scale-95">
                  Versturen
                </Button>
              </div>
            </div>

          </motion.div>
        ) : (
            <motion.div 
            key="capture-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center justify-center text-center p-8 bg-white/[0.02] bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[28px]"
          >
            <div className="w-20 h-20 bg-amber-gold/10 rounded-full flex items-center justify-center text-amber-gold mb-6">
              <Check size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Bedankt!</h3>
            <p className="text-white/60 mb-8 max-w-sm">
              We hebben je gegevens ontvangen. Ontdek alvast meer over hoe we werken via onderstaande knop.
            </p>
            <Button variant="secondary" onClick={() => window.location.href = '#'}>
              Terug naar website
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
