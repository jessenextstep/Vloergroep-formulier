import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  User,
} from 'lucide-react';

import { Button } from './components/Button';
import { ScreenHeroImage } from './components/ScreenHeroImage';
import { TextField } from './components/TextField';
import { cn } from './lib/utils';
import agendaConfirmationHero from './Afbeeldingen/Agenda bevestiging.png';
import joostPhoto from './Afbeeldingen/Joost Slot Vloergroep.jpeg';
import type {
  DemoPreferenceTime,
  DemoRequestFormData,
  DemoRequestSubmissionResponse,
} from './types';

type FormErrors = Partial<Record<keyof DemoRequestFormData, string>>;
type LockedFields = {
  name: boolean;
  company: boolean;
  email: boolean;
  phone: boolean;
};

const DEMO_URL = 'https://vloergroep.nl';

function getNextBusinessDays() {
  const dates: string[] = [];
  const cursor = new Date();

  while (dates.length < 2) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day === 0 || day === 6) {
      continue;
    }

    dates.push(cursor.toISOString().slice(0, 10));
  }

  return dates;
}

function readInitialFormData(): DemoRequestFormData {
  const [primaryDate, secondaryDate] = getNextBusinessDays();
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  return {
    name: params.get('name')?.trim() ?? '',
    company: params.get('company')?.trim() ?? '',
    email: params.get('email')?.trim() ?? '',
    phone: params.get('phone')?.trim() ?? '',
    preferredDatePrimary: primaryDate,
    preferredDateSecondary: secondaryDate,
    preferredTime: 'morning',
    notes: '',
    consent: true,
    website: '',
  };
}

function readLockedFields(): LockedFields {
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  return {
    name: Boolean(params.get('name')?.trim()),
    company: Boolean(params.get('company')?.trim()),
    email: Boolean(params.get('email')?.trim()),
    phone: Boolean(params.get('phone')?.trim()),
  };
}

function parseDemoRequestResponse(response: Response, rawText: string): DemoRequestSubmissionResponse {
  if (!rawText) {
    if (response.ok) {
      return {
        ok: true,
        deliveryMode: 'preview',
      };
    }

    throw new Error('De server gaf geen reactie terug. Controleer de demo-API.');
  }

  try {
    return JSON.parse(rawText) as DemoRequestSubmissionResponse;
  } catch {
    if (!response.ok) {
      throw new Error(rawText.slice(0, 200));
    }

    return {
      ok: true,
      deliveryMode: 'preview',
      message: rawText.slice(0, 200),
    };
  }
}

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMomentLabel(value: DemoPreferenceTime) {
  switch (value) {
    case 'morning':
      return 'Ochtend';
    case 'afternoon':
      return 'Middag';
    case 'late-afternoon':
      return 'Einde middag';
  }
}

