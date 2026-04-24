import type {
  DemoPreferenceTime,
  DemoScheduleActionPayload,
  DemoScheduleActionResponse,
  DemoScheduleActor,
  DemoScheduleProposal,
  DemoScheduleStateResponse,
} from '../types.js';
import {
  buildCalendarUrl,
  buildDemoScheduleUrl,
  readDemoScheduleToken,
  updateRecordForConfirmation,
  updateRecordForProposal,
} from './demoScheduleFlow.js';
import {
  buildDemoScheduleAdminProposalEmail,
  buildDemoScheduleConfirmedAdminEmail,
  buildDemoScheduleConfirmedCustomerEmail,
  buildDemoScheduleCustomerProposalEmail,
} from './demoRequestEmailTemplates.js';
import {
  buildEmailDemoConfirmationHeroUrl,
  buildEmailLogoUrl,
} from './emailBranding.js';

interface DemoScheduleEnvironment {
  resendApiKey?: string;
  resendFromEmail?: string;
  siteUrl?: string;
  adminEmail?: string;
  brevoApiKey?: string;
}

interface ResendEmailPayload {
  from: string;
  to: string | string[];
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

function resolveSiteUrl(env: DemoScheduleEnvironment): string | undefined {
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

function resolveAdminEmail(env: DemoScheduleEnvironment): string {
  return (
    extractEmailAddress(env.adminEmail) ||
    extractEmailAddress(process.env.DEMO_REQUEST_ADMIN_EMAIL) ||
    extractEmailAddress(process.env.LEAD_NOTIFICATION_EMAIL) ||
    'joost@vloergroep.nl'
  );
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseBrevoError(response: Response, rawBody: string): string {
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

async function sendResendEmail(
  apiKey: string,
  payload: ResendEmailPayload,
  idempotencyKey: string,
): Promise<void> {
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
  if (!response.ok) {
    throw new Error(rawBody || 'Resend verzending mislukt.');
  }
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
    const rawBody = await response.text();
    throw new Error(parseBrevoError(response, rawBody));
  }
}

async function deliverEmails(
  env: DemoScheduleEnvironment,
  messages: Array<{
    audience: 'customer' | 'admin';
    to: string;
    replyTo: string;
    subject: string;
    html: string;
    text: string;
    idempotencyKey: string;
  }>,
): Promise<'live' | 'preview'> {
  const resendApiKey = env.resendApiKey || process.env.RESEND_API_KEY;
  const resendFromEmail = buildResendFromEmail(env.resendFromEmail || process.env.RESEND_FROM_EMAIL);
  const brevoApiKey = env.brevoApiKey || process.env.BREVO_API || process.env.BREVO_API_KEY;

  if (!resendApiKey && !brevoApiKey) {
    return 'preview';
  }

  if (resendApiKey) {
    try {
      await Promise.all(
        messages.map((message) =>
          sendResendEmail(
            resendApiKey,
            {
              from: resendFromEmail,
              to: message.to,
              subject: message.subject,
              html: message.html,
              text: message.text,
              reply_to: message.replyTo,
              tags: [
                { name: 'flow', value: 'demo_schedule' },
                { name: 'audience', value: message.audience },
              ],
            },
            message.idempotencyKey,
          ),
        ),
      );

      return 'live';
    } catch (error) {
      console.error('Demo schedule Resend failed', error);
    }
  }

  if (!brevoApiKey) {
    return 'preview';
  }

  const senderAddress = extractEmailAddress(resendFromEmail) || 'info@vloergroep.nl';
  await Promise.all(
    messages.map((message) =>
      sendBrevoTransactionalEmail(brevoApiKey, {
        sender: { name: 'Rico van VloerGroep', email: senderAddress },
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
        replyTo: { email: message.replyTo },
        tags: ['demo-schedule', message.audience],
      }),
    ),
  );

  return 'live';
}

function isTimeValue(value: unknown): value is DemoPreferenceTime {
  return value === 'morning' || value === 'afternoon' || value === 'late-afternoon';
}

function validateProposal(
  date: unknown,
  secondaryDate: unknown,
  time: unknown,
  note: unknown,
): { ok: true; proposal: DemoScheduleProposal } | { ok: false; message: string } {
  const proposalDate = typeof date === 'string' ? date.trim() : '';
  const proposalSecondaryDate = typeof secondaryDate === 'string' ? secondaryDate.trim() : '';
  const proposalNote = typeof note === 'string' ? note.trim().slice(0, 280) : '';

  if (!isIsoDate(proposalDate)) {
    return { ok: false, message: 'Kies een geldige datum.' };
  }

  if (proposalDate < getTodayIsoDate()) {
    return { ok: false, message: 'Kies een datum vanaf vandaag.' };
  }

  if (proposalSecondaryDate) {
    if (!isIsoDate(proposalSecondaryDate)) {
      return { ok: false, message: 'De tweede datum is ongeldig.' };
    }

    if (proposalSecondaryDate < getTodayIsoDate()) {
      return { ok: false, message: 'De tweede datum ligt in het verleden.' };
    }

    if (proposalSecondaryDate === proposalDate) {
      return { ok: false, message: 'Kies een andere tweede datum.' };
    }
  }

  if (!isTimeValue(time)) {
    return { ok: false, message: 'Kies een passend moment.' };
  }

  return {
    ok: true,
    proposal: {
      date: proposalDate,
      secondaryDate: proposalSecondaryDate || undefined,
      time,
      note: proposalNote || undefined,
    },
  };
}

export async function getDemoScheduleState(
  token: string,
  env: DemoScheduleEnvironment = {},
): Promise<{ status: number; body: DemoScheduleStateResponse }> {
  const decoded = readDemoScheduleToken(token);

  if (!decoded) {
    return {
      status: 400,
      body: {
        ok: false,
        message: 'Deze afspraaklink is niet meer geldig.',
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      actor: decoded.actor,
      record: decoded.record,
      calendarUrl: decoded.record.status === 'confirmed' ? buildCalendarUrl(decoded.record) : undefined,
    },
  };
}

export async function processDemoScheduleAction(
  rawPayload: unknown,
  env: DemoScheduleEnvironment = {},
): Promise<{ status: number; body: DemoScheduleActionResponse }> {
  if (typeof rawPayload !== 'object' || rawPayload === null) {
    return {
      status: 400,
      body: { ok: false, deliveryMode: 'preview', message: 'Ongeldige payload.' },
    };
  }

  const payload = rawPayload as Partial<DemoScheduleActionPayload>;
  const token = typeof payload.token === 'string' ? payload.token.trim() : '';
  const action = payload.action === 'accept' || payload.action === 'propose' ? payload.action : null;

  if (!token || !action) {
    return {
      status: 400,
      body: { ok: false, deliveryMode: 'preview', message: 'Actie of link ontbreekt.' },
    };
  }

  const decoded = readDemoScheduleToken(token);
  if (!decoded) {
    return {
      status: 400,
      body: { ok: false, deliveryMode: 'preview', message: 'Deze afspraaklink is niet meer geldig.' },
    };
  }

  const { actor, record } = decoded;
  const siteUrl = resolveSiteUrl(env);
  const logoUrl = buildEmailLogoUrl(siteUrl);
  const heroImageUrl = buildEmailDemoConfirmationHeroUrl(siteUrl);
  const adminEmail = resolveAdminEmail(env);

  if (record.status === 'confirmed') {
    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode: 'preview',
        message: 'Deze afspraak staat al vast.',
        actor,
        record,
        calendarUrl: buildCalendarUrl(record),
      },
    };
  }

  if (record.awaitingActor !== actor) {
    return {
      status: 409,
      body: {
        ok: false,
        deliveryMode: 'preview',
        message: actor === 'admin' ? 'We wachten nu eerst op een reactie van de klant.' : 'We wachten nu eerst op een reactie van Joost.',
        actor,
        record,
      },
    };
  }

  if (action === 'accept') {
    const confirmedRecord = updateRecordForConfirmation(record, actor, actor === 'admin' ? 'admin' : 'customer');
    const calendarUrl = buildCalendarUrl(confirmedRecord);
    const customerMail = buildDemoScheduleConfirmedCustomerEmail({
      record: confirmedRecord,
      calendarUrl,
      logoUrl,
      heroImageUrl,
    });
    const adminMail = buildDemoScheduleConfirmedAdminEmail({
      record: confirmedRecord,
      calendarUrl,
      logoUrl,
      heroImageUrl,
    });

    const deliveryMode = await deliverEmails(env, [
      {
        audience: 'customer',
        to: confirmedRecord.customer.email,
        replyTo: adminEmail,
        subject: customerMail.subject,
        html: customerMail.html,
        text: customerMail.text,
        idempotencyKey: `demo-confirm-customer:${confirmedRecord.id}:${confirmedRecord.version}`,
      },
      {
        audience: 'admin',
        to: adminEmail,
        replyTo: confirmedRecord.customer.email,
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
        idempotencyKey: `demo-confirm-admin:${confirmedRecord.id}:${confirmedRecord.version}`,
      },
    ]);

    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode,
        message: 'De afspraak is bevestigd.',
        actor,
        record: confirmedRecord,
        calendarUrl,
      },
    };
  }

