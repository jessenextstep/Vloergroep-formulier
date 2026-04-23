export interface InviteLookupResult {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  launchDate: string;
  launchTime: string;
  launchLocation: string;
  calendarUrl: string;
}

interface InviteServiceOptions {
  apiKey?: string;
  launchDate?: string;
  launchTime?: string;
  launchLocation?: string;
  calendarUrl?: string;
  eventStartIso?: string;
  eventEndIso?: string;
  eventTitle?: string;
  eventDescription?: string;
}

interface BrevoContactResponse {
  email?: string;
  attributes?: Record<string, unknown>;
}

function normalizeAbsoluteUrl(value?: string): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}

function formatCalendarDate(value?: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function parseLaunchDateParts(value?: string): { year: number; month: number; day: number } | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  let match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  match = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (match) {
    return {
      day: Number(match[1]),
      month: Number(match[2]),
      year: Number(match[3]),
    };
  }

  const fallback = new Date(trimmed);
  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return {
    year: fallback.getUTCFullYear(),
    month: fallback.getUTCMonth() + 1,
    day: fallback.getUTCDate(),
  };
}

function parseLaunchTimeParts(value?: string): { start: string; end: string } | null {
  if (!value) {
    return null;
  }

  const matches = [...value.matchAll(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g)];
  if (!matches.length) {
    return null;
  }

  const toMinutes = (hour: number, minute: number) => hour * 60 + minute;
  const toCalendarTime = (totalMinutes: number) => {
    const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hours = String(Math.floor(normalized / 60)).padStart(2, '0');
    const minutes = String(normalized % 60).padStart(2, '0');
    return `${hours}${minutes}00`;
  };

  const startMinutes = toMinutes(Number(matches[0][1]), Number(matches[0][2]));
  const endMinutes =
    matches.length > 1
      ? toMinutes(Number(matches[1][1]), Number(matches[1][2]))
      : startMinutes + 180;

  return {
    start: toCalendarTime(startMinutes),
    end: toCalendarTime(endMinutes),
  };
}

function buildCalendarFromLaunchFields(options: InviteServiceOptions): string {
  const launchDate = options.launchDate || process.env.INVITE_LAUNCH_DATE;
  const launchTime = options.launchTime || process.env.INVITE_LAUNCH_TIME;
  const dateParts = parseLaunchDateParts(launchDate);
  const timeParts = parseLaunchTimeParts(launchTime);

  if (!dateParts || !timeParts) {
    return '';
  }

  const datePrefix = `${String(dateParts.year).padStart(4, '0')}${String(dateParts.month).padStart(2, '0')}${String(dateParts.day).padStart(2, '0')}`;
  const title = options.eventTitle || process.env.INVITE_EVENT_TITLE || 'Officiele opening VloerGroep';
  const details =
    options.eventDescription ||
    process.env.INVITE_EVENT_DESCRIPTION ||
    'Persoonlijke uitnodiging voor de officiele opening van VloerGroep.';
  const location = options.launchLocation || process.env.INVITE_LAUNCH_LOCATION || '';

  const calendarUrl = new URL('https://calendar.google.com/calendar/render');
  calendarUrl.searchParams.set('action', 'TEMPLATE');
  calendarUrl.searchParams.set('text', title);
  calendarUrl.searchParams.set('dates', `${datePrefix}T${timeParts.start}/${datePrefix}T${timeParts.end}`);
  calendarUrl.searchParams.set('details', details);

  if (location) {
    calendarUrl.searchParams.set('location', location);
  }

  return calendarUrl.toString();
}

function buildGoogleCalendarUrl(options: InviteServiceOptions): string {
  if (options.calendarUrl) {
    const normalized = normalizeAbsoluteUrl(options.calendarUrl);
    if (normalized) {
      return normalized;
    }
  }

  const start = formatCalendarDate(options.eventStartIso || process.env.INVITE_EVENT_START_ISO);
  const end = formatCalendarDate(options.eventEndIso || process.env.INVITE_EVENT_END_ISO);

  if (!start || !end) {
    return buildCalendarFromLaunchFields(options);
  }

  const title = options.eventTitle || process.env.INVITE_EVENT_TITLE || 'Officiele opening VloerGroep';
  const details =
    options.eventDescription ||
    process.env.INVITE_EVENT_DESCRIPTION ||
    'Persoonlijke uitnodiging voor de officiele opening van VloerGroep.';
  const location = options.launchLocation || process.env.INVITE_LAUNCH_LOCATION || '';

  const calendarUrl = new URL('https://calendar.google.com/calendar/render');
  calendarUrl.searchParams.set('action', 'TEMPLATE');
  calendarUrl.searchParams.set('text', title);
  calendarUrl.searchParams.set('dates', `${start}/${end}`);
  calendarUrl.searchParams.set('details', details);

  if (location) {
    calendarUrl.searchParams.set('location', location);
  }

  return calendarUrl.toString();
}

function normalizeBase64Input(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').trim();
  const padding = normalized.length % 4;

  if (padding === 0) {
    return normalized;
  }

  return `${normalized}${'='.repeat(4 - padding)}`;
}

export function decodeInviteEmail(encodedEmail: string): string {
  if (!encodedEmail.trim()) {
    throw new Error('Missing invite payload.');
  }

  try {
    const decoded = Buffer.from(normalizeBase64Input(encodedEmail), 'base64').toString('utf8').trim();

    if (!decoded || !decoded.includes('@')) {
      throw new Error('Invalid invite payload.');
    }

    return decoded.toLowerCase();
  } catch {
    throw new Error('Invalid invite payload.');
  }
}

async function parseBrevoError(response: Response): Promise<string> {
  const rawBody = await response.text();

  if (!rawBody) {
    return `Brevo request failed with status ${response.status}.`;
  }

  try {
    const body = JSON.parse(rawBody) as { message?: string; code?: string };
    return body.message || body.code || `Brevo request failed with status ${response.status}.`;
  } catch {
    return rawBody.slice(0, 240);
  }
}

export async function getInviteByEncodedEmail(
  encodedEmail: string,
  options: InviteServiceOptions,
): Promise<InviteLookupResult> {
  const apiKey = options.apiKey || process.env.BREVO_API;

  if (!apiKey) {
    throw new Error('Missing BREVO_API environment variable.');
  }

  const email = decodeInviteEmail(encodedEmail);
  const response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
    },
  });

  if (response.status === 404) {
    throw new Error('Invitation contact not found.');
  }

  if (!response.ok) {
    throw new Error(await parseBrevoError(response));
  }

  const contact = (await response.json()) as BrevoContactResponse;
  const attributes = contact.attributes ?? {};

  return {
    firstName: String(attributes.FIRSTNAME ?? ''),
    lastName: String(attributes.LASTNAME ?? ''),
    company: String(attributes.BEDRIJF ?? ''),
    email: String(contact.email ?? email),
    launchDate: options.launchDate || process.env.INVITE_LAUNCH_DATE || '',
    launchTime: options.launchTime || process.env.INVITE_LAUNCH_TIME || '',
    launchLocation: options.launchLocation || process.env.INVITE_LAUNCH_LOCATION || '',
    calendarUrl: buildGoogleCalendarUrl({
      ...options,
      launchLocation: options.launchLocation || process.env.INVITE_LAUNCH_LOCATION || '',
    }),
  };
}
