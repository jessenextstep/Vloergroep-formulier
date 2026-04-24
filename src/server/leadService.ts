import { calculateResults } from '../lib/calculations.js';
import { buildLeadProfile } from '../lib/leadProfile.js';
import {
  LeadCaptureFormData,
  LeadSource,
  LeadSubmissionPayload,
  LeadSubmissionResponse,
  clampMissedProjects,
  parseLegacyTeamCount,
  QuizState,
  readTeamCount,
} from '../types.js';
import {
  buildCustomerConfirmationEmail,
  buildInternalLeadEmail,
} from './leadEmailTemplates.js';
import { buildEmailLogoUrl } from './emailBranding.js';
import { syncLeadToBrevo } from './brevoService.js';

interface LeadEnvironment {
  resendApiKey?: string;
  resendFromEmail?: string;
  internalEmail?: string;
  environment?: string;
  siteUrl?: string;
  brevoApiKey?: string;
  brevoListIds?: string | number[];
  brevoDemoListId?: string | number;
  brevoInfoListId?: string | number;
  brevoAdsScanListId?: string | number;
}

interface LeadHandlerResult {
  status: number;
  body: LeadSubmissionResponse;
}

interface ResendEmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string | string[];
  attachments?: Array<{
    path?: string;
    content?: string;
    filename: string;
    contentId?: string;
  }>;
  tags?: Array<{ name: string; value: string }>;
}

interface BrevoErrorBody {
  code?: string;
  message?: string;
}

const PAYMENT_DAYS = new Set([14, 30, 45, 60, 90]);
const LEAD_INTENTS = new Set(['demo', 'info', 'scan']);
const LEAD_SOURCES = new Set<LeadSource>(['groeiscan', 'ads-scan']);

