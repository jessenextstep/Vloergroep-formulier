import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Mail, Phone, ShieldCheck, User } from 'lucide-react';

import { Button } from '../components/Button';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { TextField } from '../components/TextField';
import { heroScreenThanks } from '../lib/brandAssets';
import { buildLeadProfile } from '../lib/leadProfile';
import {
  CalculationResults,
  LeadCaptureFormData,
  LeadSubmissionPayload,
  LeadSubmissionResponse,
  QuizState,
} from '../types';

interface Props {
  state: QuizState;
  results: CalculationResults;
  sessionStartedAt: number;
}

type FormErrors = Partial<Record<'name' | 'company' | 'email' | 'phone' | 'consent', string>>;

const CAPTURE_STORAGE_KEY = 'vloergroep-ads-scan-contact/v1';
const QUIZ_STORAGE_KEY = 'vloergroep-ads-scan-state/v1';
const QUIZ_PROGRESS_STORAGE_KEY = 'vloergroep-ads-scan-progress/v1';
const FORM_STORAGE_WRITE_DELAY_MS = 220;
const SUBMIT_TIMEOUT_MS = 15000;

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
      intent: 'scan',
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
    throw new Error('De server gaf geen JSON terug. Controleer de lead-API.');
  }
}

export default function Screen10AdsCapture({ state, results, sessionStartedAt }: Props) {
  const formStatusId = useId();
  const submitAbortRef = useRef<AbortController | null>(null);
  const submitTimeoutRef = useRef<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'live' | 'preview' | null>(null);
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [formData, setFormData] = useState<LeadCaptureFormData>(() =>
    readStoredFormData({
      name: state.firstName || '',
      company: state.companyName || '',
      email: '',
      phone: '',
      intent: 'scan',
      consent: true,
      website: '',
    }),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setFormData((current) => {
      const nextName = current.name || state.firstName || '';
      const nextCompany = current.company || state.companyName || '';

      if (nextName === current.name && nextCompany === current.company && current.intent === 'scan') {
        return current;
      }

      return {
        ...current,
        name: nextName,
        company: nextCompany,
        intent: 'scan',
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
          intent: 'scan',
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

  const profile = useMemo(() => buildLeadProfile(state, results, 'scan'), [results, state]);
  const firstName = (state.firstName || formData.name.split(/\s+/)[0] || '').trim();
  const companyName = (formData.company || state.companyName || '').trim();
  const companyReference = companyName || 'jouw bedrijf';
  const heading = firstName ? `${firstName}, jouw scan staat klaar` : 'Jouw scan staat klaar';
  const intro = `We hebben je antwoorden verwerkt. Laat hieronder weten waar we de scan voor ${companyReference} mogen bezorgen.`;
  const teaserItems = [
    `Waar voor ${companyReference} nu de snelste winst zit in ${profile.primaryAngle.toLowerCase()}`,
    'Wat tijdswinst, cashflow en groeipotentie concreet betekenen voor je bedrijf',
    'Welke eerste stap het meest logisch is zonder direct alles om te gooien',
  ];

  const validate = useCallback(() => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Voornaam is verplicht';
    }

    if (!formData.company.trim()) {
      nextErrors.company = 'Bedrijfsnaam is verplicht';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Vul een geldig e-mailadres in';
    }

    if (formData.phone.trim() && !/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(formData.phone)) {
      nextErrors.phone = 'Vul een geldig telefoonnummer in';
    }

    if (!formData.consent) {
      nextErrors.consent = 'Geef toestemming zodat we je scan mogen sturen';
    }

    setErrors(nextErrors);
    return nextErrors;
  }, [formData]);

  const focusField = useCallback((fieldName: keyof FormErrors) => {
    const selector = fieldName === 'consent' ? '#ads-capture-consent' : `input[name="${fieldName}"]`;
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
      intent: 'scan',
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
        intent: 'scan',
      },
      quiz: state,
      meta: {
        source: 'ads-scan',
        sessionStartedAt,
        submittedAt: Date.now(),
        pathname: `${window.location.pathname}${window.location.search}`,
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
        throw new Error(data.message || 'De scan kon niet worden verstuurd.');
      }

      setSubmitted(true);
      setDeliveryMode(data.deliveryMode);
      setServerMessage(data.message || '');
      setSubmittedEmail(formData.email.trim());
      window.localStorage.removeItem(CAPTURE_STORAGE_KEY);
      window.localStorage.removeItem(QUIZ_STORAGE_KEY);
      window.localStorage.removeItem(QUIZ_PROGRESS_STORAGE_KEY);
    } catch (error) {
      setServerMessage(
        error instanceof DOMException && error.name === 'AbortError'
          ? navigator.onLine
            ? 'De server reageert te traag. Probeer het opnieuw.'
            : 'Je lijkt offline. Controleer je verbinding en probeer het opnieuw.'
          : error instanceof Error
            ? error.message
            : 'De scan kon niet worden verstuurd. Probeer het zo nog eens.',
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
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center pt-6 md:pb-8 md:pt-5">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="ads-capture-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            className="w-full"
          >
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <div className="mb-7 text-center lg:text-left">
                  <span className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold">
                    Jouw uitslag staat klaar
                  </span>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                    {heading}
                  </h2>
                  <p className="max-w-2xl text-base leading-relaxed text-white/76 md:text-lg">
                    {intro}
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(31,31,31,0.54),rgba(16,16,16,0.34))] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <div className="mb-4 inline-flex rounded-full border border-amber-gold/18 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                    Wat je per mail ontvangt
                  </div>
                  <ul className="space-y-3">
                    {teaserItems.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6 text-white/78 md:text-[15px]">
                        <ShieldCheck size={17} className="mt-1 shrink-0 text-amber-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(29,29,29,0.62),rgba(15,15,15,0.42))] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-6">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-4">
                    <TextField
                      id="ads-capture-name"
                      name="name"
                      label="Voornaam"
                      icon={User}
                      type="text"
                      placeholder="Bijv. Mark"
                      value={formData.name}
                      onChange={handleInputChange}
                      autoComplete="given-name"
                      autoCapitalize="words"
                      enterKeyHint="next"
                      maxLength={80}
                      error={errors.name}
                    />

                    <TextField
                      id="ads-capture-company"
                      name="company"
                      label="Bedrijfsnaam"
                      icon={Building2}
                      type="text"
                      placeholder="Bijv. Jansen Vloeren"
                      value={formData.company}
                      onChange={handleInputChange}
                      autoComplete="organization"
                      autoCapitalize="words"
                      enterKeyHint="next"
                      maxLength={120}
                      error={errors.company}
                    />

                    <TextField
                      id="ads-capture-email"
                      name="email"
                      label="E-mailadres"
                      icon={Mail}
                      type="email"
                      placeholder="naam@bedrijf.nl"
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      enterKeyHint="next"
                      inputMode="email"
                      maxLength={160}
                      error={errors.email}
                    />

                    <TextField
                      id="ads-capture-phone"
                      name="phone"
                      label="Telefoonnummer"
                      labelHint="Optioneel"
                      helperText="Alleen handig als je wilt dat Rico later kort met je meedenkt."
                      icon={Phone}
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={handleInputChange}
                      autoComplete="tel"
                      enterKeyHint="done"
                      inputMode="tel"
                      maxLength={40}
                      error={errors.phone}
                    />

                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />

                    <label
                      htmlFor="ads-capture-consent"
                      className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/72"
                    >
                      <input
                        id="ads-capture-consent"
                        name="consent"
                        type="checkbox"
                        checked={formData.consent}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-amber-gold accent-amber-gold"
                      />
                      <span>
                        Ja, Rico van VloerGroep mag mijn scan mailen en contact opnemen als daar een relevante vervolgstap uit komt.
                      </span>
                    </label>
                    {errors.consent ? (
                      <p className="pl-1 text-[12px] font-medium leading-5 text-red-300">{errors.consent}</p>
                    ) : null}
                  </div>

                  {serverMessage ? (
                    <p
                      id={formStatusId}
                      className={`mt-4 rounded-[18px] border px-4 py-3 text-sm leading-6 ${
                        submitted || deliveryMode === 'preview'
                          ? 'border-amber-gold/22 bg-amber-gold/10 text-amber-gold'
                          : 'border-red-400/30 bg-red-500/10 text-red-200'
                      }`}
                    >
                      {serverMessage}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full !py-4 text-base shadow-lg shadow-amber-gold/25"
                    >
                      {isSubmitting ? 'Je scan wordt verstuurd...' : 'Stuur mijn scan'}
                    </Button>
                    <p className="text-center text-xs leading-5 text-white/46">
                      Direct na verzenden ontvang je je scan in je inbox.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ads-capture-success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto w-full max-w-3xl"
          >
            <ScreenHeroImage
              src={heroScreenThanks}
              alt="Je scan is verstuurd"
              className="mb-8"
            />

            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(31,31,31,0.52),rgba(16,16,16,0.30))] p-6 text-center shadow-[0_28px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl md:p-8">
              <span className="mb-4 inline-flex rounded-full border border-amber-gold/18 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                Scan verstuurd
              </span>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                Je scan is onderweg
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/78 md:text-lg">
                We hebben jouw scan {submittedEmail ? <>verstuurd naar <span className="font-semibold text-white">{submittedEmail}</span></> : 'verstuurd'}. Kijk ook even in je ongewenste mail als je hem niet direct ziet.
              </p>

              <div className="mt-6 grid gap-3 text-left md:grid-cols-3">
                {[
                  'Je grootste winstlek in beeld',
                  'Direct inzicht in tijd, cashflow en groei',
                  'Een rustige vervolgstap als dat relevant is',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-white/72"
                  >
                    {item}
                  </div>
                ))}
              </div>

              {deliveryMode === 'preview' && serverMessage ? (
                <p className="mt-6 rounded-[18px] border border-amber-gold/22 bg-amber-gold/10 px-4 py-3 text-sm leading-6 text-amber-gold">
                  {serverMessage}
                </p>
              ) : null}

              <p className="mt-6 text-sm leading-6 text-white/50">
                Rico van VloerGroep kijkt alleen mee als daar echt een logische vervolgstap uit komt.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
