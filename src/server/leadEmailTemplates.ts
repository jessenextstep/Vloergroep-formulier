import { CalculationResults, LeadCaptureFormData, QuizState } from '../types.js';
import {
  LeadInsightProfile,
  buildLeadKpis,
  buildLeadSummary,
  getPaymentDaysLabel,
  getTeamSizeLabel,
} from '../lib/leadProfile.js';
import { formatCurrency, formatNumber } from '../lib/utils.js';

interface StoryBlock {
  eyebrow: string;
  title: string;
  metric: string;
  body: string;
}

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

function renderStoryBlocks(items: StoryBlock[]): string {
  return items
    .map(
      (item, index) => `
        <tr>
          <td style="padding: ${index === 0 ? '0' : '14px 0 0'};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; background: #0f1b1b;">
              <tr>
                <td style="padding: 22px 24px;">
                  <div style="color: #d6a440; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">${escapeHtml(item.eyebrow)}</div>
                  <div style="color: #f6f1e6; font-size: 20px; line-height: 1.35; font-weight: 700; margin-bottom: 8px;">${escapeHtml(item.title)}</div>
                  <div style="color: #f6cd72; font-size: 18px; line-height: 1.25; font-weight: 700; margin-bottom: 10px;">${escapeHtml(item.metric)}</div>
                  <div style="color: #d7ddd8; font-size: 14px; line-height: 1.68;">${escapeHtml(item.body)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `,
    )
    .join('');
}

