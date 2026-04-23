interface InviteLookupResult {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  launchDate: string;
  launchTime: string;
  launchLocation: string;
  rsvpUrl: string;
}

interface InviteServiceOptions {
  apiKey?: string;
  launchDate?: string;
  launchTime?: string;
  launchLocation?: string;
  rsvpUrl?: string;
}

interface BrevoContactResponse {
  email?: string;
  attributes?: Record<string, unknown>;
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
    rsvpUrl: options.rsvpUrl || process.env.INVITE_RSVP_URL || '',
  };
}
