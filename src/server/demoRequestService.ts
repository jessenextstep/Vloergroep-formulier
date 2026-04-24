import {
  DemoRequestFormData,
  DemoRequestPayload,
  DemoRequestSubmissionResponse,
  DemoPreferenceTime,
} from '../types.js';
import {
  buildDemoRequestAdminEmail,
  buildDemoRequestCustomerEmail,
} from './demoRequestEmailTemplates.js';
import {
  buildDemoScheduleRecord,
  buildDemoScheduleUrl,
} from './demoScheduleFlow.js';
import {
  buildEmailDemoConfirmationHeroUrl,
  buildEmailLogoUrl,
} from './emailBranding.js';
import { formatDutchDate } from '../lib/dateFormat.js';
import { syncDemoRequestToBrevo } from './brevoService.js';

interface DemoRequestEnvironment {
  resendApiKey?: string;
  resendFromEmail?: string;
  adminEmail?: string;
  environment?: string;
  siteUrl?: string;
  brevoApiKey?: string;
  brevoListIds?: string | number[];
  brevoDemoListId?: string | number;
}

interface DemoRequestHandlerResult {
  status: number;
  body: DemoRequestSubmissionResponse;
}

interface ResendEmailPayload {
  from: string;
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

interface BrevoErrorBody {
  code?: string;
  message?: string;
}

const DEMO_PREFERENCE_TIMES = new Set<DemoPreferenceTime>([
  'morning',
  'afternoon',
  'late-afternoon',
]);
const PRIMARY_LEAD_NOTIFICATION_EMAIL = 'info@vloergroep.nl';
const LEAD_NOTIFICATION_CC_EMAIL = 'joost@vloergroep.nl';

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

function uniqueEmailList(...values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];

  for (const value of values) {
    const email = extractEmailAddress(value);
    if (!email) {
      continue;
    }

    const key = email.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    emails.push(email);
  }

  return emails;
}

function buildResendFromEmail(value?: string): string {
  const emailAddress = extractEmailAddress(value);
  return emailAddress ? `Rico van VloerGroep <${emailAddress}>` : 'Rico van VloerGroep <onboarding@resend.dev>';
}

