import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';

import { ScreenHeroImage } from './components/ScreenHeroImage';
import { brandWatermarkIcon } from './lib/brandAssets';
import { heroScreenThanks } from './lib/brandAssets';
import inviteLetterLogo from './Afbeeldingen/Logo voor op witte achtergronden PNG.png';
import inviteVideo from './Afbeeldingen/Openingsvideo.mp4';

interface InviteData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  launchDate: string;
  launchTime: string;
  launchLocation: string;
  calendarUrl: string;
}

type InviteState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; invite: InviteData };

type ExperiencePhase = 'video' | 'reveal' | 'letter' | 'accepted';
type RsvpState = 'idle' | 'submitting' | 'error';

function readInviteParam() {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URLSearchParams(window.location.search).get('e')?.trim() ?? '';
}

function getInviteName(invite: InviteData | null) {
  if (!invite) {
    return '';
  }

  return [invite.firstName, invite.lastName].filter(Boolean).join(' ').trim() || invite.email;
}

const CONFETTI_PIECES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: 4 + ((index * 91) % 92),
  size: 8 + (index % 4) * 4,
  delay: index * 0.06,
  duration: 2.6 + (index % 5) * 0.18,
  rotate: (index % 2 === 0 ? 1 : -1) * (45 + index * 9),
  color:
    index % 3 === 0
      ? 'bg-amber-gold'
      : index % 3 === 1
      ? 'bg-white'
        : 'bg-[#FBEFD5]',
}));

const REVEAL_START_AT_SECONDS = 5;
const REVEAL_TRANSITION_MS = 1680;

