import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck2, Check, Mail, Phone, ShieldCheck } from 'lucide-react';

import { Button } from '../components/Button';
import {
  CalculationResults,
  LeadCaptureFormData,
  LeadSubmissionPayload,
  LeadSubmissionResponse,
  QuizState,
} from '../types';
import { buildLeadProfile } from '../lib/leadProfile';

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
      intent: 'demo',
    } as LeadCaptureFormData;
  } catch {
    return defaults;
  }
}

async function parseLeadSubmissionResponse(response: Response): Promise<LeadSubmissionResponse> {
  const rawBody = await response.text();

  if (!rawBody) {
    throw new Error('De server gaf geen geldig antwoord terug. Probeer het zo nog eens.');
  }

  try {
    return JSON.parse(rawBody) as LeadSubmissionResponse;
  } catch {
    const plainMessage =
      rawBody.startsWith('A server error') || rawBody.startsWith('<!DOCTYPE') || rawBody.startsWith('<html')
        ? 'De serverfunctie gaf geen JSON terug. Controleer de Vercel-functie en de mail-omgeving.'
        : `Onverwacht serverantwoord: ${rawBody.slice(0, 180)}`;

    throw new Error(plainMessage);
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

      if (nextName === current.name && nextCompany === current.company && current.intent === 'demo') {
        return current;
      }

      return {
        ...current,
        name: nextName,
        company: nextCompany,
        intent: 'demo',
      };
    });
  }, [state.companyName, state.firstName]);

  useEffect(() => {
    if (submitted) {
      return;
    }

    window.localStorage.setItem(
      CAPTURE_STORAGE_KEY,
      JSON.stringify({
        ...formData,
        intent: 'demo',
      }),
    );
  }, [formData, submitted]);

  const profile = buildLeadProfile(state, results, 'demo');

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
    } else if (
      !/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(formData.phone) ||
      formData.phone.trim().length < 8
    ) {
      nextErrors.phone = 'Vul een geldig telefoonnummer in';
    }

    if (!formData.consent) {
      nextErrors.consent = 'Geef toestemming zodat we je aanvraag mogen opvolgen';
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const focusField = (fieldName: keyof FormErrors) => {
    const selector = fieldName === 'consent' ? '#capture-consent' : `input[name="${fieldName}"]`;
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
      intent: 'demo',
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
      contact: {
        ...formData,
        intent: 'demo',
      },
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
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await parseLeadSubmissionResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'De aanvraag kon niet worden verstuurd.');
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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-8">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="capture-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            className="w-full"
          >
            <div className="mb-8 text-center lg:text-left">
              <span className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold">
                Laatste stap
              </span>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                Plan je VloerGroep demo
              </h2>
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/78 lg:mx-0">
                Laat je gegevens achter. Je ontvangt je scan automatisch per mail en ons team krijgt direct jouw ingevulde info binnen om een demo voor te bereiden die echt aansluit op je situatie.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-xl">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">Direct geregeld</div>
                <div className="text-sm text-white/78 leading-6">Je bevestiging en scan worden automatisch klaargezet.</div>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-xl">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">Intern compleet</div>
                <div className="text-sm text-white/78 leading-6">VloerGroep ontvangt meteen je leadprofiel met alle antwoorden.</div>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur-xl">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">Demo op maat</div>
                <div className="text-sm text-white/78 leading-6">De opvolging kan direct focussen op {profile.primaryAngle.toLowerCase()}.</div>
              </div>
            </div>

            <form
              id="capture-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-6 rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-6 shadow-lg backdrop-blur-md md:p-8"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block pl-1 text-sm font-medium text-white/90" htmlFor="capture-name">
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
                    className={`w-full rounded-2xl border-2 bg-[#0f1b1b] px-5 py-4 text-[16px] text-white placeholder-white/35 shadow-inner transition-all focus:outline-none md:text-[18px] ${
                      errors.name
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-white/14 focus:border-amber-gold/55 focus:ring-4 focus:ring-amber-gold/10'
                    }`}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'capture-name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="capture-name-error" className="mt-1.5 pl-1 text-xs text-red-300">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block pl-1 text-sm font-medium text-white/90" htmlFor="capture-company">
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
                    className={`w-full rounded-2xl border-2 bg-[#0f1b1b] px-5 py-4 text-[16px] text-white placeholder-white/35 shadow-inner transition-all focus:outline-none md:text-[18px] ${
                      errors.company
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-white/14 focus:border-amber-gold/55 focus:ring-4 focus:ring-amber-gold/10'
                    }`}
                    aria-invalid={Boolean(errors.company)}
                    aria-describedby={errors.company ? 'capture-company-error' : undefined}
                  />
                  {errors.company && (
                    <p id="capture-company-error" className="mt-1.5 pl-1 text-xs text-red-300">
                      {errors.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block pl-1 text-sm font-medium text-white/90" htmlFor="capture-email">
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
                      className={`w-full rounded-2xl border-2 bg-[#0f1b1b] py-4 pl-12 pr-5 text-[16px] text-white placeholder-white/35 shadow-inner transition-all focus:outline-none md:text-[18px] ${
                        errors.email
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-white/14 focus:border-amber-gold/55 focus:ring-4 focus:ring-amber-gold/10'
                      }`}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'capture-email-error' : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="capture-email-error" className="mt-1.5 pl-1 text-xs text-red-300">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block pl-1 text-sm font-medium text-white/90" htmlFor="capture-phone">
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
                      className={`w-full rounded-2xl border-2 bg-[#0f1b1b] py-4 pl-12 pr-5 text-[16px] text-white placeholder-white/35 shadow-inner transition-all focus:outline-none md:text-[18px] ${
                        errors.phone
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-white/14 focus:border-amber-gold/55 focus:ring-4 focus:ring-amber-gold/10'
                      }`}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'capture-phone-error' : undefined}
                    />
                  </div>
                  {errors.phone && (
                    <p id="capture-phone-error" className="mt-1.5 pl-1 text-xs text-red-300">
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

              <div className="rounded-2xl border border-white/8 bg-[#0f1b1b]/88 p-4">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                  Ingeplande vervolgstap
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-2xl bg-amber-gold/12 p-2 text-amber-gold">
                    <CalendarCheck2 size={18} />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">VloerGroep demo voorbereiden</div>
                    <p className="mt-1 text-sm leading-6 text-white/68">
                      We zetten deze aanvraag direct klaar als demo-aanvraag. Je scan wordt wel automatisch meegestuurd, maar de opvolging is gericht op een concrete demo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#0f1b1b]/85 p-4">
                <label className="flex cursor-pointer items-start gap-3" htmlFor="capture-consent">
                  <input
                    id="capture-consent"
                    name="consent"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-amber-gold focus:ring-amber-gold"
                  />
                  <span className="text-sm leading-6 text-white/72">
                    Ik geef toestemming dat VloerGroep contact met mij opneemt over mijn scan en het inplannen van een passende demo.
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-2 pl-7 text-xs text-red-300">{errors.consent}</p>
                )}
              </div>

              <AnimatePresence>
                {serverMessage && !submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="rounded-2xl border border-amber-gold/20 bg-amber-gold/10 p-4 text-sm text-amber-gold"
                  >
                    {serverMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-white/55">
                  <ShieldCheck size={16} className="shrink-0 text-amber-gold" />
                  Klaar voor server-side validatie en mailverzending.
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full !px-8 !py-4 text-base shadow-xl shadow-amber-gold/20 sm:w-auto">
                  {isSubmitting ? 'Bezig met versturen...' : 'Plan mijn demo'}
                </Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="capture-success"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <div className="rounded-[30px] border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-6 shadow-lg backdrop-blur-md md:p-10">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-gold/12 text-amber-gold">
                  <Check size={40} strokeWidth={2.5} />
                </div>
                <span className="mb-4 inline-flex rounded-full border border-amber-gold/18 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                  Aanvraag ontvangen
                </span>
                <h3 className="mb-4 text-3xl font-bold md:text-5xl">We gaan je demo voorbereiden</h3>
                <p className="max-w-2xl text-lg leading-relaxed text-white/72">
                  Je bevestiging is onderweg en VloerGroep heeft je leadprofiel direct ontvangen. De opvolging kan daardoor meteen focussen op {profile.primaryAngle.toLowerCase()}.
                </p>
              </div>

              {deliveryMode === 'preview' && (
                <div className="mb-8 rounded-2xl border border-amber-gold/18 bg-amber-gold/10 p-4 text-sm text-amber-gold">
                  {serverMessage || 'Previewmodus: de flow werkt, maar zodra `RESEND_API_KEY` live staat in Vercel worden mails ook echt verzonden.'}
                </div>
              )}

              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/8 bg-[#0f1b1b]/82 p-5">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">1. Bevestiging</div>
                  <p className="text-sm leading-6 text-white/72">De gebruiker ontvangt automatisch een nette bevestiging met scanoverzicht.</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-[#0f1b1b]/82 p-5">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">2. Interne lead</div>
                  <p className="text-sm leading-6 text-white/72">info@vloergroep.nl krijgt direct de lead binnen met profiel, kansen en opvolging.</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-[#0f1b1b]/82 p-5">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">3. Demo</div>
                  <p className="text-sm leading-6 text-white/72">De vervolgactie is gericht op het inplannen van een VloerGroep demo.</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-amber-gold/14 bg-amber-gold/6 p-5 text-left">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">Focus voor deze demo</div>
                <div className="mb-2 text-xl font-semibold text-white">{profile.primaryAngle}</div>
                <p className="text-sm leading-6 text-white/70">{profile.primaryMessage}</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <Button onClick={() => window.location.assign(DEMO_URL)} className="w-full !px-8 !py-4 text-base sm:w-auto">
                  Naar VloerGroep
                </Button>
                <Button variant="secondary" onClick={() => window.location.reload()} className="w-full !px-8 !py-4 text-base sm:w-auto">
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
