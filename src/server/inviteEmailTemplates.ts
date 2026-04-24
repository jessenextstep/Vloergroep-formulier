import type { InviteLookupResult } from './inviteService.js';
import { formatDutchDate } from '../lib/dateFormat.js';

interface InviteEmailContext {
  invite: InviteLookupResult;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
}

function getRecipientName(invite: InviteLookupResult): string {
  return [invite.firstName, invite.lastName].filter(Boolean).join(' ').trim() || invite.email;
}

function getGreetingName(invite: InviteLookupResult): string {
  return invite.firstName || getRecipientName(invite);
}

function renderEmailShell({
  logoUrl,
  heroImageUrl,
  eyebrow,
  title,
  intro,
  body,
}: {
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  eyebrow: string;
  title: string;
  intro?: string;
  body: string;
}) {
  const logoMarkup = logoUrl
    ? `<img src="${logoUrl}" alt="VloerGroep" width="148" style="display:block;width:148px;max-width:148px;height:auto;border:0;" />`
    : `<div style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.2;font-weight:700;color:#ffffff;">VloerGroep</div>`;

  const introMarkup = intro
    ? `<p style="margin:0 0 18px 0;font-size:16px;line-height:1.85;color:#FBEFD5;">${intro}</p>`
    : '';

  const heroMarkup = heroImageUrl
    ? `
      <div style="margin:0 0 24px 0;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background-color:#101010;">
        <img src="${heroImageUrl}" alt="" width="616" style="display:block;width:100%;height:auto;border:0;" />
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="nl">
  <body style="margin:0;padding:0;background-color:#050505;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;background-color:#050505;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:680px;border-collapse:collapse;background-color:#0b0b0b;border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:26px 32px 22px 32px;background-color:#000000;border-top:4px solid #E0AC3E;">
                ${logoMarkup}
              </td>
            </tr>
            <tr>
              <td style="padding:34px 32px 30px 32px;background:radial-gradient(circle at top, rgba(224,172,62,0.10), transparent 34%), linear-gradient(180deg,#050505 0%,#0b0b0b 100%);font-family:Arial,Helvetica,sans-serif;color:#FBEFD5;">
                ${heroMarkup}
                <div style="margin:0 0 12px 0;font-size:11px;line-height:1.3;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#E0AC3E;">${eyebrow}</div>
                <h1 style="margin:0 0 18px 0;font-size:34px;line-height:1.08;font-weight:700;letter-spacing:-0.03em;color:#ffffff;">${title}</h1>
                ${introMarkup}
                ${body}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildInviteAcceptedCustomerEmail({ invite, logoUrl, heroImageUrl }: InviteEmailContext) {
  const greetingName = getGreetingName(invite);
  const title = `${greetingName}, uw aanwezigheid is bevestigd`;
  const intro = `Wat fijn dat u erbij bent. Wij kijken ernaar uit u te verwelkomen tijdens de officiele opening van VloerGroep.`;
  const calendarBlock = invite.calendarUrl
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 18px 0;">
        <tr>
          <td style="border-radius:999px;background-color:#E0AC3E;">
            <a href="${invite.calendarUrl}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;color:#050505;text-decoration:none;border-radius:999px;">
              Importeer in uw agenda
            </a>
          </td>
        </tr>
      </table>
    `
    : '';

  const html = renderEmailShell({
    logoUrl,
    heroImageUrl,
    eyebrow: 'Bevestiging',
    title,
    intro,
    body: `
      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Beste ${greetingName},
      </p>
      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Uw uitnodiging is bevestigd voor <span style="color:#ffffff;font-weight:700;">${invite.company || getRecipientName(invite)}</span>.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 20px 0;border-collapse:collapse;background-color:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:18px;">
        <tr>
          <td style="padding:20px 20px 16px 20px;">
            <div style="margin:0 0 10px 0;font-size:12px;line-height:1.3;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#E0AC3E;">Officiele opening</div>
            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Datum: <span style="color:#ffffff;font-weight:700;">${invite.launchDate ? formatDutchDate(invite.launchDate) : '-'}</span></p>
            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Tijd: <span style="color:#ffffff;font-weight:700;">${invite.launchTime || '-'}</span></p>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#FBEFD5;">Locatie: <span style="color:#ffffff;font-weight:700;">${invite.launchLocation || '-'}</span></p>
          </td>
        </tr>
      </table>
      ${calendarBlock}
      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        We zien u graag op deze bijzondere avond.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Met vriendelijke groet,<br />Rico van der Meer<br />Ontwikkelaar VloerGroep
      </p>
    `,
  });

  const text = [
    `${greetingName}, uw aanwezigheid is bevestigd`,
    '',
    `Beste ${greetingName},`,
    '',
    `Uw uitnodiging is bevestigd voor ${invite.company || getRecipientName(invite)}.`,
    `Datum: ${invite.launchDate ? formatDutchDate(invite.launchDate) : '-'}`,
    `Tijd: ${invite.launchTime || '-'}`,
    `Locatie: ${invite.launchLocation || '-'}`,
    invite.calendarUrl ? `Importeer in agenda: ${invite.calendarUrl}` : '',
    '',
    'We zien u graag op deze bijzondere avond.',
    '',
    'Met vriendelijke groet,',
    'Rico van der Meer',
    'Ontwikkelaar VloerGroep',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `${greetingName}, uw aanwezigheid is bevestigd`,
    html,
    text,
  };
}

export function buildInviteAcceptedAdminEmail({ invite, logoUrl, heroImageUrl }: InviteEmailContext) {
  const recipientName = getRecipientName(invite);
  const title = `Nieuwe bevestiging voor de opening`;
  const intro = `Er is zojuist een aanwezigheid bevestigd via de persoonlijke uitnodigingspagina van VloerGroep.`;

  const html = renderEmailShell({
    logoUrl,
    heroImageUrl,
    eyebrow: 'Nieuwe RSVP',
    title,
    intro,
    body: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 20px 0;border-collapse:collapse;background-color:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:18px;">
        <tr>
          <td style="padding:20px 20px 16px 20px;">
            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Naam: <span style="color:#ffffff;font-weight:700;">${recipientName}</span></p>
            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Bedrijf: <span style="color:#ffffff;font-weight:700;">${invite.company || '-'}</span></p>
            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">E-mail: <span style="color:#ffffff;font-weight:700;">${invite.email}</span></p>
            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Datum: <span style="color:#ffffff;font-weight:700;">${invite.launchDate ? formatDutchDate(invite.launchDate) : '-'}</span></p>
            <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Tijd: <span style="color:#ffffff;font-weight:700;">${invite.launchTime || '-'}</span></p>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#FBEFD5;">Locatie: <span style="color:#ffffff;font-weight:700;">${invite.launchLocation || '-'}</span></p>
          </td>
        </tr>
      </table>
    `,
  });

  const text = [
    'Nieuwe bevestiging voor de opening',
    '',
    `Naam: ${recipientName}`,
    `Bedrijf: ${invite.company || '-'}`,
    `E-mail: ${invite.email}`,
    `Datum: ${invite.launchDate ? formatDutchDate(invite.launchDate) : '-'}`,
    `Tijd: ${invite.launchTime || '-'}`,
    `Locatie: ${invite.launchLocation || '-'}`,
  ].join('\n');

  return {
    subject: `Aanwezigheidsbevestiging: ${recipientName}${invite.company ? ` (${invite.company})` : ''}`,
    html,
    text,
  };
}
