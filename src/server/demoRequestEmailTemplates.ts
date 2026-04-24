import type {
  DemoRequestFormData,
  DemoScheduleActor,
  DemoScheduleRecord,
} from '../types.js';
import { formatDutchDate } from '../lib/dateFormat.js';
import { getPreferenceLabel } from './demoScheduleFlow.js';

interface DemoRequestEmailContext {
  request: DemoRequestFormData;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  adminCalendarUrl?: string | null;
  adminActionUrl?: string | null;
}

interface DemoScheduleEmailContext {
  record: DemoScheduleRecord;
  actor?: DemoScheduleActor;
  actionUrl?: string | null;
  calendarUrl?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
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

  const heroMarkup = heroImageUrl
    ? `
      <div style="margin:0 0 24px 0;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background-color:#101010;">
        <img src="${heroImageUrl}" alt="" width="616" style="display:block;width:100%;height:auto;border:0;" />
      </div>
    `
    : '';

  const introMarkup = intro
    ? `<p style="margin:0 0 18px 0;font-size:16px;line-height:1.85;color:#FBEFD5;">${intro}</p>`
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

function renderPrimaryButton(url: string | null | undefined, label: string) {
  if (!url) {
    return '';
  }

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;">
      <tr>
        <td style="border-radius:999px;background-color:#E0AC3E;">
          <a href="${url}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;color:#050505;text-decoration:none;border-radius:999px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function renderSummaryCard(request: DemoRequestFormData) {
  const secondaryRow = request.preferredDateSecondary
    ? `
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Tweede voorkeur: <span style="color:#ffffff;font-weight:700;">${escapeHtml(formatDutchDate(request.preferredDateSecondary))}</span></p>
    `
    : '';
  const notesRow = request.notes
    ? `
      <p style="margin:12px 0 0 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Opmerking: <span style="color:#ffffff;font-weight:700;">${escapeHtml(request.notes)}</span></p>
    `
    : '';

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 22px 0;border-collapse:collapse;background-color:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:18px;">
      <tr>
        <td style="padding:20px 20px 16px 20px;">
          <div style="margin:0 0 10px 0;font-size:12px;line-height:1.3;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#E0AC3E;">Voorkeur</div>
          <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Eerste voorkeur: <span style="color:#ffffff;font-weight:700;">${escapeHtml(formatDutchDate(request.preferredDatePrimary))}</span></p>
          ${secondaryRow}
          <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Moment: <span style="color:#ffffff;font-weight:700;">${escapeHtml(getPreferenceLabel(request.preferredTime))}</span></p>
          <p style="margin:0;font-size:15px;line-height:1.8;color:#FBEFD5;">Telefoon: <span style="color:#ffffff;font-weight:700;">${escapeHtml(request.phone)}</span></p>
          ${notesRow}
        </td>
      </tr>
    </table>
  `;
}

function renderRecordSummary(record: DemoScheduleRecord) {
  const secondaryRow = record.currentProposal.secondaryDate
    ? `
      <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Tweede datum: <span style="color:#ffffff;font-weight:700;">${escapeHtml(formatDutchDate(record.currentProposal.secondaryDate))}</span></p>
    `
    : '';
  const noteRow = record.currentProposal.note
    ? `
      <p style="margin:12px 0 0 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Toelichting: <span style="color:#ffffff;font-weight:700;">${escapeHtml(record.currentProposal.note)}</span></p>
    `
    : '';

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 22px 0;border-collapse:collapse;background-color:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:18px;">
      <tr>
        <td style="padding:20px 20px 16px 20px;">
          <div style="margin:0 0 10px 0;font-size:12px;line-height:1.3;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#E0AC3E;">Afspraakvoorstel</div>
          <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Datum: <span style="color:#ffffff;font-weight:700;">${escapeHtml(formatDutchDate(record.currentProposal.date))}</span></p>
          ${secondaryRow}
          <p style="margin:0 0 8px 0;font-size:15px;line-height:1.8;color:#FBEFD5;">Moment: <span style="color:#ffffff;font-weight:700;">${escapeHtml(getPreferenceLabel(record.currentProposal.time))}</span></p>
          <p style="margin:0;font-size:15px;line-height:1.8;color:#FBEFD5;">Contact: <span style="color:#ffffff;font-weight:700;">${escapeHtml(record.customer.name)} · ${escapeHtml(record.customer.phone)}</span></p>
          ${noteRow}
        </td>
      </tr>
    </table>
  `;
}

export function buildDemoRequestCustomerEmail({
  request,
  logoUrl,
  heroImageUrl,
}: DemoRequestEmailContext) {
  const firstName = getFirstName(request.name);
  const title = `${firstName}, je voorkeursmoment is ontvangen`;
  const intro = `Dankjewel. Joost neemt persoonlijk contact met je op om samen een definitief moment voor jullie demo te bevestigen.`;

  const html = renderEmailShell({
    logoUrl,
    heroImageUrl,
    eyebrow: 'Persoonlijke demo',
    title,
    intro,
    body: `
      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Beste ${escapeHtml(firstName)},
      </p>
      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Voor <span style="color:#ffffff;font-weight:700;">${escapeHtml(request.company)}</span> hebben we je voorkeur goed ontvangen.
      </p>
      ${renderSummaryCard(request)}
      <p style="margin:0 0 14px 0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Tijdens deze demo laat Joost rustig zien hoe jullie kunnen starten, waar voor ${escapeHtml(request.company)} de eerste winst zit en hoe dit er in de praktijk uitziet.
      </p>
      <p style="margin:0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Je ontvangt dus nog geen definitieve afspraakbevestiging. Joost kijkt eerst even in zijn agenda en zet daarna het juiste moment met jullie vast.
      </p>
    `,
  });

  const text = [
    `${firstName}, je voorkeursmoment is ontvangen`,
    '',
    `Beste ${firstName},`,
    '',
    `Voor ${request.company} hebben we je voorkeur goed ontvangen.`,
    `Eerste voorkeur: ${formatDutchDate(request.preferredDatePrimary)}`,
    request.preferredDateSecondary ? `Tweede voorkeur: ${formatDutchDate(request.preferredDateSecondary)}` : '',
    `Moment: ${getPreferenceLabel(request.preferredTime)}`,
    `Telefoon: ${request.phone}`,
    request.notes ? `Opmerking: ${request.notes}` : '',
    '',
    `Tijdens deze demo laat Joost rustig zien hoe jullie kunnen starten, waar voor ${request.company} de eerste winst zit en hoe dit er in de praktijk uitziet.`,
    'Je ontvangt dus nog geen definitieve afspraakbevestiging. Joost kijkt eerst even in zijn agenda en zet daarna het juiste moment met jullie vast.',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `${request.company}: je demoverzoek is ontvangen`,
    html,
    text,
  };
}

export function buildDemoRequestAdminEmail({
  request,
  logoUrl,
  heroImageUrl,
  adminCalendarUrl,
  adminActionUrl,
}: DemoRequestEmailContext) {
  const html = renderEmailShell({
    logoUrl,
    heroImageUrl,
    eyebrow: 'Nieuw demoverzoek',
    title: `Nieuwe demo-aanvraag van ${escapeHtml(request.company)}`,
    intro: `Er is een nieuw voorkeursmoment doorgegeven voor een persoonlijke demo met VloerGroep.`,
    body: `
      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        ${escapeHtml(request.name)} wil een persoonlijke demo inplannen voor <span style="color:#ffffff;font-weight:700;">${escapeHtml(request.company)}</span>.
      </p>
      ${renderSummaryCard(request)}
      ${renderPrimaryButton(adminActionUrl, 'Reageer op verzoek')}
      ${renderPrimaryButton(adminCalendarUrl, 'Zet eerste voorkeur in agenda')}
      <p style="margin:0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Open het verzoek om het direct te accepteren of een nieuw moment terug te sturen.
      </p>
    `,
  });

  const text = [
    `Nieuwe demo-aanvraag van ${request.company}`,
    '',
    `Naam: ${request.name}`,
    `Bedrijf: ${request.company}`,
    `E-mail: ${request.email}`,
    `Telefoon: ${request.phone}`,
    `Eerste voorkeur: ${formatDutchDate(request.preferredDatePrimary)}`,
    request.preferredDateSecondary ? `Tweede voorkeur: ${formatDutchDate(request.preferredDateSecondary)}` : '',
    `Moment: ${getPreferenceLabel(request.preferredTime)}`,
    request.notes ? `Opmerking: ${request.notes}` : '',
    adminActionUrl ? `Reageer op verzoek: ${adminActionUrl}` : '',
    adminCalendarUrl ? `Zet eerste voorkeur in agenda: ${adminCalendarUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `Nieuw demoverzoek: ${request.company}`,
    html,
    text,
  };
}

export function buildDemoScheduleCustomerProposalEmail({
  record,
  actionUrl,
  logoUrl,
  heroImageUrl,
}: DemoScheduleEmailContext) {
  const firstName = getFirstName(record.customer.name);
  const html = renderEmailShell({
    logoUrl,
    heroImageUrl,
    eyebrow: 'Nieuw voorstel',
    title: `${firstName}, Joost heeft een moment voor jullie klaargezet`,
    intro: `Voor ${record.customer.company} staat nu een concreet voorstel klaar. Je kunt het direct accepteren of een ander moment terugsturen.`,
    body: `
      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Beste ${escapeHtml(firstName)},
      </p>
      ${renderRecordSummary(record)}
      ${renderPrimaryButton(actionUrl, 'Bekijk afspraakvoorstel')}
      <p style="margin:0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Als dit moment niet past, kun je op dezelfde pagina direct een nieuw moment terugsturen.
      </p>
    `,
  });

  const text = [
    `${firstName}, Joost heeft een moment voor jullie klaargezet`,
    '',
    `Datum: ${formatDutchDate(record.currentProposal.date)}`,
    record.currentProposal.secondaryDate ? `Tweede datum: ${formatDutchDate(record.currentProposal.secondaryDate)}` : '',
    `Moment: ${getPreferenceLabel(record.currentProposal.time)}`,
    record.currentProposal.note ? `Toelichting: ${record.currentProposal.note}` : '',
    actionUrl ? `Bekijk afspraakvoorstel: ${actionUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `${record.customer.company}: voorstel voor jullie demo`,
    html,
    text,
  };
}

export function buildDemoScheduleAdminProposalEmail({
  record,
  actionUrl,
  calendarUrl,
  logoUrl,
  heroImageUrl,
}: DemoScheduleEmailContext) {
  const html = renderEmailShell({
    logoUrl,
    heroImageUrl,
    eyebrow: 'Nieuwe voorkeur',
    title: `${record.customer.company} stuurde een nieuw moment terug`,
    intro: `${record.customer.name} heeft een nieuw voorstel doorgegeven. Je kunt het direct bekijken, accepteren of opnieuw aanpassen.`,
    body: `
      ${renderRecordSummary(record)}
      ${renderPrimaryButton(actionUrl, 'Open afspraakdossier')}
      ${renderPrimaryButton(calendarUrl, 'Zet voorstel in agenda')}
      <p style="margin:0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Vanuit hetzelfde dossier kun je de afspraak direct vastzetten of een nieuw moment terugsturen.
      </p>
    `,
  });

  const text = [
    `${record.customer.company} stuurde een nieuw moment terug`,
    '',
    `Contact: ${record.customer.name}`,
    `Datum: ${formatDutchDate(record.currentProposal.date)}`,
    record.currentProposal.secondaryDate ? `Tweede datum: ${formatDutchDate(record.currentProposal.secondaryDate)}` : '',
    `Moment: ${getPreferenceLabel(record.currentProposal.time)}`,
    calendarUrl ? `Zet voorstel in agenda: ${calendarUrl}` : '',
    actionUrl ? `Open afspraakdossier: ${actionUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `Nieuw demovoorstel: ${record.customer.company}`,
    html,
    text,
  };
}

export function buildDemoScheduleConfirmedCustomerEmail({
  record,
  calendarUrl,
  logoUrl,
  heroImageUrl,
}: DemoScheduleEmailContext) {
  const firstName = getFirstName(record.customer.name);
  const html = renderEmailShell({
    logoUrl,
    heroImageUrl,
    eyebrow: 'Afspraak bevestigd',
    title: `${firstName}, jullie demo staat vast`,
    intro: `De afspraak voor ${record.customer.company} is bevestigd. Hieronder staat het definitieve moment.`,
    body: `
      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Beste ${escapeHtml(firstName)},
      </p>
      ${renderRecordSummary(record)}
      ${renderPrimaryButton(calendarUrl, 'Importeer in agenda')}
      <p style="margin:0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Joost laat tijdens dit moment rustig zien hoe ${escapeHtml(record.customer.company)} kan starten en hoe dit er in de praktijk uitziet.
      </p>
    `,
  });

  const text = [
    `${firstName}, jullie demo staat vast`,
    '',
    `Datum: ${formatDutchDate(record.currentProposal.date)}`,
    `Moment: ${getPreferenceLabel(record.currentProposal.time)}`,
    calendarUrl ? `Importeer in agenda: ${calendarUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `${record.customer.company}: jullie demo is bevestigd`,
    html,
    text,
  };
}

export function buildDemoScheduleConfirmedAdminEmail({
  record,
  calendarUrl,
  logoUrl,
  heroImageUrl,
}: DemoScheduleEmailContext) {
  const html = renderEmailShell({
    logoUrl,
    heroImageUrl,
    eyebrow: 'Afspraak bevestigd',
    title: `Demo bevestigd voor ${record.customer.company}`,
    intro: `Het moment is nu definitief bevestigd. Hieronder staat het dossier nog één keer compact bij elkaar.`,
    body: `
      ${renderRecordSummary(record)}
      ${renderPrimaryButton(calendarUrl, 'Zet afspraak in agenda')}
      <p style="margin:0;font-size:16px;line-height:1.9;color:#FBEFD5;">
        Neem dit moment mee als definitieve afspraak.
      </p>
    `,
  });

  const text = [
    `Demo bevestigd voor ${record.customer.company}`,
    '',
    `Contact: ${record.customer.name}`,
    `Datum: ${formatDutchDate(record.currentProposal.date)}`,
    `Moment: ${getPreferenceLabel(record.currentProposal.time)}`,
    calendarUrl ? `Zet afspraak in agenda: ${calendarUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject: `Definitieve demo-afspraak: ${record.customer.company}`,
    html,
    text,
  };
}
