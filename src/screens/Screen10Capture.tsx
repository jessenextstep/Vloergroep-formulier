import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Check, Mail, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  CalculationResults,
  LeadCaptureFormData,
  LeadSubmissionPayload,
  LeadSubmissionResponse,
  QuizState,
} from '../types';
import {
  buildLeadKpis,
  buildLeadProfile,
  buildLeadSummary,
  getIntentLabel,
} from '../lib/leadProfile';

interface Props {
  state: QuizState;
  results: CalculationResults;
  sessionStartedAt: number;
}

type FormErrors = Partial<Record<'name' | 'company' | 'email' | 'phone' | 'consent', string>>;

const CAPTURE_STORAGE_KEY = 'vloergroep-groeiscan-contact/v1';
const DEMO_URL = import.meta.env.VITE_VLOERGROEP_DEMO_URL || 'https://vloergroep.nl';

function readStoredFormData(defaults: LeadCaptureFormData): LeadCaptureFormData {
  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const storedValue = window.localStorage.getItem(CAPTURE_STORAGE_KEY);
    if (!storedValue) {
      return defaults;
    }

    return {
      ...defaults,
      ...JSON.parse(storedValue),
    } as LeadCaptureFormData;
  } catch {
    return defaults;
  }
}

export default function Screen10Capture({ state, results, sessionStartedAt }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'live' | 'preview' | null>(null);
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeadCaptureFormData>(() =>
    readStoredFormData({
      name: state.firstName || '',
      company: state.companyName || '',
      email: '',
      phone: '',
      intent: 'demo',
      consent: true,
      website: '',
    }),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setFormData((current) => {
      const nextName = current.name || state.firstName || '';
      const nextCompany = current.company || state.companyName || '';

      if (nextName === current.name && nextCompany === current.company) {
        return current;
      }

      return {
        ...current,
        name: nextName,
        company: nextCompany,
      };
    });
  }, [state.companyName, state.firstName]);

  useEffect(() => {
    if (submitted) {
      return;
    }
    window.localStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify(formData));
  }, [formData, submitted]);

  const profile = buildLeadProfile(state, results, formData.intent);
  const leadKpis = buildLeadKpis(results);
  const leadSummary = buildLeadSummary(state, results, formData.intent);

  const intentOptions = [
    { value: 'demo', label: 'Een demo plannen', description: 'Ik wil zien hoe dit in de praktijk werkt.' },
    { value: 'info', label: 'Eerst meer uitleg', description: 'Ik wil eerst de business case en mogelijkheden ontvangen.' },
  ] as const;

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Naam is verplicht';
    }

    if (!formData.company.trim()) {
      nextErrors.company = 'Bedrijfsnaam is verplicht';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Vul een geldig e-mailadres in';
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'Telefoonnummer is verplicht';
    } else if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(formData.phone) || formData.phone.trim().length < 8) {
      nextErrors.phone = 'Vul een geldig telefoonnummer in';
    }

    if (!formData.consent) {
      nextErrors.consent = 'Geef toestemming zodat we je scan mogen opvolgen';
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const focusField = (fieldName: keyof FormErrors) => {
    const selector =
      fieldName === 'consent'
        ? '#capture-consent'
        : `input[name="${fieldName}"]`;
    const field = document.querySelector(selector) as HTMLElement | null;
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => field.focus({ preventScroll: true }), 120);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((current) => ({
        ...current,
        [name]: undefined,
      }));
    }

    if (serverMessage) {
      setServerMessage('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate();
    const errorFields = Object.keys(validationErrors) as Array<keyof FormErrors>;

    if (errorFields.length > 0) {
      focusField(errorFields[0]);
      return;
    }

    setIsSubmitting(true);
    setServerMessage('');

    const payload: LeadSubmissionPayload = {
      contact: formData,
      quiz: state,
      meta: {
        source: 'groeiscan',
        sessionStartedAt,
        submittedAt: Date.now(),
        pathname: window.location.pathname,
        userAgent: navigator.userAgent,
      },
    };

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as LeadSubmissionResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'De lead kon niet worden verstuurd.');
      }

      setSubmitted(true);
      setDeliveryMode(data.deliveryMode);
      setServerMessage(data.message || '');
      window.localStorage.removeItem(CAPTURE_STORAGE_KEY);
    } catch (error) {
      setServerMessage(
        error instanceof Error
          ? error.message
          : 'De aanvraag kon niet worden verstuurd. Probeer het zo nog eens.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-8 max-w-6xl mx-auto w-full">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="capture-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full"
          >
            <div className="mb-10 text-center lg:text-left">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold mb-4">
                Laatste stap
              </span>
              <h2 className="text-3xl md:text-5xl font-bold font-display mb-4 tracking-tight text-white">
                Ontvang je groeiscan en volgende stap op maat
              </h2>
              <p className="text-lg text-white/78 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                Vul je gegevens in en we sturen direct een modern overzicht van je scan. Tegelijk ontvangt
                ons team een concreet leadprofiel met kansen, valkuilen en verkooptips.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
              <form
                id="capture-form"
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6 bg-white/[0.02] bg-gradient-to-br from-white/[0.06] to-transparent backdrop-blur-md border border-white/[0.08] shadow-lg p-6 md:p-8 rounded-[28px]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2 pl-1" htmlFor="capture-name">
                      Naam
                    </label>
                    <input
                      id="capture-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      type="text"
                      maxLength={80}
                      autoComplete="name"
                      autoCapitalize="words"
                      enterKeyHint="next"
                      className={`w-full bg-[#0f1b1b] border-2 rounded-2xl px-5 py-4 text-[16px] md:text-[18px] text-white placeholder-white/35 focus:outline-none transition-all shadow-inner ${
                        errors.name
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-white/14 focus:border-amber-gold/55 focus:ring-4 focus:ring-amber-gold/10'
                      }`}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'capture-name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="capture-name-error" className="text-red-300 text-xs mt-1.5 pl-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2 pl-1" htmlFor="capture-company">
                      Bedrijfsnaam
                    </label>
                    <input
                      id="capture-company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      type="text"
                      maxLength={120}
                      autoComplete="organization"
                      autoCapitalize="words"
                      enterKeyHint="next"
                      className={`w-full bg-[#0f1b1b] border-2 rounded-2xl px-5 py-4 text-[16px] md:text-[18px] text-white placeholder-white/35 focus:outline-none transition-all shadow-inner ${
                        errors.company
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-white/14 focus:border-amber-gold/55 focus:ring-4 focus:ring-amber-gold/10'
                      }`}
                      aria-invalid={Boolean(errors.company)}
                      aria-describedby={errors.company ? 'capture-company-error' : undefined}
                    />
                    {errors.company && (
                      <p id="capture-company-error" className="text-red-300 text-xs mt-1.5 pl-1">
                        {errors.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2 pl-1" htmlFor="capture-email">
                      E-mailadres
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                      <input
                        id="capture-email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        type="email"
                        maxLength={160}
                        autoComplete="email"
                        inputMode="email"
                        enterKeyHint="next"
                        className={`w-full bg-[#0f1b1b] border-2 rounded-2xl pl-12 pr-5 py-4 text-[16px] md:text-[18px] text-white placeholder-white/35 focus:outline-none transition-all shadow-inner ${
                          errors.email
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-white/14 focus:border-amber-gold/55 focus:ring-4 focus:ring-amber-gold/10'
                        }`}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'capture-email-error' : undefined}
                      />
                    </div>
                    {errors.email && (
                      <p id="capture-email-error" className="text-red-300 text-xs mt-1.5 pl-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2 pl-1" htmlFor="capture-phone">
                      Telefoonnummer
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                      <input
                        id="capture-phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        type="tel"
                        maxLength={40}
                        autoComplete="tel"
                        inputMode="tel"
                        enterKeyHint="done"
                        className={`w-full bg-[#0f1b1b] border-2 rounded-2xl pl-12 pr-5 py-4 text-[16px] md:text-[18px] text-white placeholder-white/35 focus:outline-none transition-all shadow-inner ${
                          errors.phone
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-white/14 focus:border-amber-gold/55 focus:ring-4 focus:ring-amber-gold/10'
                        }`}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? 'capture-phone-error' : undefined}
                      />
                    </div>
                    {errors.phone && (
                      <p id="capture-phone-error" className="text-red-300 text-xs mt-1.5 pl-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="capture-website">Website</label>
                  <input
                    id="capture-website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    type="text"
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-white/80 mb-3 pl-1">Wat wil je als vervolg?</label>
                  <div className="space-y-3">
                    {intentOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFormData((current) => ({ ...current, intent: option.value }));
                          setServerMessage('');
                        }}
                        className={`w-full text-left flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${
                          formData.intent === option.value
                            ? 'bg-amber-gold/10 border-amber-gold text-white shadow-[0_0_15px_rgba(224,172,62,0.15)]'
                            : 'bg-[#0f1b1b] border-white/8 hover:border-white/18 text-white/72'
                        }`}
                        aria-pressed={formData.intent === option.value}
                      >
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          formData.intent === option.value ? 'border-amber-gold bg-amber-gold/15' : 'border-white/20'
                        }`}>
                          {formData.intent === option.value && <div className="w-2.5 h-2.5 bg-amber-gold rounded-full" />}
                        </div>
                        <div>
                          <div className="font-semibold text-[16px] text-white">{option.label}</div>
                          <div className="text-sm text-white/62 mt-1 leading-6">{option.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-[#0f1b1b]/85 p-4">
                  <label className="flex items-start gap-3 cursor-pointer" htmlFor="capture-consent">
                    <input
                      id="capture-consent"
                      name="consent"
                      type="checkbox"
                      checked={formData.consent}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-amber-gold focus:ring-amber-gold"
                    />
                    <span className="text-sm text-white/72 leading-6">
                      Ik geef toestemming dat VloerGroep contact met mij opneemt over mijn scan en de vervolgstap die daarbij past.
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-red-300 text-xs mt-2 pl-7">{errors.consent}</p>
                  )}
                </div>

                <AnimatePresence>
                  {serverMessage && !submitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="text-amber-gold bg-amber-gold/10 p-4 rounded-2xl border border-amber-gold/20 text-sm"
                    >
                      {serverMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/55">
                    <ShieldCheck size={16} className="text-amber-gold shrink-0" />
                    Server-side gevalideerd en klaar voor Resend.
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto !px-8 !py-4 text-base shadow-xl shadow-amber-gold/20">
                    {isSubmitting ? 'Bezig met versturen...' : 'Stuur mijn scan'}
                  </Button>
                </div>
              </form>

              <div className="space-y-4">
                <Card className="!p-6 md:!p-7">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <span className="inline-flex rounded-full bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold mb-3">
                        Wat jij ontvangt
                      </span>
                      <h3 className="text-2xl font-bold font-display text-white">Persoonlijk overzicht + slimme vervolgstap</h3>
                    </div>
                    <div className="rounded-2xl bg-amber-gold/12 p-3 text-amber-gold">
                      <Sparkles size={20} />
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-amber-gold/14 bg-amber-gold/6 p-5 mb-5">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-amber-gold font-semibold mb-2">
                      Beste insteek volgens jouw scan
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">{profile.primaryAngle}</div>
                    <p className="text-sm leading-6 text-white/70">{profile.primaryMessage}</p>
                  </div>

                  <div className="space-y-3">
                    {leadKpis.map((kpi) => (
                      <div key={kpi.label} className="rounded-2xl border border-white/8 bg-[#0f1b1b]/80 p-4">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-amber-gold font-semibold mb-2">{kpi.label}</div>
                        <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                        <p className="text-sm text-white/60 leading-6">{kpi.caption}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="!p-6 md:!p-7">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-amber-gold font-semibold mb-3">Overzicht van je keuzes</div>
                  <div className="space-y-3">
                    {leadSummary.slice(0, 6).map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
                        <span className="text-sm text-white/58">{item.label}</span>
                        <span className="text-sm text-right text-white/88 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-white/62 leading-6">
                    Je keuze staat nu op <strong className="text-white font-semibold">{getIntentLabel(formData.intent)}</strong>. Dat nemen we mee in de mail en de interne opvolging.
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="capture-success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <div className="bg-white/[0.02] bg-gradient-to-br from-white/[0.06] to-transparent backdrop-blur-md border border-white/[0.08] shadow-lg rounded-[30px] p-6 md:p-10">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 bg-amber-gold/12 rounded-full flex items-center justify-center text-amber-gold mb-6">
                  <Check size={40} strokeWidth={2.5} />
                </div>
                <span className="inline-flex rounded-full border border-amber-gold/18 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold mb-4">
                  Aanvraag ontvangen
                </span>
                <h3 className="text-3xl md:text-5xl font-bold font-display mb-4">Je overzicht staat klaar</h3>
                <p className="text-white/72 max-w-2xl text-lg leading-relaxed">
                  We hebben je gegevens verwerkt. Jij krijgt een moderne bevestiging met je scanoverzicht en ons team ontvangt tegelijk een persoonlijk leadprofiel.
                </p>
              </div>

              {deliveryMode === 'preview' && (
                <div className="mb-8 rounded-2xl border border-amber-gold/18 bg-amber-gold/10 p-4 text-sm text-amber-gold">
                  {serverMessage || 'Previewmodus: de mailflow is technisch voorbereid. Zodra `RESEND_API_KEY` live staat in Vercel worden de mails ook echt verzonden.'}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {leadKpis.map((kpi) => (
                  <div key={kpi.label} className="rounded-[24px] border border-white/8 bg-[#0f1b1b]/82 p-5">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-amber-gold font-semibold mb-2">{kpi.label}</div>
                    <div className="text-3xl font-bold text-white mb-2">{kpi.value}</div>
                    <p className="text-sm text-white/62 leading-6">{kpi.caption}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
                <Card className="!p-6 md:!p-7">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-amber-gold font-semibold mb-3">Wat er nu is vastgelegd</div>
                  <div className="space-y-3">
                    {leadSummary.map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
                        <span className="text-sm text-white/58">{item.label}</span>
                        <span className="text-sm text-right text-white/88 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="!p-6 md:!p-7">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-amber-gold font-semibold mb-3">Persoonlijk profiel voor opvolging</div>
                  <h4 className="text-2xl font-bold font-display text-white mb-2">{profile.primaryAngle}</h4>
                  <p className="text-white/70 leading-7 mb-5">{profile.primaryMessage}</p>
                  <div className="space-y-3 mb-5">
                    {profile.opportunities.slice(0, 3).map((item) => (
                      <div key={item} className="flex gap-3 text-sm text-white/70 leading-6">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-gold shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-[#0f1b1b]/82 p-4 text-sm text-white/62 leading-6">
                    Interne opvolging: <strong className="text-white font-semibold">{profile.nextStep}</strong>
                  </div>
                </Card>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center">
                <Button onClick={() => window.location.assign(DEMO_URL)} className="w-full sm:w-auto !px-8 !py-4 text-base">
                  Naar VloerGroep
                </Button>
                <Button variant="secondary" onClick={() => window.location.reload()} className="w-full sm:w-auto !px-8 !py-4 text-base">
                  Nieuwe scan starten
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
