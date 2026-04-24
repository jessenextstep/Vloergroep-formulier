import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  LoaderCircle,
  PhoneCall,
} from 'lucide-react';

import agendaConfirmationHero from './Afbeeldingen/Agenda bevestiging.png';
import joostPhoto from './Afbeeldingen/Joost Slot Vloergroep.jpeg';
import { Button } from './components/Button';
import { ScreenHeroImage } from './components/ScreenHeroImage';
import { TextField } from './components/TextField';
import { cn } from './lib/utils';
import type {
  DemoPreferenceTime,
  DemoScheduleActionResponse,
  DemoScheduleActor,
  DemoScheduleRecord,
  DemoScheduleStateResponse,
} from './types';

type ActionMode = 'accept' | 'propose';

function getQueryToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URLSearchParams(window.location.search).get('t')?.trim() ?? '';
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

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCounterparty(actor: DemoScheduleActor) {
  return actor === 'admin' ? 'klant' : 'Joost';
}

export default function DemoSchedulePage() {
  const tokenRef = React.useRef(getQueryToken());
  const [record, setRecord] = React.useState<DemoScheduleRecord | null>(null);
  const [actor, setActor] = React.useState<DemoScheduleActor | null>(null);
  const [calendarUrl, setCalendarUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [mode, setMode] = React.useState<ActionMode>('accept');
  const [selectedAcceptDate, setSelectedAcceptDate] = React.useState('');
  const [proposalDate, setProposalDate] = React.useState('');
  const [proposalTime, setProposalTime] = React.useState<DemoPreferenceTime>('morning');
  const [phoneConfirmed, setPhoneConfirmed] = React.useState(false);

  const loadState = React.useCallback(async () => {
    if (!tokenRef.current) {
      setErrorMessage('Deze afspraaklink is niet compleet.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/demo-schedule?t=${encodeURIComponent(tokenRef.current)}`);
      const data = (await response.json()) as DemoScheduleStateResponse;

      if (!response.ok || !data.ok || !data.record || !data.actor) {
        throw new Error(data.message || 'We konden dit afspraakdossier niet laden.');
      }

      setActor(data.actor);
      setRecord(data.record);
      setCalendarUrl(data.calendarUrl ?? null);
      setSelectedAcceptDate(data.record.currentProposal.date);
      setProposalDate(data.record.currentProposal.date);
      setProposalTime(data.record.currentProposal.time);
      setPhoneConfirmed(false);
      setMessage('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'We konden dit afspraakdossier niet laden.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadState();
  }, [loadState]);

  const isCurrentTurn = Boolean(actor && record && record.awaitingActor === actor && record.status !== 'confirmed');

  const submitAction = async (action: ActionMode) => {
    if (!record || !actor) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setMessage('');

    try {
      const payload =
        action === 'accept'
          ? {
              token: tokenRef.current,
              action,
              proposalDate: selectedAcceptDate || record.currentProposal.date,
              proposalTime: record.currentProposal.time,
              phoneConfirmed: false,
            }
          : {
              token: tokenRef.current,
              action,
              proposalDate,
              proposalTime,
              phoneConfirmed,
            };

      const response = await fetch('/api/demo-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as DemoScheduleActionResponse;

      if (!response.ok || !data.ok || !data.record || !data.actor) {
        throw new Error(data.message || 'We konden de afspraak nog niet verwerken.');
      }

      setRecord(data.record);
      setActor(data.actor);
      setCalendarUrl(data.calendarUrl ?? null);
      setMessage(data.message || '');
      setMode(data.record.status === 'confirmed' ? 'accept' : 'propose');
      setSelectedAcceptDate(data.record.currentProposal.date);
      setProposalDate(data.record.currentProposal.date);
      setPhoneConfirmed(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'We konden de afspraak nog niet verwerken.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[70vh] items-center justify-center"
            >
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/72">
                <LoaderCircle size={18} className="animate-spin text-amber-gold" />
                Afspraakdossier wordt geladen
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-8"
            >
              <ScreenHeroImage
                src={agendaConfirmationHero}
                alt="Demo-afspraak VloerGroep"
                className="mx-auto max-w-4xl"
              />

              <div className="mx-auto max-w-4xl rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(31,31,31,0.62),rgba(14,14,14,0.32))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl md:p-8">
                {errorMessage ? (
                  <div className="rounded-[24px] border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm leading-7 text-red-200">
                    {errorMessage}
                  </div>
                ) : null}

                {record && actor ? (
                  <>
                    <div className="mx-auto max-w-3xl text-center">
                      <span className="mb-4 inline-flex rounded-full border border-amber-gold/20 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-gold">
                        Afspraakdossier
                      </span>
                      <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                        {record.status === 'confirmed'
                          ? `De demo voor ${record.customer.company} staat vast`
                          : actor === 'admin'
                            ? `Plan het juiste moment voor ${record.customer.company}`
                            : `Bekijk het voorstel voor ${record.customer.company}`}
                      </h1>
                      <p className="mt-4 text-base leading-relaxed text-white/72 md:text-lg">
                        {record.status === 'confirmed'
                          ? 'Dit dossier is afgerond. Hieronder staat het definitieve moment nog één keer compact bij elkaar.'
                          : isCurrentTurn
                            ? actor === 'admin'
                              ? 'Accepteer het huidige verzoek of stuur direct een nieuw moment terug.'
                              : 'Accepteer dit moment of stuur op dezelfde pagina een beter passend voorstel terug.'
                            : `We wachten nu op een reactie van ${getCounterparty(actor)}.`}
                      </p>
                    </div>

                    <div className="mx-auto mt-7 max-w-3xl rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-amber-gold/18 blur-xl" />
                            <img
                              src={joostPhoto}
                              alt="Joost van VloerGroep"
                              className="relative h-16 w-16 rounded-full border border-amber-gold/30 object-cover shadow-[0_16px_30px_rgba(0,0,0,0.34)]"
                            />
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-gold">
                              Afspraak afgestemd door
                            </div>
                            <div className="mt-1 text-lg font-semibold leading-tight text-white">Joost Slot</div>
                            <p className="mt-1 text-sm leading-6 text-white/62">VloerGroep</p>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white sm:text-right">{record.customer.company}</div>
                          <p className="mt-1 text-sm leading-6 text-white/62 sm:text-right">
                            {record.customer.name}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-sm text-white/68">
                          {record.customer.email}
                        </span>
                        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-sm text-white/68">
                          {record.customer.phone}
                        </span>
                        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-sm text-white/68">
                        {record.status === 'confirmed'
                          ? `Bevestigd · ${record.currentProposal.date}`
                          : record.awaitingActor === 'admin'
                            ? 'Wacht op Joost'
                            : 'Wacht op klant'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                          Huidige voorkeur
                        </div>
                        <div className="space-y-3 text-sm leading-7 text-white/72">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-4">
                              <div className="text-white/42">Eerste datum</div>
                              <div className="text-white">{record.currentProposal.date}</div>
                            </div>
                          {record.currentProposal.secondaryDate ? (
                              <div className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-4">
                                <div className="text-white/42">Tweede datum</div>
                                <div className="text-white">{record.currentProposal.secondaryDate}</div>
                              </div>
                            ) : null}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-4">
                              <div className="text-white/42">Moment</div>
                              <div className="text-white">{getMomentLabel(record.currentProposal.time)}</div>
                            </div>
                            <div className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-4">
                              <div className="text-white/42">Contact</div>
                              <div className="text-white">{record.customer.phone}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                          Status
                        </div>
                        <div className="space-y-3 text-sm leading-7 text-white/72">
                          <div className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-4">
                            {record.status === 'confirmed'
                              ? 'Deze afspraak is bevestigd.'
                              : record.awaitingActor === 'admin'
                                ? 'Joost is nu aan zet om te accepteren of een nieuw moment terug te sturen.'
                                : 'Het voorstel is verstuurd en wacht nu op reactie van de klant.'}
                          </div>
                          {record.history.length > 0 ? (
                            <div className="space-y-2">
                              {record.history.slice(-3).reverse().map((item) => (
                                <div key={`${item.timestamp}-${item.summary}`} className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3">
                                  <div className="text-white">{item.summary}</div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {message ? (
                      <div className="mt-6 rounded-[22px] border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm leading-7 text-emerald-100">
                        {message}
                      </div>
                    ) : null}

                    {record.status === 'confirmed' ? (
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        {calendarUrl ? (
                          <Button onClick={() => window.location.assign(calendarUrl)} className="w-full !justify-center sm:w-auto">
                            Importeer in agenda
                            <ArrowRight size={18} className="ml-2" />
                          </Button>
                        ) : null}
                      </div>
                    ) : isCurrentTurn ? (
                      <div className="mt-8 space-y-6">
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setMode('accept')}
                            className={cn(
                              'rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                              mode === 'accept'
                                ? 'border-amber-gold/42 bg-amber-gold/12 text-white'
                                : 'border-white/10 bg-white/5 text-white/68',
                            )}
                          >
                            Accepteren
                          </button>
                          <button
                            type="button"
                            onClick={() => setMode('propose')}
                            className={cn(
                              'rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                              mode === 'propose'
                                ? 'border-amber-gold/42 bg-amber-gold/12 text-white'
                                : 'border-white/10 bg-white/5 text-white/68',
                            )}
                          >
                            Ander moment voorstellen
                          </button>
                        </div>

                        {mode === 'accept' ? (
                          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                            <p className="text-sm leading-7 text-white/72">
                              {actor === 'admin'
                                ? 'Kies welke datum je vastzet. De klant ontvangt daarna direct de bevestiging.'
                                : 'Met deze actie bevestig je dat dit moment voor jullie klopt.'}
                            </p>
                            {record.currentProposal.secondaryDate ? (
                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {[
                                  ['primary', record.currentProposal.date],
                                  ['secondary', record.currentProposal.secondaryDate],
                                ].map(([key, date]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedAcceptDate(date)}
                                    className={cn(
                                      'rounded-[22px] border px-4 py-4 text-left transition-all duration-200',
                                      selectedAcceptDate === date
                                        ? 'border-amber-gold/42 bg-amber-gold/12 text-white shadow-[0_0_0_4px_rgba(224,172,62,0.05)]'
                                        : 'border-white/10 bg-white/5 text-white/72 hover:border-white/16 hover:bg-white/[0.06]',
                                    )}
                                  >
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-gold">
                                      {key === 'primary' ? 'Eerste datum' : 'Tweede datum'}
                                    </div>
                                    <div className="mt-1 text-base font-semibold">{date}</div>
                                  </button>
                                ))}
                              </div>
                            ) : null}
                            <div className="mt-5">
                              <Button
                                onClick={() => void submitAction('accept')}
                                disabled={isSubmitting}
                                className="w-full !justify-center"
                              >
                                {isSubmitting ? 'Bezig...' : 'Bevestig deze afspraak'}
                                {!isSubmitting ? <ArrowRight size={18} className="ml-2" /> : null}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                            <TextField
                              name="proposalDate"
                              label="Nieuwe datum"
                              icon={CalendarDays}
                              type="date"
                              value={proposalDate}
                              onChange={(event) => setProposalDate(event.target.value)}
                              min={getTodayIsoDate()}
                            />

                            <div className="mt-4 space-y-3">
                              <label className="flex items-center gap-2 pl-1 text-[13px] font-semibold tracking-[0.01em] text-white/92">
                                <Clock3 size={16} className="text-white/55" />
                                <span>Moment</span>
                              </label>
                              <div className="grid gap-3 md:grid-cols-3">
                                {([
                                  ['morning', 'Ochtend'],
                                  ['afternoon', 'Middag'],
                                  ['late-afternoon', 'Einde middag'],
                                ] as Array<[DemoPreferenceTime, string]>).map(([value, label]) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setProposalTime(value)}
                                    className={cn(
                                      'rounded-[22px] border px-4 py-4 text-left transition-all duration-200',
                                      proposalTime === value
                                        ? 'border-amber-gold/42 bg-amber-gold/12 text-white shadow-[0_0_0_4px_rgba(224,172,62,0.05)]'
                                        : 'border-white/10 bg-white/5 text-white/72 hover:border-white/16 hover:bg-white/[0.06]',
                                    )}
                                  >
                                    <div className="text-base font-semibold">{label}</div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {actor === 'admin' ? (
                              <label className="mt-5 flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/72">
                                <input
                                  type="checkbox"
                                  checked={phoneConfirmed}
                                  onChange={(event) => setPhoneConfirmed(event.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-amber-gold accent-amber-gold"
                                />
                                <span className="inline-flex items-center gap-2">
                                  <PhoneCall size={16} className="text-amber-gold" />
                                  Afspraak is telefonisch al bevestigd
                                </span>
                              </label>
                            ) : null}

                            <div className="mt-5">
                              <Button
                                onClick={() => void submitAction('propose')}
                                disabled={isSubmitting}
                                className="w-full !justify-center"
                              >
                                {isSubmitting
                                  ? 'Bezig...'
                                  : actor === 'admin'
                                    ? phoneConfirmed
                                      ? 'Bevestig dit moment'
                                      : 'Stuur nieuw voorstel'
                                    : 'Stuur nieuwe voorkeur'}
                                {!isSubmitting ? <ArrowRight size={18} className="ml-2" /> : null}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-7 text-white/72">
                        Dit dossier is bijgewerkt. Zodra de andere kant reageert, loopt de afspraak verder in de nieuwste mail.
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