  const proposalValidation = validateProposal(
    payload.proposalDate,
    payload.proposalSecondaryDate,
    payload.proposalTime,
    payload.proposalNote,
  );

  if (proposalValidation.ok === false) {
    const invalidMessage = proposalValidation.message;
    return {
      status: 400,
      body: { ok: false, deliveryMode: 'preview', message: invalidMessage, actor, record },
    };
  }

  const phoneConfirmed = actor === 'admin' && payload.phoneConfirmed === true;
  const nextRecord = phoneConfirmed
    ? updateRecordForConfirmation(record, 'admin', 'phone', proposalValidation.proposal)
    : updateRecordForProposal(record, actor, proposalValidation.proposal);

  const customerActionUrl = buildDemoScheduleUrl(siteUrl, 'customer', nextRecord);
  const adminActionUrl = buildDemoScheduleUrl(siteUrl, 'admin', nextRecord);
  const calendarUrl = buildCalendarUrl(nextRecord);

  if (phoneConfirmed) {
    const customerMail = buildDemoScheduleConfirmedCustomerEmail({
      record: nextRecord,
      calendarUrl,
      logoUrl,
      heroImageUrl,
    });
    const adminMail = buildDemoScheduleConfirmedAdminEmail({
      record: nextRecord,
      calendarUrl,
      logoUrl,
      heroImageUrl,
    });

    const deliveryMode = await deliverEmails(env, [
      {
        audience: 'customer',
        to: nextRecord.customer.email,
        replyTo: adminEmail,
        subject: customerMail.subject,
        html: customerMail.html,
        text: customerMail.text,
        idempotencyKey: `demo-phone-confirm-customer:${nextRecord.id}:${nextRecord.version}`,
      },
      {
        audience: 'admin',
        to: adminEmail,
        replyTo: nextRecord.customer.email,
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
        idempotencyKey: `demo-phone-confirm-admin:${nextRecord.id}:${nextRecord.version}`,
      },
    ]);

    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode,
        message: 'De afspraak is als bevestigd verstuurd.',
        actor,
        record: nextRecord,
        calendarUrl,
      },
    };
  }

  if (actor === 'admin') {
    const customerMail = buildDemoScheduleCustomerProposalEmail({
      record: nextRecord,
      actionUrl: customerActionUrl,
      logoUrl,
      heroImageUrl,
    });
    const deliveryMode = await deliverEmails(env, [
      {
        audience: 'customer',
        to: nextRecord.customer.email,
        replyTo: adminEmail,
        subject: customerMail.subject,
        html: customerMail.html,
        text: customerMail.text,
        idempotencyKey: `demo-proposal-customer:${nextRecord.id}:${nextRecord.version}`,
      },
    ]);

    return {
      status: 200,
      body: {
        ok: true,
        deliveryMode,
        message: 'Het nieuwe voorstel is naar de klant gestuurd.',
        actor,
        record: nextRecord,
      },
    };
  }

  const adminMail = buildDemoScheduleAdminProposalEmail({
    record: nextRecord,
    actionUrl: adminActionUrl,
    calendarUrl,
    logoUrl,
    heroImageUrl,
  });

  const deliveryMode = await deliverEmails(env, [
    {
      audience: 'admin',
      to: adminEmail,
      replyTo: nextRecord.customer.email,
      subject: adminMail.subject,
      html: adminMail.html,
      text: adminMail.text,
      idempotencyKey: `demo-proposal-admin:${nextRecord.id}:${nextRecord.version}`,
    },
  ]);

  return {
    status: 200,
    body: {
      ok: true,
      deliveryMode,
      message: 'Je nieuwe voorkeur is naar Joost gestuurd.',
      actor,
      record: nextRecord,
    },
  };
}
