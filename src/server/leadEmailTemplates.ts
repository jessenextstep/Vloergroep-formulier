import { CalculationResults, LeadCaptureFormData, QuizState } from '../types.js';
import {
  LeadInsightProfile,
  buildLeadKpis,
  buildLeadSummary,
} from '../lib/leadProfile.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function shortenCopy(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clipped = normalized.slice(0, maxLength).trim();
  const breakpoint = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, breakpoint > 80 ? breakpoint : clipped.length)}...`;
}

function renderSummaryRows(rows: { label: string; value: string }[]): string {
  return rows
    .map(
      (row) => `
        <tr>
          <td style="padding: 0 0 12px; color: #97a7a3; font-size: 13px; width: 42%;">${escapeHtml(row.label)}</td>
          <td style="padding: 0 0 12px; color: #f6f1e6; font-size: 14px; font-weight: 600;">${escapeHtml(row.value)}</td>
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
          <td style="padding: 0 0 12px 10px; color: #d7ddd8; font-size: 14px; line-height: 1.6;">${escapeHtml(item)}</td>
        </tr>
      `,
    )
    .join('');
}

function renderKpiRows(results: CalculationResults): string {
  return buildLeadKpis(results)
    .map(
      (kpi, index) => `
        <tr>
          <td style="padding: ${index === 0 ? '0' : '12px 0 0'};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; background: #0f1b1b;">
              <tr>
                <td style="padding: 18px 20px;">
                  <div style="color: #d6a440; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">${escapeHtml(kpi.label)}</div>
                  <div style="color: #f6f1e6; font-size: 24px; line-height: 1.15; font-weight: 700; margin-bottom: 8px;">${escapeHtml(kpi.value)}</div>
                  <div style="color: #97a7a3; font-size: 13px; line-height: 1.55;">${escapeHtml(kpi.caption)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `,
    )
    .join('');
}

function renderLeadBadge(label: string, tone: 'gold' | 'muted' = 'gold'): string {
  const background = tone === 'gold' ? 'rgba(214,164,64,0.12)' : 'rgba(255,255,255,0.06)';
  const color = tone === 'gold' ? '#f6cd72' : '#d8ddd9';
  return `<span style="display: inline-block; margin: 0 8px 8px 0; padding: 8px 12px; border-radius: 999px; background: ${background}; color: ${color}; font-size: 12px; font-weight: 600;">${escapeHtml(label)}</span>`;
}

function renderPanel(
  eyebrow: string,
  title: string,
  body: string,
  accent: 'gold' | 'muted' = 'muted',
) {
  const border =
    accent === 'gold' ? 'rgba(214,164,64,0.2)' : 'rgba(255,255,255,0.08)';
  const background =
    accent === 'gold'
      ? 'linear-gradient(180deg, rgba(214,164,64,0.12), rgba(214,164,64,0.04))'
      : '#0f1b1b';

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid ${border}; border-radius: 22px; background: ${background};">
      <tr>
        <td style="padding: 22px 24px;">
          <div style="color: #d6a440; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${escapeHtml(eyebrow)}</div>
          <div style="color: #f6f1e6; font-size: 20px; line-height: 1.35; font-weight: 700; margin-bottom: 10px;">${escapeHtml(title)}</div>
          <div style="color: #d7ddd8; font-size: 14px; line-height: 1.65;">${escapeHtml(body)}</div>
        </td>
      </tr>
    </table>
  `;
}

function renderEmailHeader(logoSrc?: string | null) {
  if (!logoSrc) {
    return `
      <tr>
        <td style="padding: 30px 34px 0; color: #f6f1e6; font-size: 22px; font-weight: 700; letter-spacing: -0.03em;">
          VloerGroep
        </td>
      </tr>
    `;
  }

  return `
    <tr>
      <td style="padding: 28px 34px 0;">
        <img
          src="${escapeHtml(logoSrc)}"
          alt="VloerGroep"
          width="148"
          style="display: block; width: 148px; height: auto; border: 0;"
        />
      </td>
    </tr>
  `;
}