function getMissedProjectsLabel(value: QuizState['missedProjects']): string {
  if (value === 0) {
    return 'geen gemiste grotere klussen';
  }

  if (value >= 20) {
    return '20 of meer gemiste grotere klussen per jaar';
  }

  return `${value} gemiste grotere ${value === 1 ? 'klus' : 'klussen'} per jaar`;
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

function buildCustomerStoryBlocks({
  companyLabel,
  state,
  results,
}: {
  companyLabel: string;
  state: QuizState;
  results: CalculationResults;
}): StoryBlock[] {
  const paymentLabel = getPaymentDaysLabel(state.paymentDays).toLowerCase();
  const totalHoursSaved = formatNumber(
    results.timeSaved.hoursPerWeekSaved,
    results.timeSaved.hoursPerWeekSaved % 1 === 0 ? 0 : 1,
  );
  const monetizableHoursYear = formatNumber(results.timeSaved.monetizableHoursYear, 0);
  const extraProjectsYear = formatNumber(results.growthLeads.extraProjectsYear, 1);
  const extraHoursYear = formatNumber(results.growthLeads.extraHoursYear, 0);
  const blocks: StoryBlock[] = [];

  if (results.timeSaved.extraRevenueTime > 0) {
    blocks.push({
      eyebrow: '1. Minder regelwerk',
      title: 'Tijd terug in de werkweek',
      metric: `${formatCurrency(results.timeSaved.extraRevenueTime)} omzetpotentie per jaar`,
      body:
        `In je scan gaf je aan dat administratie, planning, communicatie en betalingen samen ongeveer ${totalHoursSaved} uur per week kosten in jullie hele organisatie.` +
        ` Doordat VloerGroep dit in één flow samenbrengt, komt voor ${companyLabel} die tijd weer vrij voor werk dat wél factureerbaar is.` +
        ` Tegen ${formatCurrency(state.hourlyRate)} ex. btw en ${state.weeksPerYear} werkweken onderbouwt dat circa ${formatCurrency(results.timeSaved.extraRevenueTime)} extra omzetpotentie uit ${monetizableHoursYear} inzetbare uren.`,
    });
  }

  if (results.growthLeads.extraRevenueLeads > 0) {
    blocks.push({
      eyebrow: '2. Betere matching',
      title: 'Meer omzet uit beter passende klussen',
      metric: `${formatCurrency(results.growthLeads.extraRevenueLeads)} extra omzet via leads`,
      body:
        `VloerGroep stuurt niet zomaar meer aanvragen door, maar vooral beter passende klussen op basis van capaciteit en type werk.` +
        ` In deze scan rekenen we daarom bewust conservatief met ongeveer ${extraProjectsYear} extra passende opdrachten per jaar voor een bedrijf met ${getTeamSizeLabel(state.teamCount).toLowerCase()}.` +
        ` Omgerekend naar ${extraHoursYear} extra factureerbare uren tegen ${formatCurrency(state.hourlyRate)} ex. btw komt dat uit op circa ${formatCurrency(results.growthLeads.extraRevenueLeads)} extra omzetpotentie.`,
    });
  }

  if (results.growthCollaboration.extraRevenueTeam > 0 && state.missedProjects > 0) {
    blocks.push({
      eyebrow: '3. Netwerkeffect',
      title: 'Grotere klussen niet meer laten lopen',
      metric: `${formatCurrency(results.growthCollaboration.extraRevenueTeam)} via samenwerking`,
      body:
        `Je gaf aan dat er ${getMissedProjectsLabel(state.missedProjects)} blijven liggen doordat ze te groot zijn of niet in de planning passen.` +
        ` Juist daar werkt het netwerkeffect van VloerGroep: capaciteit bijschakelen, werk verdelen en projecten samen afronden.` +
        ` Voor ${companyLabel} telt dat in deze scan mee voor ongeveer ${formatCurrency(results.growthCollaboration.extraRevenueTeam)} extra omzetpotentie die nu buiten bereik blijft.`,
    });
  }

  if (results.cashflow.fasterCashflow > 0) {
    blocks.push({
      eyebrow: '4. Betaling & depot',
      title: 'Sneller geld beschikbaar in je bedrijf',
      metric: `${formatCurrency(results.cashflow.fasterCashflow)} sneller vrij werkkapitaal`,
      body:
        `Je huidige betaaltermijn ligt op ${paymentLabel} en je gaf aan dat ${state.percentageVloergroep}% van je omzet via VloerGroep zou kunnen lopen.` +
        ` Met projectdepot en vooraf geborgde betalingen hoeft dat deel minder lang in openstaande posten te blijven hangen.` +
        ` Daarom rekenen we voor ${companyLabel} met ongeveer ${formatCurrency(results.cashflow.fasterCashflow)} sneller beschikbaar werkkapitaal.` +
        ` Dat betekent in de praktijk: geld sneller op je rekening, eerder opnieuw kunnen investeren, materiaal en materieel sneller weer kunnen bestellen en dus minder vaak op groei hoeven wachten.`,
    });
  }

  return blocks;
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
  demoRequestUrl,
}: {
  contact: LeadCaptureFormData;
  state: QuizState;
  results: CalculationResults;
  profile: LeadInsightProfile;
  logoSrc?: string | null;
  demoRequestUrl?: string | null;
}) {
  const summaryRows = buildLeadSummary(state, results, contact.intent).filter((row) =>
    ['Mensen in uitvoering', 'Regelwerk organisatie', 'Betaaltermijn', 'Aandeel via VloerGroep'].includes(row.label),
  );
  const companyLabel = contact.company || 'jouw bedrijf';
  const firstName = state.firstName || contact.name.split(' ')[0] || '';
  const openingLine = firstName ? `Dankjewel ${firstName}.` : 'Dankjewel.';
  const isAdsScan = contact.intent === 'scan';
  const customerAngleCopy = isAdsScan
    ? `Voor ${companyLabel} zit op dit moment de grootste versneller in ${profile.primaryAngle.toLowerCase()}. De cijfers hieronder zijn niet op gevoel ingevuld, maar opgebouwd uit jouw antwoorden en uit de manier waarop VloerGroep tijd, opdrachten, samenwerking en betalingen strakker organiseert.`
    : `Voor ${companyLabel} ligt de snelste winst nu in ${profile.primaryAngle.toLowerCase()}. In een demo laten we zien wat dit concreet betekent voor planning, cashflow en groei.`;
  const storyBlocks = isAdsScan
    ? buildCustomerStoryBlocks({
        companyLabel,
        state,
        results,
      })
    : [];
  const closingLine = isAdsScan
    ? `Wil je dat Rico deze berekening kort naast jullie huidige werkwijze legt voor ${companyLabel}? Antwoord dan gewoon op deze mail. Dan kijken we samen waar de snelste winst voor jullie zit.`
    : 'Antwoord op deze mail als je alvast een voorkeursmoment wilt doorgeven.';
  const customerHeading = isAdsScan ? 'Je scan staat klaar' : 'Bevestiging van je scan';
  const customerPreview = isAdsScan
    ? 'Je persoonlijke scan staat klaar met tijdwinst, cashflow en groeikansen.'
    : 'Je aanvraag is ontvangen. Hieronder staat je korte overzicht.';
  const subject = isAdsScan
    ? `Je VloerGroep scan voor ${companyLabel}`
    : `Bevestiging van je scan voor ${companyLabel}`;
  const demoCallout =
    isAdsScan && demoRequestUrl
      ? `
      <tr>
        <td style="padding: 0 34px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(214,164,64,0.18); border-radius: 22px; background: linear-gradient(180deg, rgba(214,164,64,0.12), rgba(214,164,64,0.04));">
            <tr>
              <td style="padding: 22px 24px;">
                <div style="color: #d6a440; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">Persoonlijke demo</div>
                <div style="color: #f6f1e6; font-size: 22px; line-height: 1.35; font-weight: 700; margin-bottom: 10px;">Zien hoe dit er voor ${escapeHtml(companyLabel)} in de praktijk uitziet?</div>
                <div style="color: #d7ddd8; font-size: 14px; line-height: 1.7; margin-bottom: 18px;">
                  Als je wilt, kun je hieronder rustig een voorkeursmoment doorgeven voor een persoonlijke demo met Joost van VloerGroep. In die demo laat hij zien hoe jullie kunnen starten, waar voor ${escapeHtml(companyLabel)} de eerste winst zit en hoe dit er in de praktijk uitziet.
                </div>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="border-radius:999px;background-color:#E0AC3E;">
                      <a href="${demoRequestUrl}" style="display:inline-block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;color:#050505;text-decoration:none;border-radius:999px;">
                        Plan een demonstratie ->
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
      : '';

  const html = wrapEmail(
    `
      <tr>
        <td style="padding: 34px 34px 18px;">
          ${renderLeadBadge(isAdsScan ? 'Persoonlijke scan' : 'VloerGroep scan')}
          <div style="font-size: 30px; line-height: 1.15; font-weight: 800; letter-spacing: -0.03em; margin: 10px 0 14px;">
            ${customerHeading}
          </div>
          <div style="color: #c8d0cd; font-size: 16px; line-height: 1.7;">
            ${escapeHtml(openingLine)} ${isAdsScan ? 'Je antwoorden zijn verwerkt.' : 'Je aanvraag is goed ontvangen.'} Hieronder zie je kort waar voor ${escapeHtml(companyLabel)} nu de meeste winst zit.
          </div>
          <div style="color: #8d9d99; font-size: 12px; line-height: 1.6; margin-top: 10px;">
            Alle bedragen in deze scan zijn indicatief en ex. btw.
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
      ${
        isAdsScan
          ? `
      <tr>
        <td style="padding: 0 34px 18px;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Zo bouwt VloerGroep deze uitkomst voor ${escapeHtml(companyLabel)} op</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderStoryBlocks(storyBlocks)}
          </table>
        </td>
      </tr>`
          : ''
      }
      ${demoCallout}
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
            ${escapeHtml(closingLine)}
          </div>
        </td>
      </tr>
    `,
    customerPreview,
    logoSrc,
  );

  const text = [
    `${customerHeading} voor ${companyLabel}.`,
    '',
    customerAngleCopy,
    '',
    'Belangrijkste cijfers:',
    ...buildLeadKpis(results).map((kpi) => `- ${kpi.label}: ${kpi.value}`),
    '',
    ...(isAdsScan
      ? [
          `Zo bouwt VloerGroep deze uitkomst voor ${companyLabel} op:`,
          ...storyBlocks.map((item) => `- ${item.title}: ${item.metric}. ${item.body}`),
          '',
          ...(demoRequestUrl
            ? [
                `Wil je dit voor ${companyLabel} rustig in de praktijk zien? Plan dan hier een demonstratie met Joost van VloerGroep: ${demoRequestUrl}`,
                '',
              ]
            : []),
        ]
      : []),
    'Kort ingevuld:',
    ...summaryRows.map((row) => `- ${row.label}: ${row.value}`),
    '',
    closingLine,
  ].join('\n');

  return {
    subject,
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
      'Mensen in uitvoering',
      'Uurtarief ex. btw',
      'Regelwerk organisatie',
      'Betaaltermijn',
      'Aandeel via VloerGroep',
      'Gemiste grotere klussen',
      'Voorkeur',
    ].includes(row.label),
  );
  const isAdsScan = contact.intent === 'scan';
  const companyLabel = contact.company || 'dit bedrijf';
  const adminLeadCopy = `Open het gesprek bij ${profile.primaryAngle.toLowerCase()}. Daar is de kans het grootst dat ${companyLabel} zich meteen in herkent.`;
  const contactDetails = [contact.email, contact.phone].filter(Boolean).join(' · ');
  const leadTypeBadge = isAdsScan
    ? 'Scan via advertentie'
    : contact.intent === 'demo'
      ? 'Demo-aanvraag'
      : 'Info-aanvraag';
  const internalSubject = isAdsScan
    ? `Nieuwe scan via advertentie van ${contact.company || contact.name}`
    : `Nieuwe scan van ${contact.company || contact.name}`;
  const internalPreview = isAdsScan
    ? 'Nieuwe scan via advertentie. De persoonlijke scan is al verstuurd.'
    : 'Nieuwe scan met bedrijfssituatie en eerste belnotities.';
  const adminIntro = isAdsScan
    ? `${contact.name} vulde de scan in voor ${companyLabel}. De persoonlijke scan is al verstuurd. Hieronder zie je waar dit bedrijf waarschijnlijk het eerst op aanhaakt.`
    : `${contact.name} vulde de scan in voor ${companyLabel}. Hieronder zie je wat er bij dit bedrijf het meest opvalt en waar je het gesprek het beste kunt openen.`;

  const html = wrapEmail(
    `
      <tr>
        <td style="padding: 34px 34px 18px;">
          ${renderLeadBadge(`Prioriteit ${profile.score}/100`)}
          ${renderLeadBadge(profile.temperature, 'muted')}
          ${renderLeadBadge(leadTypeBadge, 'muted')}
          <div style="font-size: 30px; line-height: 1.15; font-weight: 800; letter-spacing: -0.03em; margin: 10px 0 14px;">
            ${escapeHtml(internalSubject)}
          </div>
          <div style="color: #c8d0cd; font-size: 16px; line-height: 1.7;">
            ${escapeHtml(adminIntro)}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 34px 18px;">
          ${renderPanel(
            'Contact',
            `${contact.name} · ${contact.company}`,
            contactDetails,
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
              ...(contact.phone ? [{ label: 'Telefoon', value: contact.phone }] : []),
              ...summaryRows,
            ])}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 34px 0;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Wat hier speelt</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderBulletList(profile.opportunities.slice(0, 2).map((item) => shortenCopy(item, 165)))}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 34px 0;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Let hier op</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderBulletList(profile.pitfalls.slice(0, 2).map((item) => shortenCopy(item, 165)))}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 34px 34px;">
          <div style="font-size: 18px; line-height: 1.3; font-weight: 700; margin-bottom: 12px;">Eerste aanpak</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${renderBulletList([
              shortenCopy(profile.nextStep, 165),
              ...profile.salesTips.slice(0, 2).map((item) => shortenCopy(item, 165)),
            ])}
          </table>
        </td>
      </tr>
    `,
    internalPreview,
    logoSrc,
  );

  const text = [
    internalSubject,
    `Prioriteit: ${profile.score}/100 (${profile.temperature})`,
    '',
    `Naam: ${contact.name}`,
    `Bedrijf: ${contact.company}`,
    `E-mail: ${contact.email}`,
    ...(contact.phone ? [`Telefoon: ${contact.phone}`] : []),
    '',
    `Beste ingang: ${profile.primaryAngle}`,
    adminLeadCopy,
    '',
    'Scanoverzicht:',
    ...summaryRows.map((row) => `- ${row.label}: ${row.value}`),
    '',
    'Wat hier speelt:',
    ...profile.opportunities.slice(0, 2).map((item) => `- ${shortenCopy(item, 165)}`),
    '',
    'Let hier op:',
    ...profile.pitfalls.slice(0, 2).map((item) => `- ${shortenCopy(item, 165)}`),
    '',
    'Eerste aanpak:',
    `- ${shortenCopy(profile.nextStep, 165)}`,
    ...profile.salesTips.slice(0, 2).map((item) => `- ${shortenCopy(item, 165)}`),
  ].join('\n');

  return {
    subject: internalSubject,
    html,
    text,
  };
}