export default function InvitePage() {
  const encodedInvite = useMemo(() => readInviteParam(), []);
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const revealTriggeredRef = useRef(false);
  const inviteStorageKey = useMemo(
    () => (encodedInvite ? `vloergroep-invite-accepted:${encodedInvite}` : ''),
    [encodedInvite],
  );

  const [inviteState, setInviteState] = useState<InviteState>(() =>
    encodedInvite ? { status: 'loading' } : { status: 'error', message: 'De uitnodigingslink is onvolledig.' },
  );
  const [phase, setPhase] = useState<ExperiencePhase>(prefersReducedMotion ? 'letter' : 'video');
  const [videoVisible, setVideoVisible] = useState(!prefersReducedMotion);
  const [rsvpState, setRsvpState] = useState<RsvpState>('idle');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [acceptedInvite, setAcceptedInvite] = useState<InviteData | null>(null);

  useEffect(() => {
    document.title = 'Persoonlijke uitnodiging | VloerGroep';
  }, []);

  useEffect(() => {
    if (!inviteStorageKey || typeof window === 'undefined') {
      return;
    }

    if (window.sessionStorage.getItem(inviteStorageKey) === 'accepted') {
      setPhase('accepted');
      setVideoVisible(false);
    }
  }, [inviteStorageKey]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase((currentPhase) => (currentPhase === 'accepted' ? currentPhase : 'letter'));
      setVideoVisible(false);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const shouldLockScroll = phase === 'video' || phase === 'reveal';
    const { documentElement, body } = document;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    if (shouldLockScroll) {
      documentElement.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.overscrollBehavior = 'none';
    }

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [phase]);

  useEffect(() => {
    if (!encodedInvite) {
      return;
    }

    let cancelled = false;

    const loadInvite = async () => {
      try {
        const response = await fetch(`/api/invite?e=${encodeURIComponent(encodedInvite)}`, {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        });

        const data = (await response.json()) as
          | { ok: true; invite: InviteData }
          | { ok: false; message?: string };

        if (cancelled) {
          return;
        }

        if (!response.ok || !data.ok) {
          setInviteState({
            status: 'error',
            message: data.ok === false && data.message
              ? data.message
              : 'De persoonlijke uitnodiging kon niet worden geladen.',
          });
          return;
        }

        setInviteState({ status: 'ready', invite: data.invite });
        setAcceptedInvite((currentInvite) => currentInvite ?? data.invite);
      } catch {
        if (!cancelled) {
          setInviteState({
            status: 'error',
            message: 'Er ging iets mis bij het laden van de uitnodiging.',
          });
        }
      }
    };

    void loadInvite();

    return () => {
      cancelled = true;
    };
  }, [encodedInvite]);

  useEffect(() => {
    if (phase !== 'reveal') {
      return;
    }

    const timer = window.setTimeout(() => {
      setPhase((currentPhase) => (currentPhase === 'reveal' ? 'letter' : currentPhase));
      setVideoVisible(false);
    }, REVEAL_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  const invite = inviteState.status === 'ready' ? inviteState.invite : acceptedInvite;
  const inviteName = getInviteName(invite);
  const greetingName = invite?.firstName || inviteName || 'gast';
  const showPaper = phase === 'letter' || phase === 'accepted' || prefersReducedMotion;
  const showThankYou = phase === 'accepted' && !!invite;
  const revealDuration = REVEAL_TRANSITION_MS / 1000;
  const showGlobalGlow = phase === 'reveal' || phase === 'letter';

  const handleVideoTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (prefersReducedMotion || revealTriggeredRef.current) {
      return;
    }

    const video = event.currentTarget;
    if (!video.duration) {
      return;
    }

    if (video.currentTime >= REVEAL_START_AT_SECONDS) {
      revealTriggeredRef.current = true;
      setPhase('reveal');
    }
  };

  const handleVideoEnd = () => {
    if (prefersReducedMotion) {
      return;
    }

    if (!revealTriggeredRef.current) {
      revealTriggeredRef.current = true;
      setPhase((currentPhase) => (currentPhase === 'accepted' ? currentPhase : 'reveal'));
      return;
    }

    if (phase === 'reveal') {
      return;
    }

    setPhase((currentPhase) => (currentPhase === 'accepted' ? currentPhase : 'letter'));
    setVideoVisible(false);
  };

  const handleAcceptInvite = async () => {
    if (!encodedInvite || rsvpState === 'submitting' || !invite) {
      return;
    }

    setAcceptedInvite(invite);
    setPhase('accepted');
    setRsvpState('submitting');
    setRsvpMessage('');

    try {
      const response = await fetch('/api/invite-rsvp', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ e: encodedInvite, invite }),
      });

      const data = (await response.json()) as
        | { ok: true; invite: InviteData }
        | { ok: false; message?: string };

      if (!response.ok || !data.ok) {
        setRsvpState('error');
        setRsvpMessage(data.ok === false && data.message ? data.message : 'De bevestiging kon niet worden verwerkt.');
        return;
      }

      setAcceptedInvite(data.invite);
      setPhase('accepted');
      setRsvpState('idle');
      setRsvpMessage('');

      if (inviteStorageKey && typeof window !== 'undefined') {
        window.sessionStorage.setItem(inviteStorageKey, 'accepted');
      }
    } catch {
      setRsvpState('error');
      setRsvpMessage('Er ging iets mis tijdens het bevestigen van de uitnodiging.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080805] text-[#FBEFD5]">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0c0b08_0%,#090907_42%,#080805_100%)]"
        aria-hidden="true"
      />

      <AnimatePresence>
        {showGlobalGlow && (
          <>
            <motion.div
              key="invite-glow-core"
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-18%] z-[24]"
              initial={{ opacity: 0, scale: 0.52 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.14, scale: 1.16 }
                  : phase === 'reveal'
                    ? { opacity: [0.05, 0.56, 1], scale: [0.72, 1.06, 1.38] }
                    : { opacity: 0.16, scale: 1.26 }
              }
              exit={{ opacity: 0, scale: 1.18 }}
              transition={
                phase === 'reveal'
                  ? { duration: revealDuration, ease: [0.16, 1, 0.3, 1], times: [0, 0.6, 1] }
                  : { duration: 1.05, ease: [0.22, 1, 0.36, 1] }
              }
              style={{
                background:
                  'radial-gradient(circle at center, rgba(255,250,240,0.98) 0%, rgba(245,232,205,0.68) 20%, rgba(234,206,147,0.34) 38%, rgba(224,172,62,0.16) 54%, rgba(224,172,62,0.04) 72%, transparent 84%)',
              }}
            />
            <motion.div
              key="invite-glow-wash"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[25]"
              initial={{ opacity: 0, scale: 1 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0, scale: 1 }
                  : phase === 'reveal'
                    ? { opacity: [0, 0.44, 1], scale: [1, 1.02, 1.05] }
                    : { opacity: 0, scale: 1 }
              }
              exit={{ opacity: 0 }}
              transition={
                phase === 'reveal'
                  ? { duration: revealDuration, ease: [0.18, 1, 0.28, 1], times: [0, 0.7, 1] }
                  : { duration: 0.92, ease: [0.22, 1, 0.36, 1] }
              }
              style={{
                background:
                  'radial-gradient(circle at center, rgba(255,252,248,1) 0%, rgba(249,241,225,0.99) 34%, rgba(241,223,187,0.7) 58%, rgba(224,172,62,0.2) 76%, transparent 92%)',
              }}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {videoVisible && !showThankYou && (
          <div className="pointer-events-none fixed inset-0 z-20 grid place-items-center overflow-hidden">
            <motion.div
              key="invite-video"
              className="flex w-screen items-center justify-center overflow-hidden"
              initial={{ opacity: 1, scale: 1 }}
              animate={
                phase === 'video'
                  ? { opacity: 1, scale: 1 }
                  : phase === 'reveal'
                    ? { opacity: [1, 1, 0], scale: [1, 1.01, 1.03] }
                    : { opacity: 0, scale: 1.03 }
              }
              exit={{ opacity: 0 }}
              transition={
                phase === 'reveal'
                  ? { duration: revealDuration, ease: [0.16, 1, 0.3, 1], times: [0, 0.62, 1] }
                  : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
              }
              style={{ transformOrigin: 'center center' }}
            >
              <video
                ref={videoRef}
                className="block max-h-[64vh] w-screen max-w-none object-contain sm:max-h-[68vh] sm:w-[min(78vw,780px)] lg:max-h-[70vh] lg:w-[min(68vw,940px)] xl:w-[min(62vw,1040px)]"
                autoPlay
                muted
                playsInline
                preload="auto"
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnd}
                onError={handleVideoEnd}
              >
                <source src={inviteVideo} type="video/mp4" />
              </video>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <AnimatePresence mode="wait">
          {showThankYou ? (
            <motion.section
              key="invite-thanks"
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto flex w-full max-w-3xl flex-col items-center"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {CONFETTI_PIECES.map((piece) => (
                  <motion.span
                    key={piece.id}
                    className={`absolute top-0 block rounded-full ${piece.color}`}
                    style={{
                      left: `${piece.left}%`,
                      width: `${piece.size}px`,
                      height: `${piece.size * 1.6}px`,
                    }}
                    initial={{ y: -40, opacity: 0, rotate: 0 }}
                    animate={{ y: 420, opacity: [0, 1, 1, 0], rotate: piece.rotate }}
                    transition={{
                      duration: piece.duration,
                      delay: piece.delay,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              <div className="relative w-full overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.52)] backdrop-blur-2xl sm:p-7">
                <div className="pointer-events-none absolute inset-x-8 top-0 h-32 bg-[radial-gradient(circle,rgba(224,172,62,0.18),transparent_72%)] blur-2xl" />
                <div className="relative rounded-[28px] border border-white/12 bg-[#0f0d0a] p-7 text-center sm:p-10">
                  <ScreenHeroImage
                    src={heroScreenThanks}
                    alt="VloerGroep bedanktscherm"
                    className="mb-8"
                  />

                  <h1 className="mb-4 font-display text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
                    {rsvpState === 'submitting' ? `Een ogenblik, ${greetingName}` : `Dank u, ${greetingName}`}
                  </h1>

                  <p className="mx-auto max-w-2xl text-base leading-8 text-[#FBEFD5]/78 sm:text-lg">
                    {rsvpState === 'submitting'
                      ? (
                        <>
                          Uw bevestiging wordt op dit moment afgerond. U hoeft niets meer te doen.
                        </>
                      )
                      : (
                        <>
                          Uw aanwezigheid is bevestigd. We zien u graag op{' '}
                          <span className="font-semibold text-white">{invite?.launchDate || '-'}</span> om{' '}
                          <span className="font-semibold text-white">{invite?.launchTime || '-'}</span>{' '}
                          in <span className="font-semibold text-white">{invite?.launchLocation || '-'}</span>.
                        </>
                      )}
                  </p>

                  {rsvpState === 'submitting' ? (
                    <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber-gold/16 bg-amber-gold/8 px-4 py-3 text-sm leading-6 text-[#FBEFD5]/84">
                      We verwerken nu uw bevestiging, sturen de e-mails uit en zetten deze direct door naar de gastenlijst.
                    </div>
                  ) : null}

                  {rsvpState === 'error' && rsvpMessage ? (
                    <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#d3b2b6] bg-[#4a2026]/40 px-4 py-3 text-sm leading-6 text-[#f3d7dc]">
                      {rsvpMessage}
                    </div>
                  ) : null}

                  <div className="mx-auto mt-8 grid max-w-2xl gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-left sm:grid-cols-3 sm:p-6">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 text-amber-gold" size={18} />
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-gold">
                          Datum
                        </div>
                        <div className="mt-1 text-sm leading-6 text-white/84">
                          {invite?.launchDate || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 text-amber-gold" size={18} />
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-gold">
                          Tijd
                        </div>
                        <div className="mt-1 text-sm leading-6 text-white/84">
                          {invite?.launchTime || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 text-amber-gold" size={18} />
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-gold">
                          Locatie
                        </div>
                        <div className="mt-1 text-sm leading-6 text-white/84">
                          {invite?.launchLocation || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {invite?.calendarUrl && rsvpState !== 'submitting' ? (
                      <a
                        href={invite.calendarUrl}
                        className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-amber-gold px-7 py-3 font-display text-sm font-bold tracking-[-0.02em] text-[#050505] transition-transform duration-200 hover:scale-[1.02]"
                      >
                        Importeer in agenda
                      </a>
                    ) : null}
                    <a
                      href="mailto:rico@vloergroep.nl"
                      className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-7 py-3 font-display text-sm font-bold tracking-[-0.02em] text-white transition-colors duration-200 hover:bg-white/[0.06]"
                    >
                      Neem contact op
                    </a>
                  </div>

                  {rsvpState !== 'submitting' ? (
                    <p className="mt-6 text-sm leading-7 text-[#FBEFD5]/64">
                      Er is ook een bevestiging naar <span className="text-white/84">{invite?.email || '-'}</span> verstuurd.
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="invite-letter"
              initial={false}
              animate={{
                opacity: showPaper ? 1 : 0,
                y: showPaper ? 0 : 340,
                scale: showPaper ? 1 : 0.992,
              }}
              transition={{ duration: 1.75, ease: [0.14, 1, 0.22, 1] }}
              className="mx-auto w-full max-w-4xl px-1 sm:px-4"
            >
              <div className="relative py-6">
                <div className="pointer-events-none absolute inset-x-10 top-8 h-24 bg-[radial-gradient(circle,rgba(224,172,62,0.12),transparent_72%)] blur-2xl" />
                <div className="pointer-events-none absolute left-1/2 top-[1.25rem] h-[97%] w-[96%] -translate-x-1/2 rotate-[-1deg] rounded-[8px] border border-[#ded4c2] bg-[#efe6d6] shadow-[0_18px_36px_rgba(0,0,0,0.14)]" />

                <div className="relative overflow-hidden rounded-[6px] border border-[#d8d1c4] bg-[linear-gradient(180deg,#f7f3ea_0%,#f2ece0_100%)] p-6 text-[#151515] shadow-[0_30px_52px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.72)] sm:p-10">
                  <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                    style={{
                      background:
                        'radial-gradient(circle at top, rgba(255,255,255,0.72), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.06) 18%, rgba(0,0,0,0.015) 100%)',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-45"
                    aria-hidden="true"
                    style={{
                      background:
                        'repeating-linear-gradient(180deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, rgba(245,241,232,0) 2px, rgba(245,241,232,0) 12px)',
                    }}
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),transparent)]" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(0deg,rgba(0,0,0,0.05),transparent)]" />
                  <div className="pointer-events-none absolute inset-y-8 left-0 w-8 bg-[linear-gradient(90deg,rgba(0,0,0,0.045),transparent)]" />
                  <div className="pointer-events-none absolute inset-y-8 right-0 w-8 bg-[linear-gradient(270deg,rgba(0,0,0,0.04),transparent)]" />
                  <div
                    className="pointer-events-none absolute right-0 top-0 h-20 w-20 opacity-65"
                    aria-hidden="true"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.48) 42%, rgba(0,0,0,0.08) 100%)',
                    }}
                  />
                  <img
                    src={brandWatermarkIcon}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[-1.5rem] right-[-1rem] w-52 opacity-[0.045] sm:w-60"
                  />

                  <div className="relative z-10">
                    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-4">
                        <img
                          src={inviteLetterLogo}
                          alt="VloerGroep"
                          className="h-10 w-auto object-contain sm:h-11"
                        />
                        <div className="h-px w-28 bg-[#d1c6b2]" />
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9f7a1c]">
                          Persoonlijke uitnodiging
                        </div>
                        <div className="text-sm leading-6 text-[#4a453d]">
                          Aldebaranweg 14-N
                        </div>
                        <div className="text-sm leading-6 text-[#4a453d]">
                          8938 BD Leeuwarden
                        </div>
                        <div className="mt-2 text-sm leading-6 text-[#4a453d]">
                          Telefoon: 06 – 57 57 38 62
                        </div>
                        <div className="my-3 h-px w-full bg-[#ddd4c5] sm:ml-auto sm:max-w-[220px]" />
                        <div className="text-sm leading-7 text-[#4a453d]">
                          Ter attentie van <span className="font-semibold text-[#151515]">{inviteName || 'genodigde'}</span>
                        </div>
                        <div className="text-sm leading-7 text-[#4a453d]">
                          {invite?.company || invite?.email || 'VloerGroep gast'}
                        </div>
                      </div>
                    </div>

                    {inviteState.status === 'loading' && (
                      <div className="space-y-4">
                        <div className="h-4 w-28 rounded-full bg-black/6" />
                        <div className="h-12 w-4/5 rounded-2xl bg-black/7" />
                        <div className="h-3 w-full rounded-full bg-black/6" />
                        <div className="h-3 w-5/6 rounded-full bg-black/6" />
                        <div className="mt-8 rounded-[24px] border border-black/8 bg-white/55 p-5">
                          <div className="h-3 w-24 rounded-full bg-black/6" />
                          <div className="mt-4 h-3 w-1/2 rounded-full bg-black/6" />
                          <div className="mt-3 h-3 w-2/3 rounded-full bg-black/6" />
                          <div className="mt-3 h-3 w-3/4 rounded-full bg-black/6" />
                        </div>
                      </div>
                    )}

                    {inviteState.status === 'error' && (
                      <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#d3c4a0] bg-[#f8f1dc] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9f7a1c]">
                          <Sparkles size={14} />
                          Uitnodiging
                        </div>
                        <h1 className="font-display text-4xl font-bold tracking-[-0.04em] text-[#151515] sm:text-5xl">
                          De uitnodiging kon niet worden geladen
                        </h1>
                        <p className="max-w-2xl text-base leading-8 text-[#4a453d]">
                          {inviteState.message}
                        </p>
                        <p className="text-sm leading-7 text-[#666056]">
                          Controleer of de Brevo-link het volledige `?e=` deel bevat en of het e-mailadres ook in Brevo bestaat.
                        </p>
                      </div>
                    )}

                    {inviteState.status === 'ready' && invite && (
                      <div>
                        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9f7a1c]">
                          Exclusief voor u opgesteld
                        </div>

                        <h1 className="max-w-3xl font-display text-[2.6rem] font-bold leading-[0.98] tracking-[-0.05em] text-[#151515] sm:text-[3.5rem]">
                          Uitnodiging voor de officiele opening
                        </h1>

                        <div className="mt-5 h-px w-full max-w-[180px] bg-[#ddd4c5]" />

                        <p className="mt-3 max-w-2xl text-base leading-8 text-[#4a453d] sm:text-lg">
                          Beste {greetingName},
                        </p>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-[#4a453d] sm:text-lg">
                          Met veel plezier nodigen wij u persoonlijk uit voor een bijzondere avond rond de officiele opening van VloerGroep.
                        </p>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-[#4a453d] sm:text-lg">
                          Voor <span className="font-semibold text-[#151515]">{invite.company || invite.email}</span> houden wij hiervoor graag persoonlijk een plaats vrij.
                        </p>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-[#4a453d] sm:text-lg">
                          U behoort tot de eerste kring die wij willen meenemen in de start van VloerGroep. Niet alleen om erbij te zijn, maar ook om mee te voelen welke richting vanaf hier de meeste waarde krijgt.
                        </p>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-[#4a453d] sm:text-lg">
                          Wilt u erbij zijn?
                          {' '}
                          <button
                            type="button"
                            onClick={handleAcceptInvite}
                            disabled={rsvpState === 'submitting'}
                            className="inline font-semibold text-[#151515] underline decoration-[#c4932d] decoration-2 underline-offset-4 transition-colors duration-200 hover:text-[#9f7a1c] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Reserveer mijn plaats
                          </button>
                          .
                        </p>

                        <div className="mt-8 rounded-[24px] border border-[#ded6c8] bg-white/62 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.05)] sm:p-6">
                          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9f7a1c]">
                            Waarom wij u er graag bij hebben
                          </div>

                          <ul className="space-y-4 text-sm leading-7 text-[#4a453d] sm:text-[15px]">
                            <li className="flex gap-3">
                              <span className="mt-[10px] h-2.5 w-2.5 shrink-0 rounded-full bg-[#c4932d]" />
                              <span>
                                <span className="font-semibold text-[#151515]">Als eerste aan tafel.</span> U ziet de opening van VloerGroep van dichtbij.
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="mt-[10px] h-2.5 w-2.5 shrink-0 rounded-full bg-[#c4932d]" />
                              <span>
                                <span className="font-semibold text-[#151515]">Uw blik telt mee.</span> De eerste reacties uit de markt helpen de route vanaf de start scherper te maken.
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="mt-[10px] h-2.5 w-2.5 shrink-0 rounded-full bg-[#c4932d]" />
                              <span>
                                <span className="font-semibold text-[#151515]">Een bijzondere eerste kring.</span> Een verzorgde avond met de mensen die vanaf het begin onderdeel zijn van dit moment.
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-8 rounded-[24px] border border-[#ded6c8] bg-white/65 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-7">
                          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9f7a1c]">
                            Opening VloerGroep
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="flex items-start gap-3">
                              <CalendarDays className="mt-0.5 text-[#9f7a1c]" size={18} />
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9f7a1c]">
                                  Datum
                                </div>
                                <div className="mt-1 text-sm leading-6 text-[#151515]">
                                  {invite.launchDate || '-'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Clock3 className="mt-0.5 text-[#9f7a1c]" size={18} />
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9f7a1c]">
                                  Tijd
                                </div>
                                <div className="mt-1 text-sm leading-6 text-[#151515]">
                                  {invite.launchTime || '-'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="mt-0.5 text-[#9f7a1c]" size={18} />
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9f7a1c]">
                                  Locatie
                                </div>
                                <div className="mt-1 text-sm leading-6 text-[#151515]">
                                  {invite.launchLocation || '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="mt-8 max-w-2xl text-base leading-8 text-[#4a453d] sm:text-lg">
                          Wij zouden het bijzonder vinden u die avond persoonlijk te mogen ontvangen.
                        </p>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-[#4a453d] sm:text-lg">
                          Met vriendelijke groet,
                          <br />
                          <span className="font-semibold text-[#151515]">Rico van der Meer</span>
                          <br />
                          VloerGroep
                        </p>

                        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={handleAcceptInvite}
                            disabled={rsvpState === 'submitting'}
                            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#0a0a0a] px-7 py-3 font-display text-sm font-bold tracking-[-0.02em] text-white transition-transform duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {rsvpState === 'submitting' ? 'Plaats reserveren...' : 'Reserveer mijn plaats'}
                          </button>

                          <div className="flex items-center gap-2 text-sm leading-6 text-[#5b554d]">
                            <Mail size={16} className="text-[#9f7a1c]" />
                            Na uw bevestiging ontvangt u direct een persoonlijke bevestiging
                          </div>
                        </div>

                        {rsvpState === 'error' && rsvpMessage ? (
                          <div className="mt-5 rounded-2xl border border-[#d3b2b6] bg-[#f7e9eb] px-4 py-3 text-sm leading-6 text-[#7b303a]">
                            {rsvpMessage}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