export default function DemoRequestPage() {
  const requestSource = React.useRef<'scan-email' | 'direct'>(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('email')
      ? 'scan-email'
      : 'direct',
  );
  const [formData, setFormData] = React.useState<DemoRequestFormData>(() => readInitialFormData());
  const lockedFields = React.useRef<LockedFields>(readLockedFields());
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverMessage, setServerMessage] = React.useState('');
  const [deliveryMode, setDeliveryMode] = React.useState<'live' | 'preview'>('live');
  const [submittedRequest, setSubmittedRequest] = React.useState<DemoRequestFormData | null>(null);

  const companyName = formData.company.trim();
  const firstName = formData.name.trim().split(/\s+/)[0] || '';
  const visibleContactFields = {
    name: !lockedFields.current.name,
    company: !lockedFields.current.company,
    email: !lockedFields.current.email,
    phone: !lockedFields.current.phone,
  };
  const hasLockedCompanyDetails =
    lockedFields.current.name || lockedFields.current.company || lockedFields.current.email || lockedFields.current.phone;
  const heading = companyName
    ? `Plan een persoonlijke demo voor ${companyName}`
    : 'Plan een persoonlijke demo met VloerGroep';
  const intro = companyName
    ? `Geef je gegevens en twee voorkeursmomenten door. Joost stemt daarna het definitieve moment persoonlijk af met ${companyName}.`
    : 'Geef je gegevens en twee voorkeursmomenten door. Joost stemt daarna het definitieve moment persoonlijk met je af.';

  const validate = React.useCallback(() => {
    const nextErrors: FormErrors = {};
    const today = getTodayIsoDate();

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

    if (!formData.preferredDatePrimary) {
      nextErrors.preferredDatePrimary = 'Kies een eerste voorkeursdatum';
    } else if (formData.preferredDatePrimary < today) {
      nextErrors.preferredDatePrimary = 'Kies een datum vanaf vandaag';
    }

    if (formData.preferredDateSecondary && formData.preferredDateSecondary < today) {
      nextErrors.preferredDateSecondary = 'Kies een datum vanaf vandaag';
    }

    if (
      formData.preferredDateSecondary &&
      formData.preferredDateSecondary === formData.preferredDatePrimary
    ) {
      nextErrors.preferredDateSecondary = 'Kies een andere tweede voorkeursdatum';
    }

    setErrors(nextErrors);
    return nextErrors;
  }, [formData]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' && 'checked' in event.target ? event.target.checked : false;

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

  const submitRequest = async () => {
    const response = await fetch('/api/demo-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request: formData,
        meta: {
          source: requestSource.current,
          submittedAt: Date.now(),
          pathname: window.location.pathname,
          userAgent: navigator.userAgent,
        },
      }),
    });

    const rawText = await response.text();
    const data = parseDemoRequestResponse(response, rawText);

    if (!response.ok || !data.ok) {
      throw new Error(data.message || 'We konden je voorkeursmoment nog niet ontvangen.');
    }

    setDeliveryMode(data.deliveryMode);
    setServerMessage(data.message || '');
    setSubmittedRequest(formData);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setServerMessage('');

    try {
      await submitRequest();
    } catch (error) {
      setServerMessage(
        error instanceof Error ? error.message : 'Er ging iets mis. Probeer het zo nog eens.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {!submittedRequest ? (
            <motion.div
              key="demo-request-form"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-8"
            >
              <ScreenHeroImage
                src={agendaConfirmationHero}
                alt="Persoonlijke demo met VloerGroep"
                className="mx-auto max-w-4xl"
              />

              <div className="mx-auto max-w-4xl rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(31,31,31,0.62),rgba(14,14,14,0.32))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl md:p-8">
                <div className="mx-auto max-w-3xl text-center">
                  <span className="mb-4 inline-flex rounded-full border border-amber-gold/20 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold">
                    Persoonlijke demo
                  </span>
                  <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                    {heading}
                  </h1>
                  <p className="mt-4 text-base leading-relaxed text-white/74 md:text-lg">
                    {intro}
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 rounded-[26px] border border-white/8 bg-white/[0.04] px-4 py-4 text-left md:px-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={joostPhoto}
                      alt="Joost van VloerGroep"
                      className="h-14 w-14 rounded-full border border-white/12 object-cover shadow-[0_16px_30px_rgba(0,0,0,0.3)]"
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">Joost Slot · VloerGroep</div>
                      <p className="text-sm leading-6 text-white/62">Hij stemt het moment daarna persoonlijk met je af.</p>
                    </div>
                  </div>
                  <span className="hidden h-8 w-px bg-white/8 md:block" />
                  <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/68">
                    <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">Ongeveer 20 minuten</span>
                    <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">
                      {companyName ? `Toegepast op ${companyName}` : 'Toegepast op jullie bedrijf'}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="mx-auto mt-7 max-w-3xl space-y-6">
                  {hasLockedCompanyDetails ? (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                        Bedrijfsgegevens
                      </div>
                      <div className="grid gap-3 text-sm leading-6 text-white/72 md:grid-cols-2">
                        {lockedFields.current.name ? (
                          <div>
                            <div className="text-white/42">Naam</div>
                            <div className="text-white">{formData.name}</div>
                          </div>
                        ) : null}
                        {lockedFields.current.company ? (
                          <div>
                            <div className="text-white/42">Bedrijfsnaam</div>
                            <div className="text-white">{formData.company}</div>
                          </div>
                        ) : null}
                        {lockedFields.current.email ? (
                          <div>
                            <div className="text-white/42">E-mailadres</div>
                            <div className="text-white">{formData.email}</div>
                          </div>
                        ) : null}
                        {lockedFields.current.phone ? (
                          <div>
                            <div className="text-white/42">Telefoonnummer</div>
                            <div className="text-white">{formData.phone}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {visibleContactFields.name || visibleContactFields.company ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {visibleContactFields.name ? (
                        <TextField
                          name="name"
                          label="Naam"
                          icon={User}
                          value={formData.name}
                          onChange={handleInputChange}
                          autoComplete="name"
                          placeholder="Bijv. Mark Jansen"
                          error={errors.name}
                        />
                      ) : null}
                      {visibleContactFields.company ? (
                        <TextField
                          name="company"
                          label="Bedrijfsnaam"
                          icon={Building2}
                          value={formData.company}
                          onChange={handleInputChange}
                          autoComplete="organization"
                          placeholder="Bijv. Jansen Vloeren"
                          error={errors.company}
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {visibleContactFields.email || visibleContactFields.phone ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {visibleContactFields.email ? (
                        <TextField
                          name="email"
                          label="E-mailadres"
                          icon={Mail}
                          value={formData.email}
                          onChange={handleInputChange}
                          autoComplete="email"
                          inputMode="email"
                          placeholder="naam@bedrijf.nl"
                          error={errors.email}
                        />
                      ) : null}
                      {visibleContactFields.phone ? (
                        <TextField
                          name="phone"
                          label="Telefoonnummer"
                          icon={Phone}
                          value={formData.phone}
                          onChange={handleInputChange}
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="06 12 34 56 78"
                          error={errors.phone}
                        />
                      ) : null}
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField
                      name="preferredDatePrimary"
                      label="Eerste voorkeursdatum"
                      icon={CalendarDays}
                      type="date"
                      value={formData.preferredDatePrimary}
                      onChange={handleInputChange}
                      min={getTodayIsoDate()}
                      error={errors.preferredDatePrimary}
                    />
                    <TextField
                      name="preferredDateSecondary"
                      label="Tweede voorkeursdatum"
                      labelHint="Optioneel"
                      icon={CalendarDays}
                      type="date"
                      value={formData.preferredDateSecondary}
                      onChange={handleInputChange}
                      min={getTodayIsoDate()}
                      error={errors.preferredDateSecondary}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 pl-1 text-[13px] font-semibold tracking-[0.01em] text-white/92">
                      <Clock3 size={16} className="text-white/55" />
                      <span>Best passend moment</span>
                    </label>
                    <div className="grid gap-3 md:grid-cols-3">
                      {([
                        ['morning', 'Ochtend'],
                        ['afternoon', 'Middag'],
                        ['late-afternoon', 'Einde middag'],
                      ] as Array<[DemoPreferenceTime, string]>).map(([value, label]) => {
                        const active = formData.preferredTime === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFormData((current) => ({ ...current, preferredTime: value }))}
                            className={cn(
                              'rounded-[22px] border px-4 py-4 text-left transition-all duration-200',
                              active
                                ? 'border-amber-gold/42 bg-amber-gold/12 text-white shadow-[0_0_0_4px_rgba(224,172,62,0.05)]'
                                : 'border-white/10 bg-white/5 text-white/72 hover:border-white/16 hover:bg-white/[0.06]',
                            )}
                          >
                            <div className="text-base font-semibold">{label}</div>
                          </button>
                        );
                      })}
                    </div>
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

                  {serverMessage && !submittedRequest ? (
                    <p className="rounded-[18px] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                      {serverMessage}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-3 pt-2">
                    <Button type="submit" disabled={isSubmitting} fullWidth className="!justify-center !py-4 text-[16px]">
                      {isSubmitting ? 'Moment wordt verstuurd...' : 'Plan mijn demo'}
                      {!isSubmitting ? <ArrowRight size={18} className="ml-2" /> : null}
                    </Button>
                    <p className="text-center text-sm leading-6 text-white/52">
                      Joost bevestigt het definitieve moment daarna persoonlijk met je.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="demo-request-success"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mx-auto max-w-4xl"
            >
              <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(27,27,27,0.72),rgba(12,12,12,0.34))] p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl md:p-8">
                <ScreenHeroImage
                  src={agendaConfirmationHero}
                  alt="Je demoverzoek is ontvangen"
                  className="mb-8"
                />

                <span className="mb-4 inline-flex rounded-full border border-amber-gold/18 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                  Voorkeur ontvangen
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                  {firstName ? `${firstName}, bedankt` : 'Bedankt'}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/78 md:text-lg">
                  Joost neemt contact met je op om samen een definitief moment voor jullie demo te bevestigen.
                </p>

                <div className="mx-auto mt-8 max-w-2xl rounded-[24px] border border-white/10 bg-white/5 p-5 text-left">
                  <div className="mb-4 flex items-center gap-3 text-white">
                    <CheckCircle2 size={18} className="text-amber-gold" />
                    <span className="font-semibold">Ontvangen voor {submittedRequest.company}</span>
                  </div>
                  <div className="grid gap-3 text-sm leading-6 text-white/72 md:grid-cols-2">
                    <div>
                      <span className="text-white/48">Eerste voorkeur</span>
                      <div className="text-white">{submittedRequest.preferredDatePrimary}</div>
                    </div>
                    <div>
                      <span className="text-white/48">Moment</span>
                      <div className="text-white">{getMomentLabel(submittedRequest.preferredTime)}</div>
                    </div>
                    {submittedRequest.preferredDateSecondary ? (
                      <div>
                        <span className="text-white/48">Tweede voorkeur</span>
                        <div className="text-white">{submittedRequest.preferredDateSecondary}</div>
                      </div>
                    ) : null}
                    <div>
                      <span className="text-white/48">Contact</span>
                      <div className="text-white">{submittedRequest.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 text-left md:grid-cols-3">
                  {[
                    'Joost kijkt eerst even wat logisch past in zijn agenda',
                    'Daarna stemt hij het moment persoonlijk met je af',
                    'In de demo laat hij rustig zien hoe jullie kunnen starten',
                  ].map((item) => (
                    <div key={item} className="rounded-[22px] border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-white/72">
                      {item}
                    </div>
                  ))}
                </div>

                {serverMessage ? (
                  <p className="mt-6 rounded-[18px] border border-amber-gold/22 bg-amber-gold/10 px-4 py-3 text-sm leading-6 text-amber-gold">
                    {serverMessage}
                    {deliveryMode === 'preview'
                      ? ' De bevestigingsmail staat mogelijk nog niet aan, maar je verzoek is wel goed ontvangen.'
                      : ''}
                  </p>
                ) : null}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                  <Button onClick={() => window.location.assign(DEMO_URL)} className="w-full !px-8 !py-4 text-base sm:w-auto">
                    Naar VloerGroep
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSubmittedRequest(null);
                      setServerMessage('');
                    }}
                    className="w-full !px-8 !py-4 text-base sm:w-auto"
                  >
                    Voorkeur aanpassen
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