function wrapEmail(content: string, previewText: string, logoSrc?: string | null): string {
  return `
    <!DOCTYPE html>
    <html lang="nl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>VloerGroep</title>
      </head>
      <body style="margin: 0; padding: 0; background: #071111; color: #f6f1e6; font-family: 'Space Grotesk', Inter, Arial, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(previewText)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #071111;">
          <tr>
            <td align="center" style="padding: 28px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; background: #0b1717; border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; overflow: hidden;">
                ${renderEmailHeader(logoSrc)}
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
  logoSrc,
}: {
  contact: LeadCaptureFormData;
  state: QuizState;
  results: CalculationResults;
  profile: LeadInsightProfile;
  logoSrc?: string | null;
}) {
  const summaryRows = buildLeadSummary(state, results, contact.intent).filter((row) =>
    ['Team', 'Regelwerk', 'Betaaltermijn', 'Aandeel via VloerGroep'].includes(row.label),
  );
  const companyLabel = contact.company || 'jouw bedrijf';
  const firstName = state.firstName || contact.name.split(' ')[0] || '';
  const openingLine = firstName ? `Dankjewel ${firstName}.` : 'Dankjewel.';
  const customerAngleCopy = `Voor ${companyLabel} ligt de snelste winst nu in ${profile.primaryAngle.toLowerCase()}. In een demo laten we zien wat dit concreet betekent voor planning, cashflow en groei.`;

  const html = wrapEmail(
    `
      <tr>
        <td style="padding: 34px 34px 18px;">
          ${renderLeadBadge('VloerGroep scan')}
          <div style="font-size: 30px; line-height: 1.15; font-weight: 800; letter-spacing: -0.03em; margin: 10px 0 14px;">
            Bevestiging van je scan
          </div>
          <div style="color: #c8d0cd; font-size: 16px; line-height: 1.7;">
            ${escapeHtml(openingLine)} Je aanvraag is goed ontvangen. Hieronder zie je kort waar voor ${escapeHtml(companyLabel)} nu de meeste winst zit.
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 34px 18px;">
          ${renderPanel(
            'Belangrijkste uitkomst',
            profile.primaryAngle,
            customerAngleCopy,
            'gold',
          )}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 34px 18px;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Belangrijkste cijfers</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderKpiRows(results)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 34px 8px;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Kort ingevuld</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderSummaryRows(summaryRows)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 34px 34px;">
          <div style="color: #8d9d99; font-size: 12px; line-height: 1.6;">
            Antwoord op deze mail als je alvast een voorkeursmoment wilt doorgeven.
          </div>
        </td>
      </tr>
    `,
    'Je aanvraag is ontvangen. Hieronder staat je korte overzicht.',
    logoSrc,
  );

  const text = [
    `Bevestiging van je scan voor ${companyLabel}.`,
    '',
    customerAngleCopy,
    '',
    'Belangrijkste cijfers:',
    ...buildLeadKpis(results).map((kpi) => `- ${kpi.label}: ${kpi.value}`),
    '',
    'Kort ingevuld:',
    ...summaryRows.map((row) => `- ${row.label}: ${row.value}`),
    '',
    'Antwoord op deze mail als je alvast een voorkeursmoment wilt doorgeven.',
  ].join('\n');

  return {
    subject: `Bevestiging van je scan voor ${companyLabel}`,
    html,
    text,
  };
}

export function buildInternalLeadEmail({
  contact,
  state,
  results,
  profile,
  logoSrc,
}: {
  contact: LeadCaptureFormData;
  state: QuizState;
  results: CalculationResults;
  profile: LeadInsightProfile;
  logoSrc?: string | null;
}) {
  const summaryRows = buildLeadSummary(state, results, contact.intent).filter((row) =>
    [
      'Team',
      'Uurtarief',
      'Regelwerk',
      'Betaaltermijn',
      'Aandeel via VloerGroep',
      'Gemiste grotere klussen',
      'Voorkeur',
    ].includes(row.label),
  );
  const adminLeadCopy = `Start op ${profile.primaryAngle.toLowerCase()}. Daar zit nu de meeste urgentie.`;

  const html = wrapEmail(
    `
      <tr>
        <td style="padding: 34px 34px 18px;">
          ${renderLeadBadge(`Leadscore ${profile.score}/100`)}
          ${renderLeadBadge(profile.temperature, 'muted')}
          ${renderLeadBadge(contact.intent === 'demo' ? 'Demo-aanvraag' : 'Info-aanvraag', 'muted')}
          <div style="font-size: 30px; line-height: 1.15; font-weight: 800; letter-spacing: -0.03em; margin: 10px 0 14px;">
            Nieuwe scan van ${escapeHtml(contact.company || contact.name)}
          </div>
          <div style="color: #c8d0cd; font-size: 16px; line-height: 1.7;">
            ${escapeHtml(contact.name)} vulde de scan in voor ${escapeHtml(contact.company)}. Hieronder staat de kortste route naar opvolging.
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 34px 18px;">
          ${renderPanel(
            'Contact',
            `${contact.name} · ${contact.company}`,
            `${contact.email} · ${contact.phone}`,
          )}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 34px 18px;">
          ${renderPanel(
            'Beste ingang',
            profile.primaryAngle,
            `${adminLeadCopy} ${shortenCopy(profile.primaryMessage, 150)}`,
            'gold',
          )}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 34px 18px;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Belangrijkste cijfers</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderKpiRows(results)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 34px 8px;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Scan in het kort</div>
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
            ${renderBulletList(profile.opportunities.slice(0, 2).map((item) => shortenCopy(item, 165)))}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 34px 0;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Valkuilen</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderBulletList(profile.pitfalls.slice(0, 2).map((item) => shortenCopy(item, 165)))}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 34px 34px;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Opvolging</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderBulletList([
              shortenCopy(profile.nextStep, 165),
              ...profile.salesTips.slice(0, 2).map((item) => shortenCopy(item, 165)),
            ])}
          </table>
        </td>
      </tr>
    `,
    'Nieuwe scan met contactgegevens, kansen en opvolging.',
    logoSrc,
  );

  const text = [
    `Nieuwe scan: ${contact.company || contact.name}`,
    `Leadscore: ${profile.score}/100 (${profile.temperature})`,
    '',
    `Naam: ${contact.name}`,
    `Bedrijf: ${contact.company}`,
    `E-mail: ${contact.email}`,
    `Telefoon: ${contact.phone}`,
    '',
    `Beste openingshoek: ${profile.primaryAngle}`,
    adminLeadCopy,
    '',
    'Scanoverzicht:',
    ...summaryRows.map((row) => `- ${row.label}: ${row.value}`),
    '',
    'Kansen:',
    ...profile.opportunities.slice(0, 2).map((item) => `- ${shortenCopy(item, 165)}`),
    '',
    'Valkuilen:',
    ...profile.pitfalls.slice(0, 2).map((item) => `- ${shortenCopy(item, 165)}`),
    '',
    'Opvolging:',
    `- ${shortenCopy(profile.nextStep, 165)}`,
    ...profile.salesTips.slice(0, 2).map((item) => `- ${shortenCopy(item, 165)}`),
  ].join('\n');

  return {
    subject: `Nieuwe scan van ${contact.company || contact.name}`,
    html,
    text,
  };
}
