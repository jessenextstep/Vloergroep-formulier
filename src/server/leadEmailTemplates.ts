import { CalculationResults, LeadCaptureFormData, QuizState } from '../types';
import {
  LeadInsightProfile,
  buildLeadKpis,
  buildLeadSummary,
} from '../lib/leadProfile';
import { brandLogoEmailDataUri } from './emailBranding';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderSummaryRows(rows: { label: string; value: string }[]): string {
  return rows
    .map(
      (row) => `
        <tr>
          <td style="padding: 0 0 12px; color: #9fb0ab; font-size: 13px; width: 42%;">${escapeHtml(row.label)}</td>
          <td style="padding: 0 0 12px; color: #f8f3e7; font-size: 14px; font-weight: 600;">${escapeHtml(row.value)}</td>
        </tr>
      `,
    )
    .join('');
}

function renderBulletList(items: string[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 0 0 12px; vertical-align: top; color: #d6a440; font-size: 18px; line-height: 1;">•</td>
          <td style="padding: 0 0 12px 10px; color: #d8ddd9; font-size: 14px; line-height: 1.6;">${escapeHtml(item)}</td>
        </tr>
      `,
    )
    .join('');
}

function renderKpiCards(results: CalculationResults): string {
  return buildLeadKpis(results)
    .map(
      (kpi) => `
        <td style="width: 33.33%; padding: 0 6px 12px; vertical-align: top;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; background: #101c1c;">
            <tr>
              <td style="padding: 18px;">
                <div style="color: #d6a440; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${escapeHtml(kpi.label)}</div>
                <div style="color: #f8f3e7; font-size: 22px; line-height: 1.2; font-weight: 700; margin-bottom: 10px;">${escapeHtml(kpi.value)}</div>
                <div style="color: #9fb0ab; font-size: 13px; line-height: 1.5;">${escapeHtml(kpi.caption)}</div>
              </td>
            </tr>
          </table>
        </td>
      `,
    )
    .join('');
}

function renderLeadBadge(label: string, tone: 'gold' | 'muted' = 'gold'): string {
  const background = tone === 'gold' ? 'rgba(214,164,64,0.12)' : 'rgba(255,255,255,0.06)';
  const color = tone === 'gold' ? '#f6cd72' : '#d8ddd9';
  return `<span style="display: inline-block; margin: 0 8px 8px 0; padding: 8px 12px; border-radius: 999px; background: ${background}; color: ${color}; font-size: 12px; font-weight: 600;">${escapeHtml(label)}</span>`;
}

function renderEmailHeader() {
  return `
    <tr>
      <td style="padding: 28px 34px 0;">
        <img
          src="${brandLogoEmailDataUri}"
          alt="VloerGroep"
          width="148"
          style="display: block; width: 148px; height: auto; border: 0;"
        />
      </td>
    </tr>
  `;
}

function wrapEmail(content: string, previewText: string): string {
  return `
    <!DOCTYPE html>
    <html lang="nl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>VloerGroep</title>
      </head>
      <body style="margin: 0; padding: 0; background: #071111; color: #f8f3e7; font-family: Inter, Arial, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(previewText)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: radial-gradient(circle at top, rgba(214,164,64,0.14), rgba(7,17,17,0) 35%), #071111;">
          <tr>
            <td align="center" style="padding: 28px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; background: #0b1717; border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; overflow: hidden;">
                ${renderEmailHeader()}
                ${content}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function buildCustomerConfirmationEmail({
  contact,
  state,
  results,
  profile,
  demoUrl,
}: {
  contact: LeadCaptureFormData;
  state: QuizState;
  results: CalculationResults;
  profile: LeadInsightProfile;
  demoUrl: string;
}) {
  const summaryRows = buildLeadSummary(state, results, contact.intent);
  const companyLabel = contact.company || 'jouw bedrijf';

  const html = wrapEmail(
    `
      <tr>
        <td style="padding: 34px 34px 20px;">
          ${renderLeadBadge('VloerGroep Groeiscan')}
          ${renderLeadBadge(profile.primaryAngle, 'muted')}
          <div style="font-size: 34px; line-height: 1.15; font-weight: 800; letter-spacing: -0.03em; margin: 10px 0 14px;">
            Je groeiscan voor ${escapeHtml(companyLabel)} staat klaar
          </div>
          <div style="color: #c8d0cd; font-size: 16px; line-height: 1.7;">
            We hebben je gegevens ontvangen en meteen een overzicht voor je klaargezet. Hieronder zie je waar volgens jouw scan de snelste winst zit.
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 28px 8px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              ${renderKpiCards(results)}
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 34px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(214,164,64,0.18); border-radius: 22px; background: linear-gradient(180deg, rgba(214,164,64,0.12), rgba(214,164,64,0.03));">
            <tr>
              <td style="padding: 24px;">
                <div style="color: #f6cd72; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Persoonlijke conclusie</div>
                <div style="color: #f8f3e7; font-size: 20px; line-height: 1.35; font-weight: 700; margin-bottom: 12px;">${escapeHtml(profile.primaryAngle)}</div>
                <div style="color: #d8ddd9; font-size: 14px; line-height: 1.7;">${escapeHtml(profile.primaryMessage)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 28px 34px 0;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Jouw ingevulde keuzes</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderSummaryRows(summaryRows)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 34px 0;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Wat wij aanraden als volgende stap</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderBulletList(profile.opportunities.slice(0, 3))}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px 34px 34px;">
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <td style="border-radius: 999px; background: #d6a440;">
                <a href="${escapeHtml(demoUrl)}" style="display: inline-block; padding: 14px 22px; color: #071111; font-size: 14px; font-weight: 700; text-decoration: none;">Bekijk de volgende stap</a>
              </td>
            </tr>
          </table>
          <div style="color: #8d9d99; font-size: 12px; line-height: 1.6; margin-top: 14px;">
            We gebruiken je gegevens alleen om deze scan op te volgen en je gericht verder te helpen.
          </div>
        </td>
      </tr>
    `,
    'Je VloerGroep groeiscan staat klaar.',
  );

  const text = [
    `Je groeiscan voor ${companyLabel} staat klaar.`,
    '',
    profile.primaryAngle,
    profile.primaryMessage,
    '',
    'Belangrijkste cijfers:',
    ...buildLeadKpis(results).map((kpi) => `- ${kpi.label}: ${kpi.value}`),
    '',
    'Jouw keuzes:',
    ...summaryRows.map((row) => `- ${row.label}: ${row.value}`),
    '',
    'Aanbevolen volgende stap:',
    ...profile.opportunities.slice(0, 3).map((item) => `- ${item}`),
    '',
    `Meer info: ${demoUrl}`,
  ].join('\n');

  return {
    subject: `Je VloerGroep groeiscan voor ${companyLabel} staat klaar`,
    html,
    text,
  };
}

export function buildInternalLeadEmail({
  contact,
  state,
  results,
  profile,
}: {
  contact: LeadCaptureFormData;
  state: QuizState;
  results: CalculationResults;
  profile: LeadInsightProfile;
}) {
  const summaryRows = buildLeadSummary(state, results, contact.intent);

  const html = wrapEmail(
    `
      <tr>
        <td style="padding: 34px 34px 20px;">
          ${renderLeadBadge(`Leadscore ${profile.score}/100`)}
          ${renderLeadBadge(profile.temperature, 'muted')}
          <div style="font-size: 30px; line-height: 1.15; font-weight: 800; letter-spacing: -0.03em; margin: 10px 0 14px;">
            Nieuwe VloerGroep lead: ${escapeHtml(contact.company || contact.name)}
          </div>
          <div style="color: #c8d0cd; font-size: 16px; line-height: 1.7;">
            ${escapeHtml(contact.name)} vroeg ${escapeHtml(contact.intent === 'demo' ? 'een demo' : 'meer uitleg')} aan via de groeiscan.
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 34px 20px;">
          ${renderLeadBadge(contact.email, 'muted')}
          ${renderLeadBadge(contact.phone, 'muted')}
          ${renderLeadBadge(profile.primaryAngle)}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 28px 8px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              ${renderKpiCards(results)}
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 34px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(214,164,64,0.18); border-radius: 22px; background: linear-gradient(180deg, rgba(214,164,64,0.12), rgba(214,164,64,0.03));">
            <tr>
              <td style="padding: 24px;">
                <div style="color: #f6cd72; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Beste openingshoek</div>
                <div style="color: #f8f3e7; font-size: 20px; line-height: 1.35; font-weight: 700; margin-bottom: 12px;">${escapeHtml(profile.primaryAngle)}</div>
                <div style="color: #d8ddd9; font-size: 14px; line-height: 1.7;">${escapeHtml(profile.primaryMessage)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 28px 34px 0;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Leadgegevens & scan</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderSummaryRows([
              { label: 'Naam', value: contact.name },
              { label: 'Bedrijf', value: contact.company },
              { label: 'E-mail', value: contact.email },
              { label: 'Telefoon', value: contact.phone },
              ...summaryRows,
            ])}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 34px 0;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Kansen</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderBulletList(profile.opportunities)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 34px 0;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Valkuilen</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderBulletList(profile.pitfalls)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 34px 34px;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Verkooptips & opvolging</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderBulletList([...profile.salesTips, profile.nextStep])}
          </table>
        </td>
      </tr>
    `,
    'Nieuwe VloerGroep lead binnengekomen.',
  );

  const text = [
    `Nieuwe lead: ${contact.company || contact.name}`,
    `Leadscore: ${profile.score}/100 (${profile.temperature})`,
    '',
    `Naam: ${contact.name}`,
    `Bedrijf: ${contact.company}`,
    `E-mail: ${contact.email}`,
    `Telefoon: ${contact.phone}`,
    '',
    `Beste openingshoek: ${profile.primaryAngle}`,
    profile.primaryMessage,
    '',
    'Scanoverzicht:',
    ...summaryRows.map((row) => `- ${row.label}: ${row.value}`),
    '',
    'Kansen:',
    ...profile.opportunities.map((item) => `- ${item}`),
    '',
    'Valkuilen:',
    ...profile.pitfalls.map((item) => `- ${item}`),
    '',
    'Verkooptips:',
    ...profile.salesTips.map((item) => `- ${item}`),
    `- ${profile.nextStep}`,
  ].join('\n');

  return {
    subject: `[Nieuwe lead] ${contact.company || contact.name} · ${profile.temperature} · ${contact.intent === 'demo' ? 'Demo' : 'Info'}`,
    html,
    text,
  };
}
