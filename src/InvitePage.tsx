import { useEffect, useMemo, useState } from 'react';

import { BrandLogo } from './components/BrandLogo';
import { BrandWatermark } from './components/BrandWatermark';

interface InviteData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  launchDate: string;
  launchTime: string;
  launchLocation: string;
  rsvpUrl: string;
}

type InviteState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; invite: InviteData };

function readInviteParam() {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URLSearchParams(window.location.search).get('e')?.trim() ?? '';
}

export default function InvitePage() {
  const encodedInvite = useMemo(() => readInviteParam(), []);
  const [inviteState, setInviteState] = useState<InviteState>(() =>
    encodedInvite ? { status: 'loading' } : { status: 'error', message: 'De uitnodigingslink is onvolledig.' },
  );

  useEffect(() => {
    document.title = 'Persoonlijke uitnodiging | VloerGroep';
  }, []);

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

  const isLoading = inviteState.status === 'loading';
  const isReady = inviteState.status === 'ready';
  const invite = isReady ? inviteState.invite : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#FBEFD5]">
      <BrandWatermark />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(224,172,62,0.11),transparent_28%),linear-gradient(180deg,#0a0a0a_0%,#050505_100%)]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 sm:py-10">
        <header className="mb-10 flex items-center">
          <BrandLogo className="h-9 sm:h-10" />
        </header>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 lg:flex-row lg:items-stretch">
          <section className="flex w-full max-w-xl flex-col justify-center">
            <span className="mb-5 inline-flex w-fit rounded-full border border-amber-gold/20 bg-amber-gold/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-gold">
              Persoonlijke uitnodiging
            </span>

            <h1 className="mb-5 max-w-2xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl">
              Uw exclusieve uitnodiging ligt voor u klaar
            </h1>

            <p className="max-w-xl text-base leading-8 text-[#FBEFD5]/78 sm:text-lg">
              Dit is de eerste werkende uitnodigingspagina achter je Brevo-mail. De 404 is hiermee opgelost.
              Hierna kunnen we de video, envelop-opening en het briefpapier precies op deze flow aansluiten.
            </p>
          </section>

          <section className="w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-7">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-28 bg-[radial-gradient(circle,rgba(224,172,62,0.14),transparent_70%)] blur-2xl" />

              <div className="relative rounded-[26px] border border-white/12 bg-[#121212] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-8">
                {isLoading && (
                  <div className="space-y-4 text-left">
                    <div className="h-3 w-28 rounded-full bg-white/8" />
                    <div className="h-10 w-3/4 rounded-2xl bg-white/8" />
                    <div className="h-3 w-full rounded-full bg-white/8" />
                    <div className="h-3 w-5/6 rounded-full bg-white/8" />
                    <div className="mt-8 rounded-[22px] border border-white/8 bg-white/[0.03] p-5">
                      <div className="h-3 w-24 rounded-full bg-white/8" />
                      <div className="mt-4 h-3 w-1/2 rounded-full bg-white/8" />
                      <div className="mt-3 h-3 w-2/3 rounded-full bg-white/8" />
                      <div className="mt-3 h-3 w-3/4 rounded-full bg-white/8" />
                    </div>
                  </div>
                )}

                {inviteState.status === 'error' && (
                  <div className="space-y-5">
                    <div>
                      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                        Uitnodiging
                      </div>
                      <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-white">
                        De uitnodiging kon niet worden geladen
                      </h2>
                    </div>

                    <p className="text-sm leading-7 text-[#FBEFD5]/75 sm:text-base">
                      {inviteState.message}
                    </p>

                    <p className="text-sm leading-7 text-[#FBEFD5]/62">
                      Controleer of de Brevo-link het volledige `?e=` deel bevat en of het e-mailadres ook in Brevo bestaat.
                    </p>
                  </div>
                )}

                {isReady && invite && (
                  <div className="space-y-8">
                    <div>
                      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                        Persoonlijk opgesteld voor
                      </div>
                      <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
                        {invite.firstName} {invite.lastName}
                      </h2>
                      <p className="mt-3 text-base leading-8 text-[#FBEFD5]/78">
                        {invite.company || invite.email}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-5 sm:p-6">
                      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold">
                        Officiële opening
                      </div>
                      <div className="space-y-3 text-sm leading-7 text-[#FBEFD5]/80 sm:text-base">
                        <p>
                          Datum: <span className="font-semibold text-white">{invite.launchDate || 'Nog instellen in Vercel'}</span>
                        </p>
                        <p>
                          Tijd: <span className="font-semibold text-white">{invite.launchTime || 'Nog instellen in Vercel'}</span>
                        </p>
                        <p>
                          Locatie: <span className="font-semibold text-white">{invite.launchLocation || 'Nog instellen in Vercel'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm leading-7 text-[#FBEFD5]/72 sm:text-base">
                      <p>
                        Dit is nu de basis. De volgende stap is dat we hier jouw video en de envelop-animatie op aansluiten,
                        waarna de brief echt van onder omhoog komt als persoonlijke uitnodiging.
                      </p>

                      {invite.rsvpUrl ? (
                        <a
                          href={invite.rsvpUrl}
                          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-amber-gold px-6 py-3 font-display text-sm font-bold tracking-[-0.02em] text-[#050505] transition-transform duration-200 hover:scale-[1.02]"
                        >
                          Bevestig uw aanwezigheid
                        </a>
                      ) : (
                        <div className="rounded-2xl border border-amber-gold/16 bg-amber-gold/[0.06] px-4 py-3 text-sm text-[#FBEFD5]/78">
                          Voeg straks `INVITE_RSVP_URL` toe in Vercel om de RSVP-knop actief te maken.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
