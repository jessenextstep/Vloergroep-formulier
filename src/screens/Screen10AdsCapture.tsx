import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Building2, Mail, Phone, User } from 'lucide-react';

import { Button } from '../components/Button';
import { ScanSocialProof } from '../components/ScanSocialProof';
import { ScreenHeroImage } from '../components/ScreenHeroImage';
import { TextField } from '../components/TextField';
import { heroScreenThanks } from '../lib/brandAssets';
import {
  LeadCaptureFormData,
  LeadSubmissionPayload,
  LeadSubmissionResponse,
  QuizState,
} from '../types';

interface Props {
  state: QuizState;
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

export default function Screen10AdsCapture({ state, sessionStartedAt }: Props) {
  const formStatusId = useId();
  const formId = useId();
  const submitAbortRef = useRef<AbortController | null>(null);
  const submitTimeoutRef = useRef<number | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const companyInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [submissionStage, setSubmissionStage] = useState<'form' | 'sending' | 'done' | 'error'>('form');
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
    if (submissionStage !== 'form') {
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
  }, [formData, submissionStage]);

  useEffect(() => {
    return () => {
      submitAbortRef.current?.abort();
      if (submitTimeoutRef.current !== null) {
        window.clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (submissionStage !== 'form') {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      if (!formData.name.trim()) {
        nameInputRef.current?.focus();
        return;
      }

      if (!formData.company.trim()) {
        companyInputRef.current?.focus();
        return;
      }

      if (!formData.email.trim()) {
        emailInputRef.current?.focus();
      }
    }, 120);

    return () => window.clearTimeout(focusTimer);
  }, [formData.company, formData.email, formData.name, submissionStage]);

  const firstName = (state.firstName || formData.name.split(/\s+/)[0] || '').trim();
  const heading = firstName ? `${firstName}, je scan staat klaar` : 'Je scan staat klaar';
  const intro = 'Vul hieronder je gegevens in en ontvang jouw persoonlijke bedrijfsscan direct per mail.';

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

  const submitLead = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setServerMessage('');
    submitAbortRef.current?.abort();
    setSubmissionStage('sending');
    setSubmittedEmail(formData.email.trim());

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

      setSubmissionStage('done');
      setDeliveryMode(data.deliveryMode);
      setServerMessage(data.message || '');
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
      setSubmissionStage('error');
    } finally {
      if (submitTimeoutRef.current !== null) {
        window.clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
      submitAbortRef.current = null;
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, sessionStartedAt, state]);

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

    void submitLead();
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center pt-6 md:pt-5">
      <AnimatePresence mode="wait">
        {submissionStage === 'form' ? (
          <motion.div
            key="ads-capture-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            className="w-full"
          >
            <div className="mb-7 text-center md:text-left">
              <span className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold">
                Jouw uitslag staat klaar
              </span>
              <h2 className="mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
                {heading}
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-white/72 md:text-lg">
                {intro}
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(29,29,29,0.62),rgba(15,15,15,0.42))] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-6">
              <form id={formId} onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextField
                    ref={nameInputRef}
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
                    ref={companyInputRef}
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
                </div>

                <div className="mt-4">
                  <TextField
                    ref={emailInputRef}
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
                </div>

                <div className="mt-4">
                  <TextField
                    id="ads-capture-phone"
                    name="phone"
                    label="Telefoonnummer"
                    labelHint="Optioneel"
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
                </div>

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
                  className="mt-4 flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/72"
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
                    Ja, VloerGroep mag mijn scan mailen en contact opnemen als dat relevant is.
                  </span>
                </label>
                {errors.consent ? (
                  <p className="mt-2 pl-1 text-[12px] font-medium leading-5 text-red-300">{errors.consent}</p>
                ) : null}

                {serverMessage ? (
                  <p
                    id={formStatusId}
                    className="mt-4 rounded-[18px] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200"
                  >
                    {serverMessage}
                  </p>
                ) : null}

                <div className="mt-6 hidden md:block">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    fullWidth
                    className="!w-full !justify-center !py-4 text-[16px] shadow-lg shadow-amber-gold/20"
                  >
                    {isSubmitting ? 'Je scan wordt verstuurd...' : 'Ontvang mijn scan'}
                    {!isSubmitting ? <ArrowRight size={18} className="ml-2" /> : null}
                  </Button>
                </div>
              </form>
            </div>

            <ScanSocialProof
              className="mt-6"
              align="center"
              title="{{count}} vakmannen ontvingen al hun persoonlijke bedrijfsscan"
            />

            <div className="h-28 w-full shrink-0 md:hidden" />

            <nav
              aria-label="Gegevens versturen"
              className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#050505]/92 p-3 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-2xl sm:p-4 sm:pb-[max(env(safe-area-inset-bottom),1rem)] md:hidden"
            >
              <div className="mx-auto flex w-full max-w-3xl items-center justify-end gap-4 px-2 sm:px-6">
                <Button
                  type="submit"
                  form={formId}
                  disabled={isSubmitting}
                  className="ml-auto !px-6 !py-3 text-[15px] shadow-lg shadow-amber-gold/20"
                >
                  {isSubmitting ? 'Je scan wordt verstuurd...' : 'Ontvang mijn scan'}
                  {!isSubmitting ? <ArrowRight size={18} className="ml-2" /> : null}
                </Button>
              </div>
            </nav>
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
                {submissionStage === 'sending' ? 'Scan wordt verstuurd' : submissionStage === 'error' ? 'Versturen mislukt' : 'Scan verstuurd'}
              </span>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                {submissionStage === 'sending'
                  ? 'Even geduld, we ronden je scan af'
                  : submissionStage === 'error'
                    ? 'Het versturen ging niet goed'
                    : 'Je scan is onderweg'}
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/78 md:text-lg">
                {submissionStage === 'sending'
                  ? <>We versturen jouw scan nu naar <span className="font-semibold text-white">{submittedEmail}</span>. Dit duurt meestal maar een paar seconden.</>
                  : submissionStage === 'error'
                    ? <>We konden jouw scan nog niet naar <span className="font-semibold text-white">{submittedEmail}</span> sturen. Probeer het hieronder opnieuw of pas je gegevens aan.</>
                    : <>We hebben jouw scan {submittedEmail ? <>verstuurd naar <span className="font-semibold text-white">{submittedEmail}</span></> : 'verstuurd'}. Kijk ook even in je ongewenste mail als je hem niet direct ziet.</>}
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

              {serverMessage ? (
                <p className="mt-6 rounded-[18px] border border-amber-gold/22 bg-amber-gold/10 px-4 py-3 text-sm leading-6 text-amber-gold">
                  {serverMessage}
                </p>
              ) : null}

              {submissionStage === 'error' ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button type="button" onClick={() => void submitLead()} className="sm:min-w-[220px]">
                    Probeer opnieuw
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSubmissionStage('form');
                      setServerMessage('');
                    }}
                    className="sm:min-w-[220px]"
                  >
                    Gegevens aanpassen
                  </Button>
                </div>
              ) : null}

              <p className="mt-6 text-sm leading-6 text-white/50">
                Als je wilt, kijkt VloerGroep daarna graag even met je mee naar de uitkomst.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
