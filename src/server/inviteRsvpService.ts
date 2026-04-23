import { buildEmailLogoUrl } from './emailBranding.js';
import {
  getInviteByEncodedEmail,
  type InviteLookupResult,
} from './inviteService.js';
import {
  buildInviteAcceptedAdminEmail,
  buildInviteAcceptedCustomerEmail,
} from './inviteEmailTemplates.js';

interface InviteRsvpEnvironment {
  brevoApiKey?: string;
  senderEmail?: string;
  adminEmail?: string;
  siteUrl?: string;
  launchDate?: string;
  launchTime?: string;
  launchLocation?: string;
  calendarUrl?: string;
  eventStartIso?: string;
  eventEndIso?: string;
  eventTitle?: string;
  eventDescription?: string;
}

interface InviteRsvpRequest {
  e?: string;
}

interface InviteRsvpResponse {
  ok: boolean;
  message?: string;
  invite?: InviteLookupResult;
}

interface BrevoTransactionalPayload {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: {
    email: string;
    name?: string;
  };
  tags?: string[];
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
    return new URL(withProtocol).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function resolveSiteUrl(env: InviteRsvpEnvironment): string | undefined {
  const candidates = [
    env.siteUrl,
    process.env.PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeAbsoluteUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function extractEmailAddress(value?: string): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const angleMatch = trimmed.match(/<([^>]+)>/);
  const candidate = (angleMatch?.[1] ?? trimmed).trim().replace(/^['"]+|['"]+$/g, '');

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : null;
}

function buildSenderEmail(value?: string): { name: string; email: string } {
  const emailAddress =
    extractEmailAddress(value) ||
    extractEmailAddress(process.env.BREVO_FROM_EMAIL) ||
    extractEmailAddress(process.env.RESEND_FROM_EMAIL);

  if (!emailAddress) {
    throw new Error('Missing sender email for invite confirmations.');
  }

  return {
    name: 'VloerGroep',
    email: emailAddress,
  };
}

function getAdminEmail(env: InviteRsvpEnvironment): string {
  const adminEmail =
    extractEmailAddress(env.adminEmail) ||
    extractEmailAddress(process.env.INVITE_ADMIN_EMAIL) ||
    extractEmailAddress(process.env.LEAD_NOTIFICATION_EMAIL) ||
    extractEmailAddress(env.senderEmail) ||
    extractEmailAddress(process.env.BREVO_FROM_EMAIL) ||
    extractEmailAddress(process.env.RESEND_FROM_EMAIL);

  if (!adminEmail) {
    throw new Error('Missing admin confirmation email.');
  }

  return adminEmail;
}

async function parseBrevoError(response: Response): Promise<string> {
  const rawBody = await response.text();

  if (!rawBody) {
    return `Brevo request failed with status ${response.status}.`;
  }

  try {
    const data = JSON.parse(rawBody) as { message?: string; code?: string };
    return data.message || data.code || `Brevo request failed with status ${response.status}.`;
  } catch {
    return rawBody.slice(0, 240);
  }
}

async function sendBrevoTransactionalEmail(
  apiKey: string,
  payload: BrevoTransactionalPayload,
): Promise<void> {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseBrevoError(response));
  }
}

function getRecipientName(invite: InviteLookupResult): string {
  return [invite.firstName, invite.lastName].filter(Boolean).join(' ').trim() || invite.email;
}

export async function processInviteRsvp(
  payload: InviteRsvpRequest,
  env: InviteRsvpEnvironment = {},
): Promise<{ status: number; body: InviteRsvpResponse }> {
  const encodedInvite = typeof payload.e === 'string' ? payload.e.trim() : '';

  if (!encodedInvite) {
    return {
      status: 400,
      body: {
        ok: false,
        message: 'Missing invite parameter.',
      },
    };
  }

  try {
    const apiKey = env.brevoApiKey || process.env.BREVO_API;
    if (!apiKey) {
      throw new Error('Missing BREVO_API environment variable.');
    }

    const invite = await getInviteByEncodedEmail(encodedInvite, {
      apiKey,
      launchDate: env.launchDate,
      launchTime: env.launchTime,
      launchLocation: env.launchLocation,
      calendarUrl: env.calendarUrl,
      eventStartIso: env.eventStartIso,
      eventEndIso: env.eventEndIso,
      eventTitle: env.eventTitle,
      eventDescription: env.eventDescription,
    });

    const sender = buildSenderEmail(env.senderEmail);
    const adminEmail = getAdminEmail(env);
    const siteUrl = resolveSiteUrl(env);
    const logoUrl = buildEmailLogoUrl(siteUrl);
    const customerEmail = buildInviteAcceptedCustomerEmail({ invite, logoUrl });
    const adminNotificationEmail = buildInviteAcceptedAdminEmail({ invite, logoUrl });
    const recipientName = getRecipientName(invite);

    await Promise.all([
      sendBrevoTransactionalEmail(apiKey, {
        sender,
        to: [
          {
            email: invite.email,
            name: recipientName,
          },
        ],
        subject: customerEmail.subject,
        htmlContent: customerEmail.html,
        textContent: customerEmail.text,
        replyTo: {
          email: sender.email,
          name: sender.name,
        },
        tags: ['invite-confirmation', 'customer'],
      }),
      sendBrevoTransactionalEmail(apiKey, {
        sender,
        to: [
          {
            email: adminEmail,
            name: 'VloerGroep',
          },
        ],
        subject: adminNotificationEmail.subject,
        htmlContent: adminNotificationEmail.html,
        textContent: adminNotificationEmail.text,
        replyTo: {
          email: invite.email,
          name: recipientName,
        },
        tags: ['invite-confirmation', 'admin'],
      }),
    ]);

    return {
      status: 200,
      body: {
        ok: true,
        invite,
      },
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        ok: false,
        message: error instanceof Error ? error.message : 'De bevestiging kon niet worden verwerkt.',
      },
    };
  }
}