function usesResendTestingDomain(fromAddress: string): boolean {
  return /@resend\.dev>?$/i.test(fromAddress.trim());
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

function buildResendFromEmail(value?: string): string {
  const emailAddress = extractEmailAddress(value);
  return emailAddress ? `Rico van VloerGroep <${emailAddress}>` : 'Rico van VloerGroep <onboarding@resend.dev>';
}

function resolveSiteUrl(env: LeadEnvironment): string | undefined {
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

function buildDemoRequestUrl(siteUrl: string | undefined, contact: LeadCaptureFormData): string | null {
  const normalizedSiteUrl = normalizeAbsoluteUrl(siteUrl);
  if (!normalizedSiteUrl) {
    return null;
  }

  const url = new URL('/persoonlijke-demo', `${normalizedSiteUrl}/`);
  url.searchParams.set('name', contact.name);
  url.searchParams.set('company', contact.company);
  url.searchParams.set('email', contact.email);

  if (contact.phone) {
    url.searchParams.set('phone', contact.phone);
  }

  return url.toString();
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

function resolveBrevoListIds(
  intent: LeadCaptureFormData['intent'],
  env: LeadEnvironment,
): number[] {
  const sharedListIds = parseNumericList(env.brevoListIds || process.env.BREVO_LIST_IDS);
  const intentSpecificListId =
    intent === 'demo'
      ? parseNumericEnvValue(env.brevoDemoListId || process.env.BREVO_DEMO_LIST_ID)
      : intent === 'info'
        ? parseNumericEnvValue(env.brevoInfoListId || process.env.BREVO_INFO_LIST_ID)
        : parseNumericEnvValue(env.brevoAdsScanListId || process.env.BREVO_ADS_SCAN_LIST_ID) ?? 13;

  return [
    ...new Set([
      ...sharedListIds,
      ...(intentSpecificListId ? [intentSpecificListId] : []),
    ]),
  ];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function validatePayload(rawPayload: unknown):
  | { ok: true; payload: LeadSubmissionPayload }
  | { ok: false; message: string } {
  if (!isRecord(rawPayload)) {
    return { ok: false, message: 'Ongeldige payload.' };
  }

  const rawContact = isRecord(rawPayload.contact) ? rawPayload.contact : null;
  const rawQuiz = isRecord(rawPayload.quiz) ? rawPayload.quiz : null;
  const rawMeta = isRecord(rawPayload.meta) ? rawPayload.meta : null;

  if (!rawContact || !rawQuiz || !rawMeta) {
    return { ok: false, message: 'Leadgegevens missen.' };
  }

  const contact: LeadCaptureFormData = {
    name: readString(rawContact.name, 80),
    company: readString(rawContact.company, 120),
    email: readString(rawContact.email, 160).toLowerCase(),
    phone: readString(rawContact.phone, 40),
    intent: LEAD_INTENTS.has(rawContact.intent as string)
      ? (rawContact.intent as LeadCaptureFormData['intent'])
      : 'demo',
    consent: readBoolean(rawContact.consent),
    website: readString(rawContact.website, 120),
  };

  const teamCount = readTeamCount(rawQuiz.teamCount) ?? parseLegacyTeamCount(rawQuiz.teamSize);
  const hourlyRate = readNumber(rawQuiz.hourlyRate);
  const hoursPerWeek = readNumber(rawQuiz.hoursPerWeek);
  const weeksPerYear = readNumber(rawQuiz.weeksPerYear);
  const timeAdmin = readNumber(rawQuiz.timeAdmin);
  const timePlanning = readNumber(rawQuiz.timePlanning);
  const timeComm = readNumber(rawQuiz.timeComm);
  const timePayment = readNumber(rawQuiz.timePayment);
  const paymentDays = readNumber(rawQuiz.paymentDays);
  const percentageVloergroep = readNumber(rawQuiz.percentageVloergroep);
  const missedProjects = readNumber(rawQuiz.missedProjects);

  const quiz: QuizState | null =
    teamCount !== null &&
    hourlyRate !== null &&
    hoursPerWeek !== null &&
    weeksPerYear !== null &&
    timeAdmin !== null &&
    timePlanning !== null &&
    timeComm !== null &&
    timePayment !== null &&
    paymentDays !== null &&
    PAYMENT_DAYS.has(paymentDays) &&
    percentageVloergroep !== null &&
    missedProjects !== null
      ? {
          teamCount,
          companyName: readString(rawQuiz.companyName, 120),
          firstName: readString(rawQuiz.firstName, 80),
          hourlyRate,
          hoursPerWeek,
          weeksPerYear,
          timeAdmin,
          timePlanning,
          timeComm,
          timePayment,
          paymentDays: paymentDays as QuizState['paymentDays'],
          percentageVloergroep,
          leadsPerMonth: 6,
          conversionRate: 25,
          hoursPerLead: 12,
          leadScenario: 'realistic',
          missedProjects: clampMissedProjects(missedProjects),
        }
      : null;

  const sessionStartedAt = readNumber(rawMeta.sessionStartedAt);
  const submittedAt = readNumber(rawMeta.submittedAt);
  const source = LEAD_SOURCES.has(rawMeta.source as LeadSource)
    ? (rawMeta.source as LeadSource)
    : 'groeiscan';

  if (!quiz) {
    return { ok: false, message: 'Scanantwoorden zijn ongeldig.' };
  }

  const requiresPhone = contact.intent !== 'scan';

  if (!contact.name || !contact.company || !contact.email || (requiresPhone && !contact.phone)) {
    return { ok: false, message: 'Niet alle verplichte contactvelden zijn ingevuld.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    return { ok: false, message: 'E-mailadres is ongeldig.' };
  }

  if (contact.phone && !/^[+()0-9.\-/\s]{8,}$/.test(contact.phone)) {
    return { ok: false, message: 'Telefoonnummer is ongeldig.' };
  }

  if (!contact.consent) {
    return { ok: false, message: 'Geef toestemming zodat we je scan kunnen mailen.' };
  }

  if (sessionStartedAt === null || submittedAt === null) {
    return { ok: false, message: 'Meta-informatie ontbreekt.' };
  }

  return {
    ok: true,
    payload: {
      contact,
      quiz,
      meta: {
        source,
        sessionStartedAt,
        submittedAt,
        pathname: readString(rawMeta.pathname, 160),
        userAgent: readString(rawMeta.userAgent, 300),
      },
    },
  };
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

async function sendBrevoTransactionalEmail(
  apiKey: string,
  payload: {
    sender: { name: string; email: string };
    to: Array<{ email: string; name?: string }>;
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

export async function processLeadSubmission(
  rawPayload: unknown,
  env: LeadEnvironment = {},
): Promise<LeadHandlerResult> {
  const validation = validatePayload(rawPayload);

  if ('message' in validation) {
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

  if (payload.contact.website) {
    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode: 'preview',
      },
    };
  }

  if (payload.meta.submittedAt - payload.meta.sessionStartedAt < 5000) {
    return {
      status: 429,
      body: {
        ok: false,
        deliveryMode: 'preview',
        message: 'Formulier te snel verstuurd. Probeer het opnieuw.',
      },
    };
  }

  const results = calculateResults(payload.quiz);
  const profile = buildLeadProfile(payload.quiz, results, payload.contact.intent);
  const resendApiKey = env.resendApiKey || process.env.RESEND_API_KEY;
  const configuredResendFromEmail = env.resendFromEmail || process.env.RESEND_FROM_EMAIL;
  const resendFromEmail = buildResendFromEmail(configuredResendFromEmail);
  const internalEmail =
    extractEmailAddress(env.internalEmail) ||
    extractEmailAddress(process.env.LEAD_NOTIFICATION_EMAIL) ||
    extractEmailAddress(process.env.DEMO_REQUEST_ADMIN_EMAIL) ||
    'info@vloergroep.nl';
  const brevoApiKey = env.brevoApiKey || process.env.BREVO_API || process.env.BREVO_API_KEY;
  const brevoListIds = resolveBrevoListIds(payload.contact.intent, env);
  const siteUrl = resolveSiteUrl(env);
  const logoUrl = buildEmailLogoUrl(siteUrl);
  const logoSrc = logoUrl;
  const demoRequestUrl = buildDemoRequestUrl(siteUrl, payload.contact);
  const environment = env.environment || process.env.NODE_ENV || 'development';
  const resendConfigurationIssue =
    !resendApiKey
      ? environment === 'production'
        ? 'Mailomgeving is nog niet geconfigureerd.'
        : null
      : environment === 'production' && !configuredResendFromEmail
        ? 'RESEND_FROM_EMAIL ontbreekt in Vercel. Gebruik een afzender op een geverifieerd Resend-domein.'
        : environment === 'production' && usesResendTestingDomain(resendFromEmail)
          ? 'RESEND_FROM_EMAIL staat nog op resend.dev. Verifieer eerst een domein in Resend en gebruik daarna een afzender op dat domein.'
          : null;

  const customerMail = buildCustomerConfirmationEmail({
    contact: payload.contact,
    state: payload.quiz,
    results,
    profile,
    logoSrc,
    demoRequestUrl,
  });

  const internalMail = buildInternalLeadEmail({
    contact: payload.contact,
    state: payload.quiz,
    results,
    profile,
    logoSrc,
  });

  const submissionFingerprint = `${payload.contact.email}:${payload.meta.submittedAt}`;
  const intentTag = payload.contact.intent;
  const temperatureTag = profile.temperature.toLowerCase();
  const categoryTag = payload.meta.source === 'ads-scan' ? 'ads_scan' : 'lead_scan';
  let brevoSynced = false;
  let brevoErrorMessage: string | null = null;

  if (brevoApiKey) {
    console.info('Brevo sync started', {
      email: payload.contact.email,
      listIds: brevoListIds,
      mode: brevoListIds.length > 0 ? 'contact+lists' : 'contact-only',
    });

    try {
      await syncLeadToBrevo({
        apiKey: brevoApiKey,
        listIds: brevoListIds,
        contact: payload.contact,
        state: payload.quiz,
        results,
        profile,
        submittedAt: payload.meta.submittedAt,
        source: payload.meta.source,
      });

      brevoSynced = true;
      console.info('Brevo sync succeeded', {
        email: payload.contact.email,
        listIds: brevoListIds,
      });
    } catch (error) {
      brevoErrorMessage =
        error instanceof Error ? error.message : 'Onbekende Brevo-fout';
      console.error('Brevo sync failed', {
        email: payload.contact.email,
        listIds: brevoListIds,
        error: brevoErrorMessage,
      });
    }
  } else {
    console.info('Brevo sync skipped: BREVO_API ontbreekt', {
      email: payload.contact.email,
    });
  }

  if (!resendApiKey && environment !== 'production') {
    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode: 'preview',
        message: 'Previewmodus: mails zijn opgebouwd, maar nog niet verzonden.',
      },
    };
  }

  if (resendConfigurationIssue) {
    if (brevoSynced) {
      return {
        status: 200,
        body: {
          ok: true,
          deliveryMode: 'preview',
          message: 'Je aanvraag is ontvangen. De bevestigingsmail staat nog niet aan, maar je gegevens zijn wel goed aangekomen.',
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

  console.info('Resend send started', {
    customerEmail: payload.contact.email,
    internalEmail,
    from: resendFromEmail,
  });

  const resendResults = await Promise.allSettled([
    sendResendEmail(
      resendApiKey,
      {
        from: resendFromEmail,
        to: payload.contact.email,
        subject: customerMail.subject,
        html: customerMail.html,
        text: customerMail.text,
        reply_to: internalEmail,
        tags: [
          { name: 'category', value: categoryTag },
          { name: 'source', value: payload.meta.source },
          { name: 'intent', value: intentTag },
        ],
      },
      `customer:${submissionFingerprint}`,
    ),
    sendResendEmail(
      resendApiKey,
      {
        from: resendFromEmail,
        to: internalEmail,
        subject: internalMail.subject,
        html: internalMail.html,
        text: internalMail.text,
        reply_to: payload.contact.email,
        tags: [
          { name: 'category', value: categoryTag },
          { name: 'source', value: payload.meta.source },
          { name: 'intent', value: intentTag },
          { name: 'temperature', value: temperatureTag },
        ],
      },
      `internal:${submissionFingerprint}`,
    ),
  ]);

  const [customerResendResult, internalResendResult] = resendResults;
  const senderAddress = extractEmailAddress(resendFromEmail) || 'info@vloergroep.nl';
  let customerBrevoFallbackDelivered = false;
  let internalBrevoFallbackDelivered = false;

  if (customerResendResult.status === 'rejected') {
    console.error('Customer scan email via Resend failed', customerResendResult.reason);

    if (brevoApiKey) {
      try {
        await sendBrevoTransactionalEmail(brevoApiKey, {
          sender: { name: 'Rico van VloerGroep', email: senderAddress },
          to: [{ email: payload.contact.email, name: payload.contact.name }],
          subject: customerMail.subject,
          htmlContent: customerMail.html,
          textContent: customerMail.text,
          replyTo: { email: internalEmail },
          tags: ['lead-scan', payload.meta.source, intentTag, 'customer'],
        });
        customerBrevoFallbackDelivered = true;
      } catch (brevoMailError) {
        console.error('Customer scan email via Brevo fallback failed', brevoMailError);
      }
    }
  }

  if (internalResendResult.status === 'rejected') {
    console.error('Internal scan email via Resend failed', internalResendResult.reason);

    if (brevoApiKey) {
      try {
        await sendBrevoTransactionalEmail(brevoApiKey, {
          sender: { name: 'Rico van VloerGroep', email: senderAddress },
          to: [{ email: internalEmail, name: 'VloerGroep' }],
          subject: internalMail.subject,
          htmlContent: internalMail.html,
          textContent: internalMail.text,
          replyTo: { email: payload.contact.email },
          tags: ['lead-scan', payload.meta.source, intentTag, 'admin'],
        });
        internalBrevoFallbackDelivered = true;
      } catch (brevoMailError) {
        console.error('Internal scan email via Brevo fallback failed', brevoMailError);
      }
    }
  }

  const customerMailDelivered =
    customerResendResult.status === 'fulfilled' || customerBrevoFallbackDelivered;
  const internalMailDelivered =
    internalResendResult.status === 'fulfilled' || internalBrevoFallbackDelivered;

  if (customerResendResult.status === 'fulfilled' && internalResendResult.status === 'fulfilled') {
    console.info('Resend send succeeded', {
      customerEmail: payload.contact.email,
      internalEmail,
      from: resendFromEmail,
    });
  }

  if (customerMailDelivered && internalMailDelivered) {
    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode: 'live',
      },
    };
  }

  const resendConfigurationMessage =
    customerResendResult.status === 'rejected' &&
    customerResendResult.reason instanceof Error &&
    customerResendResult.reason.message.includes('You can only send testing emails to your own email address')
      ? 'Resend gebruikt nog een testafzender. Zet in Vercel `RESEND_FROM_EMAIL` op een adres van een geverifieerd Resend-domein.'
      : internalResendResult.status === 'rejected' &&
          internalResendResult.reason instanceof Error &&
          internalResendResult.reason.message.includes('You can only send testing emails to your own email address')
        ? 'Resend gebruikt nog een testafzender. Zet in Vercel `RESEND_FROM_EMAIL` op een adres van een geverifieerd Resend-domein.'
        : null;

  if (brevoSynced) {
    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode: 'preview',
        message: 'Je aanvraag is ontvangen. De bevestigingsmail kon nog niet volledig worden verstuurd, maar je gegevens zijn wel goed binnengekomen.',
      },
    };
  }

  return {
    status: 502,
    body: {
      ok: false,
      deliveryMode: 'preview',
      message:
        resendConfigurationMessage ||
        brevoErrorMessage ||
        'De aanvraag kon niet worden verzonden. Probeer het zo nog eens.',
    },
  };
}