function parseNumericEnvValue(value: string | number | undefined): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseNumericList(value: string | number[] | undefined): number[] {
  if (Array.isArray(value)) {
    return value.filter((item) => Number.isInteger(item) && item > 0);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function resolveBrevoListIds(env: DemoRequestEnvironment): number[] {
  const sharedListIds = parseNumericList(env.brevoListIds || process.env.BREVO_LIST_IDS);
  const demoListId =
    parseNumericEnvValue(env.brevoDemoListId || process.env.BREVO_DEMO_REQUEST_LIST_ID) ??
    parseNumericEnvValue(process.env.BREVO_DEMO_LIST_ID);

  return [...new Set([...sharedListIds, ...(demoListId ? [demoListId] : [])])];
}

function resolveSiteUrl(env: DemoRequestEnvironment): string | undefined {
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

function resolveAdminEmail(env: DemoRequestEnvironment): string {
  return extractEmailAddress(env.adminEmail) ||
    extractEmailAddress(process.env.DEMO_REQUEST_ADMIN_EMAIL) ||
    extractEmailAddress(process.env.LEAD_NOTIFICATION_EMAIL) ||
    PRIMARY_LEAD_NOTIFICATION_EMAIL;
}

function resolveAdminMailRouting(env: DemoRequestEnvironment): {
  to: string[];
  cc: string[];
  replyEmail: string;
} {
  const configuredAdminEmail = resolveAdminEmail(env);
  const to = uniqueEmailList(
    PRIMARY_LEAD_NOTIFICATION_EMAIL,
    configuredAdminEmail.toLowerCase() !== LEAD_NOTIFICATION_CC_EMAIL ? configuredAdminEmail : null,
    LEAD_NOTIFICATION_CC_EMAIL,
  );
  const cc: string[] = [];

  return {
    to,
    cc,
    replyEmail: to[0] || PRIMARY_LEAD_NOTIFICATION_EMAIL,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function compareDateOnly(left: string, right: string): number {
  return left.localeCompare(right);
}

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validatePayload(rawPayload: unknown):
  | { ok: true; payload: DemoRequestPayload }
  | { ok: false; message: string } {
  if (!isRecord(rawPayload)) {
    return { ok: false, message: 'Ongeldige payload.' };
  }

  const rawRequest = isRecord(rawPayload.request) ? rawPayload.request : null;
  const rawMeta = isRecord(rawPayload.meta) ? rawPayload.meta : null;

  if (!rawRequest || !rawMeta) {
    return { ok: false, message: 'Demoverzoek mist gegevens.' };
  }

  const request: DemoRequestFormData = {
    name: readString(rawRequest.name, 80),
    company: readString(rawRequest.company, 120),
    email: readString(rawRequest.email, 160).toLowerCase(),
    phone: readString(rawRequest.phone, 40),
    preferredDatePrimary: readString(rawRequest.preferredDatePrimary, 10),
    preferredDateSecondary: readString(rawRequest.preferredDateSecondary, 10),
    preferredTime: DEMO_PREFERENCE_TIMES.has(rawRequest.preferredTime as DemoPreferenceTime)
      ? (rawRequest.preferredTime as DemoPreferenceTime)
      : 'morning',
    notes: readString(rawRequest.notes, 500),
    consent: readBoolean(rawRequest.consent),
    website: readString(rawRequest.website, 120),
  };

  const submittedAt = readNumber(rawMeta.submittedAt);
  const source =
    rawMeta.source === 'scan-email' || rawMeta.source === 'direct' ? rawMeta.source : 'direct';

  if (!request.name || !request.company || !request.email || !request.phone) {
    return { ok: false, message: 'Niet alle verplichte velden zijn ingevuld.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    return { ok: false, message: 'E-mailadres is ongeldig.' };
  }

  if (!/^[+()0-9.\-/\s]{8,}$/.test(request.phone)) {
    return { ok: false, message: 'Telefoonnummer is ongeldig.' };
  }

  if (!request.consent) {
    return { ok: false, message: 'Geef toestemming zodat Joost contact met je kan opnemen.' };
  }

  if (!isIsoDate(request.preferredDatePrimary)) {
    return { ok: false, message: 'Kies een eerste voorkeursdatum.' };
  }

  const today = getTodayIsoDate();
  if (compareDateOnly(request.preferredDatePrimary, today) < 0) {
    return { ok: false, message: 'Je eerste voorkeursdatum ligt in het verleden.' };
  }

  if (request.preferredDateSecondary) {
    if (!isIsoDate(request.preferredDateSecondary)) {
      return { ok: false, message: 'Je tweede voorkeursdatum is ongeldig.' };
    }

    if (compareDateOnly(request.preferredDateSecondary, today) < 0) {
      return { ok: false, message: 'Je tweede voorkeursdatum ligt in het verleden.' };
    }

    if (request.preferredDateSecondary === request.preferredDatePrimary) {
      return { ok: false, message: 'Kies twee verschillende voorkeursdata.' };
    }
  }

  if (submittedAt === null) {
    return { ok: false, message: 'Meta-informatie ontbreekt.' };
  }

  return {
    ok: true,
    payload: {
      request,
      meta: {
        source,
        submittedAt,
        pathname: readString(rawMeta.pathname, 160),
        userAgent: readString(rawMeta.userAgent, 300),
      },
    },
  };
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

async function sendBrevoTransactionalEmail(
  apiKey: string,
  payload: {
    sender: { name: string; email: string };
    to: Array<{ email: string; name?: string }>;
    cc?: Array<{ email: string; name?: string }>;
    subject: string;
    htmlContent: string;
    textContent: string;
    replyTo?: { email: string };
    tags?: string[];
  },
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

async function sendResendEmail(
  apiKey: string,
  payload: ResendEmailPayload,
  idempotencyKey: string,
): Promise<string> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      'User-Agent': 'vloergroep-formulier/1.0',
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();
  let data: { id?: string; message?: string; name?: string } = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody) as { id?: string; message?: string; name?: string };
    } catch {
      data = {
        message: rawBody.slice(0, 240),
      };
    }
  }

  if (!response.ok || !data.id) {
    throw new Error(data.message || data.name || 'Resend verzending mislukt.');
  }

  return data.id;
}

function getTimeSlot(value: DemoPreferenceTime) {
  switch (value) {
    case 'morning':
      return { start: '093000', end: '100000', label: 'ochtend' };
    case 'afternoon':
      return { start: '133000', end: '140000', label: 'middag' };
    case 'late-afternoon':
      return { start: '160000', end: '163000', label: 'einde middag' };
  }
}

function buildAdminCalendarUrl(request: DemoRequestFormData): string {
  const slot = getTimeSlot(request.preferredTime);
  const dateBase = request.preferredDatePrimary.replaceAll('-', '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Demoverzoek ${request.company}`,
    dates: `${dateBase}T${slot.start}/${dateBase}T${slot.end}`,
    details: [
      `Contact: ${request.name}`,
      `Bedrijf: ${request.company}`,
      `E-mail: ${request.email}`,
      `Telefoon: ${request.phone}`,
      `Tweede voorkeur: ${request.preferredDateSecondary ? formatDutchDate(request.preferredDateSecondary) : '-'}`,
      request.notes ? `Opmerking: ${request.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    location: 'Online / telefonisch',
    ctz: 'Europe/Amsterdam',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function processDemoRequestSubmission(
  rawPayload: unknown,
  env: DemoRequestEnvironment = {},
): Promise<DemoRequestHandlerResult> {
  const validation = validatePayload(rawPayload);

  if (validation.ok === false) {
    return {
      status: 400,
      body: {
        ok: false,
        deliveryMode: 'preview',
        message: validation.message,
      },
    };
  }

  const { payload } = validation;

  if (payload.request.website) {
    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode: 'preview',
      },
    };
  }

  const resendApiKey = env.resendApiKey || process.env.RESEND_API_KEY;
  const configuredResendFromEmail = env.resendFromEmail || process.env.RESEND_FROM_EMAIL;
  const resendFromEmail = buildResendFromEmail(configuredResendFromEmail);
  const siteUrl = resolveSiteUrl(env);
  const logoUrl = buildEmailLogoUrl(siteUrl);
  const heroImageUrl = buildEmailDemoConfirmationHeroUrl(siteUrl);
  const adminRouting = resolveAdminMailRouting(env);
  const brevoApiKey = env.brevoApiKey || process.env.BREVO_API || process.env.BREVO_API_KEY;
  const brevoListIds = resolveBrevoListIds(env);
  const environment = env.environment || process.env.NODE_ENV || 'development';
  const resendConfigurationIssue =
    !resendApiKey
      ? environment === 'production'
        ? 'Mailomgeving is nog niet geconfigureerd.'
        : null
      : environment === 'production' && !configuredResendFromEmail
        ? 'RESEND_FROM_EMAIL ontbreekt in Vercel. Gebruik een afzender op een geverifieerd Resend-domein.'
        : null;

  const adminCalendarUrl = buildAdminCalendarUrl(payload.request);
  const demoRecord = buildDemoScheduleRecord(payload.request, payload.meta.source, payload.meta.submittedAt);
  const adminActionUrl = buildDemoScheduleUrl(siteUrl, 'admin', demoRecord);
  const customerMail = buildDemoRequestCustomerEmail({
    request: payload.request,
    logoUrl,
    heroImageUrl,
  });
  const adminMail = buildDemoRequestAdminEmail({
    request: payload.request,
    logoUrl,
    heroImageUrl,
    adminCalendarUrl,
    adminActionUrl,
  });
  const senderAddress =
    extractEmailAddress(process.env.BREVO_FROM_EMAIL) ||
    extractEmailAddress(resendFromEmail) ||
    PRIMARY_LEAD_NOTIFICATION_EMAIL;

  const sendDemoRequestEmailsViaBrevo = async () => {
    if (!brevoApiKey) {
      return false;
    }

    await Promise.all([
      sendBrevoTransactionalEmail(brevoApiKey, {
        sender: { name: 'Rico van VloerGroep', email: senderAddress },
        to: [{ email: payload.request.email, name: payload.request.name }],
        subject: customerMail.subject,
        htmlContent: customerMail.html,
        textContent: customerMail.text,
        replyTo: { email: adminRouting.replyEmail },
        tags: ['demo-request', 'customer'],
      }),
      sendBrevoTransactionalEmail(brevoApiKey, {
        sender: { name: 'Rico van VloerGroep', email: senderAddress },
        to: adminRouting.to.map((email) => ({ email, name: 'VloerGroep' })),
        cc: adminRouting.cc.map((email) => ({ email, name: 'Joost van VloerGroep' })),
        subject: adminMail.subject,
        htmlContent: adminMail.html,
        textContent: adminMail.text,
        replyTo: { email: payload.request.email },
        tags: ['demo-request', 'admin'],
      }),
    ]);

    return true;
  };

  let brevoSynced = false;
  if (brevoApiKey) {
    try {
      await syncDemoRequestToBrevo({
        apiKey: brevoApiKey,
        listIds: brevoListIds,
        request: payload.request,
        submittedAt: payload.meta.submittedAt,
      });
      brevoSynced = true;
    } catch (error) {
      console.error('Brevo demo sync failed', {
        email: payload.request.email,
        listIds: brevoListIds,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (!resendApiKey && environment !== 'production') {
    try {
      if (await sendDemoRequestEmailsViaBrevo()) {
        return {
          status: 200,
          body: {
            ok: true,
            deliveryMode: 'live',
            message: 'Je voorkeur is ontvangen. Joost neemt contact met je op om een moment te bevestigen.',
          },
        };
      }
    } catch (brevoMailError) {
      console.error('Demo request emails via Brevo failed in local/preview mode', brevoMailError);
    }

    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode: 'preview',
        message: 'Previewmodus: het demoverzoek is opgebouwd, maar nog niet verzonden.',
      },
    };
  }

  if (resendConfigurationIssue) {
    try {
      if (await sendDemoRequestEmailsViaBrevo()) {
        return {
          status: 200,
          body: {
            ok: true,
            deliveryMode: 'live',
            message: 'Je voorkeur is ontvangen. Joost neemt contact met je op om een moment te bevestigen.',
          },
        };
      }
    } catch (brevoMailError) {
      console.error('Demo request emails via Brevo failed after Resend configuration issue', brevoMailError);
    }

    if (brevoSynced) {
      return {
        status: 200,
        body: {
          ok: true,
          deliveryMode: 'preview',
          message: 'Je voorkeur is ontvangen. Joost neemt contact met je op om een moment te bevestigen.',
        },
      };
    }

    return {
      status: 503,
      body: {
        ok: false,
        deliveryMode: 'preview',
        message: resendConfigurationIssue,
      },
    };
  }

  try {
    await Promise.all([
      sendResendEmail(
        resendApiKey!,
        {
          from: resendFromEmail,
          to: payload.request.email,
          subject: customerMail.subject,
          html: customerMail.html,
          text: customerMail.text,
          reply_to: adminRouting.replyEmail,
          tags: [
            { name: 'flow', value: 'demo_request' },
            { name: 'audience', value: 'customer' },
          ],
        },
        `demo-request-customer:${payload.request.email}:${payload.meta.submittedAt}`,
      ),
      sendResendEmail(
        resendApiKey!,
        {
          from: resendFromEmail,
          to: adminRouting.to,
          cc: adminRouting.cc.length > 0 ? adminRouting.cc : undefined,
          subject: adminMail.subject,
          html: adminMail.html,
          text: adminMail.text,
          reply_to: payload.request.email,
          tags: [
            { name: 'flow', value: 'demo_request' },
            { name: 'audience', value: 'admin' },
          ],
        },
        `demo-request-admin:${payload.request.email}:${payload.meta.submittedAt}`,
      ),
    ]);

    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode: 'live',
        message: 'Je voorkeur is ontvangen. Joost neemt contact met je op om een moment te bevestigen.',
      },
    };
  } catch (error) {
    console.error('Demo request email flow failed', error);

    if (brevoApiKey) {
      try {
        await Promise.all([
          sendBrevoTransactionalEmail(brevoApiKey, {
            sender: { name: 'Rico van VloerGroep', email: senderAddress },
            to: [{ email: payload.request.email, name: payload.request.name }],
            subject: customerMail.subject,
            htmlContent: customerMail.html,
            textContent: customerMail.text,
            replyTo: { email: adminRouting.replyEmail },
            tags: ['demo-request', 'customer'],
          }),
          sendBrevoTransactionalEmail(brevoApiKey, {
            sender: { name: 'Rico van VloerGroep', email: senderAddress },
            to: adminRouting.to.map((email) => ({ email, name: 'VloerGroep' })),
            cc: adminRouting.cc.map((email) => ({ email, name: 'Joost van VloerGroep' })),
            subject: adminMail.subject,
            htmlContent: adminMail.html,
            textContent: adminMail.text,
            replyTo: { email: payload.request.email },
            tags: ['demo-request', 'admin'],
          }),
        ]);

        return {
          status: 200,
          body: {
            ok: true,
            deliveryMode: 'live',
            message: 'Je voorkeur is ontvangen. Joost neemt contact met je op om een moment te bevestigen.',
          },
        };
      } catch (brevoError) {
        console.error('Brevo transactional fallback failed', brevoError);
      }
    }

    return {
      status: 502,
      body: {
        ok: false,
        deliveryMode: 'preview',
        message: 'Er ging iets mis bij het versturen. Probeer het zo nog eens.',
      },
    };
  }
}
