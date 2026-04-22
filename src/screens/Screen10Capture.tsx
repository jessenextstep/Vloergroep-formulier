import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Phone, User } from 'lucide-react';

import { Button } from '../components/Button';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { TextField } from '../components/TextField';
import { heroScreenThanks } from '../lib/brandAssets';
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
const QUIZ_PROGRESS_STORAGE_KEY = 'vloergroep-groeiscan-progress/v1';
const FORM_STORAGE_WRITE_DELAY_MS = 220;
const SUBMIT_TIMEOUT_MS = 15000;
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
  const formStatusId = useId();
  const submitAbortRef = useRef<AbortController | null>(null);
  const submitTimeoutRef = useRef<number | null>(null);
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

    const persistTimer = window.setTimeout(() => {
      window.localStorage.setItem(
        CAPTURE_STORAGE_KEY,
        JSON.stringify({
          ...formData,
          intent: 'demo',
        }),
      );
    }, FORM_STORAGE_WRITE_DELAY_MS);

    return () => window.clearTimeout(persistTimer);
  }, [formData, submitted]);

  useEffect(() => {
    return () => {
      submitAbortRef.current?.abort();
      if (submitTimeoutRef.current !== null) {
        window.clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const profile = buildLeadProfile(state, results, 'demo');
  const firstName = (state.firstName || formData.name.split(/\s+/)[0] || '').trim();
  const companyName = (formData.company || state.companyName || '').trim();
  const growthFocus = profile.primaryAngle.toLowerCase();
  const companyReference = companyName ? companyName : 'jouw bedrijf';
  const heading =
    firstName.length > 0
      ? `${firstName}, laat je gegevens achter voor je gratis persoonlijke VloerGroep demo`
      : 'Laat je gegevens achter voor je gratis persoonlijke VloerGroep demo';
  const introText = companyName
    ? `We gebruiken je scan voor een gratis persoonlijke demo voor ${companyName}. Daarin laten we zien waar volgens jouw antwoorden de meeste winst zit in ${growthFocus} en hoe we ${companyName} nog verder kunnen laten groeien.`
    : `We gebruiken je scan voor een gratis persoonlijke demo. Daarin laten we zien waar volgens jouw antwoorden de meeste winst zit in ${growthFocus} en hoe we jouw bedrijf nog verder kunnen laten groeien.`;
  const successHeading = firstName ? `Dankjewel, ${firstName}` : 'Dankjewel';
  const successIntro = 'Je aanvraag voor een gratis persoonlijke VloerGroep demo is goed ontvangen.';
  const successBody = companyName
    ? `We gaan nu iets moois voorbereiden voor ${companyName}: een demo waarin we samen ontdekken hoe VloerGroep het meeste voordeel kan opleveren in ${growthFocus} en waar de grootste groeikans ligt.`
    : `We gaan nu een persoonlijke demo voor je voorbereiden waarin we samen ontdekken hoe VloerGroep het meeste voordeel kan opleveren in ${growthFocus} en waar de grootste groeikans ligt.`;
  const successNote =
    deliveryMode === 'preview'
      ? 'Je aanvraag staat goed in ons systeem. Ook als je bevestigingsmail niet direct binnenkomt, nemen we je aanvraag gewoon mee in de opvolging.'
      : '';

  const validate = useCallback(() => {
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
  }, [formData]);

  const focusField = useCallback((fieldName: keyof FormErrors) => {
    const selector = fieldName === 'consent' ? '#capture-consent' : `input[name="${fieldName}"]`;
    const field = document.querySelector(selector) as HTMLElement | null;

    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => field.focus({ preventScroll: true }), 120);
    }
  }, []);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [errors, serverMessage]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const validationErrors = validate();
    const errorFields = Object.keys(validationErrors) as Array<keyof FormErrors>;

    if (errorFields.length > 0) {
      focusField(errorFields[0]);
      return;
    }

    setIsSubmitting(true);
    setServerMessage('');
    submitAbortRef.current?.abort();

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
      const abortController = new AbortController();
      submitAbortRef.current = abortController;
      submitTimeoutRef.current = window.setTimeout(() => abortController.abort(), SUBMIT_TIMEOUT_MS);

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
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
      window.localStorage.removeItem(QUIZ_PROGRESS_STORAGE_KEY);
    } catch (error) {
      setServerMessage(
        error instanceof DOMException && error.name === 'AbortError'
          ? navigator.onLine
            ? 'De server reageert te traag. Probeer het opnieuw.'
            : 'Je lijkt offline. Controleer je verbinding en probeer het opnieuw.'
          : error instanceof Error
            ? error.message
            : 'De aanvraag kon niet worden verstuurd. Probeer het zo nog eens.',
      );
    } finally {
      if (submitTimeoutRef.current !== null) {
        window.clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
      submitAbortRef.current = null;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center pt-6 md:pb-8 md:pt-5">
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
                {heading}
              </h2>
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/78 lg:mx-0">
                {introText}
              </p>
            </div>

            <form
              id="capture-form"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isSubmitting}
              aria-describedby={serverMessage && !submitted ? formStatusId : undefined}
              className="space-y-6 rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(58,58,58,0.46),rgba(45,45,45,0.24))] p-6 shadow-lg backdrop-blur-md md:p-8"
            >
              <fieldset disabled={isSubmitting} className="space-y-6 disabled:opacity-100">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  id="capture-name"
                  name="name"
                  label="Naam"
                  icon={User}
                  value={formData.name}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Bijv. Mark Jansen"
                  maxLength={80}
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  required
                  error={errors.name}
                />
                <TextField
                  id="capture-company"
                  name="company"
                  label="Bedrijfsnaam"
                  icon={Building2}
                  value={formData.company}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Bijv. Vloerenbedrijf Jansen"
                  maxLength={120}
                  autoComplete="organization"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  required
                  error={errors.company}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  id="capture-email"
                  name="email"
                  label="E-mailadres"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email"
                  placeholder="naam@bedrijf.nl"
                  maxLength={160}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  inputMode="email"
                  enterKeyHint="next"
                  required
                  error={errors.email}
                />
                <TextField
                  id="capture-phone"
                  name="phone"
                  label="Telefoonnummer"
                  icon={Phone}
                  value={formData.phone}
                  onChange={handleInputChange}
                  type="tel"
                  placeholder="Bijv. 06 12 34 56 78"
                  maxLength={40}
                  autoComplete="tel"
                  inputMode="tel"
                  enterKeyHint="done"
                  required
                  error={errors.phone}
                />
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

              <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(58,58,58,0.52),rgba(45,45,45,0.28))] p-4 shadow-[0_18px_36px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <label className="flex cursor-pointer items-start gap-3" htmlFor="capture-consent">
                  <input
                    id="capture-consent"
                    name="consent"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    required
                    className="mt-0.5 h-5 w-5 rounded-md border-white/35 bg-transparent text-amber-gold shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus:ring-2 focus:ring-amber-gold/70 focus:ring-offset-2 focus:ring-offset-[#0d1717]"
                  />
                  <span className="text-sm leading-6 text-white/80">
                    Ik geef toestemming dat VloerGroep contact met mij opneemt over mijn scan en een gratis persoonlijke demo voor {companyReference}.
                  </span>
                </label>
                {errors.consent && (
                  <p role="alert" className="mt-2 pl-7 text-xs text-red-300">{errors.consent}</p>
                )}
              </div>

              <AnimatePresence>
                {serverMessage && !submitted && (
                  <motion.div
                    id={formStatusId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    role="alert"
                    aria-live="assertive"
                    className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
                  >
                    {serverMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full !px-8 !py-4 text-base shadow-xl shadow-amber-gold/20 sm:w-auto">
                  {isSubmitting ? 'Bezig met versturen...' : 'Vraag mijn gratis demo aan'}
                </Button>
              </div>
              </fieldset>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="capture-success"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            role="status"
            aria-live="polite"
            className="w-full"
          >
            <div className="rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(58,58,58,0.46),rgba(45,45,45,0.24))] p-6 shadow-lg backdrop-blur-md md:p-10">
              <ScreenHeroImage
                src={heroScreenThanks}
                alt="VloerGroep bedanktscherm"
                className="mb-8"
              />

              <div className="mb-8 flex flex-col items-center text-center">
                <span className="mb-4 inline-flex rounded-full border border-amber-gold/18 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                  Tot snel
                </span>
                <h3 className="mb-4 text-3xl font-bold font-display tracking-tight text-white md:text-5xl">
                  {successHeading}
                </h3>
                <p className="mb-3 max-w-2xl text-lg leading-relaxed text-white">
                  {successIntro}
                </p>
                <p className="max-w-2xl text-base leading-7 text-white/70">
                  {successBody}
                </p>
              </div>

              <div className="mb-8 rounded-[24px] border border-amber-gold/14 bg-amber-gold/6 p-5 text-center md:p-6">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                  In jouw demo
                </div>
                <p className="text-base leading-7 text-white/82">
                  We zoomen als eerste in op <strong className="text-white">{growthFocus}</strong> en laten zien hoe VloerGroep dit concreet voor <strong className="text-white">{companyReference}</strong> kan versnellen.
                </p>
              </div>

              {successNote ? (
                <div className="mb-8 rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(58,58,58,0.42),rgba(45,45,45,0.22))] p-4 text-center text-sm leading-6 text-white/62">
                  {successNote}
                </div>
              ) : null}

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
