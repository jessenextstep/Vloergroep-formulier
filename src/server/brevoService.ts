import { LeadInsightProfile, getTeamSizeLabel } from '../lib/leadProfile.js';
import { formatDutchDate } from '../lib/dateFormat.js';
import {
  CalculationResults,
  DemoRequestFormData,
  DemoPreferenceTime,
  LeadCaptureFormData,
  QuizState,
} from '../types.js';

interface BrevoSyncOptions {
  apiKey: string;
  listIds?: number[];
  contact: LeadCaptureFormData;
  state: QuizState;
  results: CalculationResults;
  profile: LeadInsightProfile;
  submittedAt: number;
  source: string;
}

interface BrevoErrorBody {
  code?: string;
  message?: string;
}

interface DemoRequestBrevoSyncOptions {
  apiKey: string;
  listIds?: number[];
  request: DemoRequestFormData;
  submittedAt: number;
}

function buildDateOnly(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function getDemoPreferenceLabel(value: DemoPreferenceTime): string {
  switch (value) {
    case 'morning':
      return 'Ochtend';
    case 'afternoon':
      return 'Middag';
    case 'late-afternoon':
      return 'Einde middag';
  }
}

function getFirstName(fullName: string, preferredFirstName: string): string {
  if (preferredFirstName.trim()) {
    return preferredFirstName.trim();
  }

  const [firstName = ''] = fullName.trim().split(/\s+/);
  return firstName;
}

function compactAttributes(
  attributes: Record<string, string | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(attributes).filter(([, value]) => typeof value === 'string' && value.trim().length > 0),
  );
}

function buildBrevoAttributes({
  contact,
  state,
  results,
  profile,
  submittedAt,
  source,
}: Omit<BrevoSyncOptions, 'apiKey' | 'listIds'>): Record<string, string> {
  const firstName = getFirstName(contact.name, state.firstName);

  return compactAttributes({
    VOLLEDIGE_NAAM: contact.name,
    FIRSTNAME: firstName,
    TELEFOONNUMMER: contact.phone,
    BEDRIJF: contact.company,
    SOURCE: source,
    LEAD_INTENT: contact.intent,
    TEAM_GROOTTE: getTeamSizeLabel(state.teamCount),
    UURTARIEF: String(state.hourlyRate),
    FACTUREERBARE_UREN_PER_WEEK: String(state.hoursPerWeek),
    WERKWEKEN_PER_JAAR: String(state.weeksPerYear),
    TIJD_ADMIN: String(state.timeAdmin),
    TIJD_PLANNING: String(state.timePlanning),
    TIJD_COMMUNICATIE: String(state.timeComm),
    TIJD_BETALING: String(state.timePayment),
    BETAALTERMIJN_DAGEN: String(state.paymentDays),
    AANDEEL_VLOERGROEP_PROCENT: String(state.percentageVloergroep),
    GEMISTE_GROTE_PROJECTEN: String(state.missedProjects),
    EXTRA_OMZET_POTENTIE: String(Math.round(results.totals.totalExtraRevenue)),
    EXTRA_WINST_POTENTIE: String(Math.round(results.totals.totalExtraProfit)),
    EXTRA_CAPACITEIT_WEKEN: results.totals.totalExtraCapacityWeeks.toFixed(1),
    SNELLER_VRIJ_WERKKAPITAAL: String(Math.round(results.cashflow.fasterCashflow)),
    LEAD_SCORE: String(profile.score),
    LEAD_TEMPERATUUR: profile.temperature,
    PRIMAIRE_HAAK: profile.primaryAngle,
    AANBEVOLEN_VOLGENDE_STAP: profile.nextStep,
    SCAN_DATUM: buildDateOnly(submittedAt),
  });
}

async function parseBrevoError(response: Response): Promise<string> {
  const rawBody = await response.text();

  if (!rawBody) {
    return `Brevo request failed with status ${response.status}.`;
  }

  try {
    const data = JSON.parse(rawBody) as BrevoErrorBody;
    return data.message || data.code || `Brevo request failed with status ${response.status}.`;
  } catch {
    return rawBody.slice(0, 240);
  }
}

async function sendBrevoRequest(
  apiKey: string,
  path: string,
  body: Record<string, unknown>,
): Promise<void> {
  const response = await fetch(`https://api.brevo.com/v3${path}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseBrevoError(response));
  }
}

function isIgnorableListSyncError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const normalized = error.message.trim().toLowerCase();
  return normalized.includes('contact already in list');
}

function dedupeListIds(listIds: number[] | undefined): number[] {
  if (!listIds || listIds.length === 0) {
    return [];
  }

  return [...new Set(listIds.filter((value) => Number.isInteger(value) && value > 0))];
}

function buildDemoRequestAttributes({
  request,
  submittedAt,
}: Omit<DemoRequestBrevoSyncOptions, 'apiKey' | 'listIds'>): Record<string, string> {
  const firstName = getFirstName(request.name, '');

  return compactAttributes({
    VOLLEDIGE_NAAM: request.name,
    FIRSTNAME: firstName,
    TELEFOONNUMMER: request.phone,
    BEDRIJF: request.company,
    DEMO_AANGEVRAAGD: 'ja',
    DEMO_VERZOEK_DATUM: buildDateOnly(submittedAt),
    DEMO_VOORKEUR_1: formatDutchDate(request.preferredDatePrimary),
    DEMO_VOORKEUR_2: formatDutchDate(request.preferredDateSecondary),
    DEMO_DAGDEEL: getDemoPreferenceLabel(request.preferredTime),
    DEMO_OPMERKING: request.notes,
  });
}

export async function syncLeadToBrevo({
  apiKey,
  listIds,
  contact,
  state,
  results,
  profile,
  submittedAt,
  source,
}: BrevoSyncOptions): Promise<void> {
  const targetListIds = dedupeListIds(listIds);
  const attributes = buildBrevoAttributes({
    contact,
    state,
    results,
    profile,
    submittedAt,
    source,
  });

  await sendBrevoRequest(apiKey, '/contacts', {
    email: contact.email,
    attributes,
    updateEnabled: true,
    emailBlacklisted: false,
    smsBlacklisted: false,
  });

  for (const listId of targetListIds) {
    try {
      await sendBrevoRequest(apiKey, `/contacts/lists/${listId}/contacts/add`, {
        emails: [contact.email],
      });
    } catch (error) {
      if (!isIgnorableListSyncError(error)) {
        throw error;
      }
    }
  }
}

export async function syncDemoRequestToBrevo({
  apiKey,
  listIds,
  request,
  submittedAt,
}: DemoRequestBrevoSyncOptions): Promise<void> {
  const targetListIds = dedupeListIds(listIds);
  const attributes = buildDemoRequestAttributes({
    request,
    submittedAt,
  });

  await sendBrevoRequest(apiKey, '/contacts', {
    email: request.email,
    attributes,
    updateEnabled: true,
    emailBlacklisted: false,
    smsBlacklisted: false,
  });

  for (const listId of targetListIds) {
    try {
      await sendBrevoRequest(apiKey, `/contacts/lists/${listId}/contacts/add`, {
        emails: [request.email],
      });
    } catch (error) {
      if (!isIgnorableListSyncError(error)) {
        throw error;
      }
    }
  }
}
