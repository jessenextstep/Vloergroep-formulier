import { createHmac, randomUUID } from 'node:crypto';

import type {
  DemoPreferenceTime,
  DemoRequestFormData,
  DemoScheduleActor,
  DemoScheduleHistoryItem,
  DemoScheduleProposal,
  DemoScheduleRecord,
} from '../types.js';

interface SignedDemoScheduleToken {
  actor: DemoScheduleActor;
  record: DemoScheduleRecord;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getDemoScheduleSecret(): string {
  return (
    process.env.DEMO_SCHEDULE_SECRET ||
    process.env.DEMO_REQUEST_SECRET ||
    process.env.BREVO_API ||
    'vloergroep-demo-schedule-secret'
  );
}

function signPayload(payload: string): string {
  return createHmac('sha256', getDemoScheduleSecret()).update(payload).digest('base64url');
}

function buildSummary(date: string, time: DemoPreferenceTime, secondaryDate?: string) {
  const base = `${date} · ${getPreferenceLabel(time)}`;
  return secondaryDate ? `${base} (backup ${secondaryDate})` : base;
}

export function getPreferenceLabel(value: DemoPreferenceTime): string {
  switch (value) {
    case 'morning':
      return 'Ochtend';
    case 'afternoon':
      return 'Middag';
    case 'late-afternoon':
      return 'Einde middag';
  }
}

export function buildDemoScheduleRecord(
  request: DemoRequestFormData,
  source: 'scan-email' | 'direct',
  now = Date.now(),
): DemoScheduleRecord {
  const proposal: DemoScheduleProposal = {
    date: request.preferredDatePrimary,
    secondaryDate: request.preferredDateSecondary || undefined,
    time: request.preferredTime,
    note: request.notes || undefined,
  };

  const history: DemoScheduleHistoryItem[] = [
    {
      actor: 'customer',
      kind: 'request',
      timestamp: now,
      summary: `Voorkeur ontvangen: ${buildSummary(proposal.date, proposal.time, proposal.secondaryDate)}`,
    },
  ];

  return {
    id: randomUUID(),
    version: 1,
    status: 'awaiting_admin',
    awaitingActor: 'admin',
    customer: {
      name: request.name,
      company: request.company,
      email: request.email,
      phone: request.phone,
    },
    source,
    initialRequest: request,
    currentProposal: proposal,
    history,
    updatedAt: now,
  };
}

export function createDemoScheduleToken(actor: DemoScheduleActor, record: DemoScheduleRecord): string {
  const payload = toBase64Url(JSON.stringify({ actor, record } satisfies SignedDemoScheduleToken));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function readDemoScheduleToken(token: string): SignedDemoScheduleToken | null {
  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return null;
  }

  if (signPayload(payload) !== signature) {
    return null;
  }

  try {
    return JSON.parse(fromBase64Url(payload)) as SignedDemoScheduleToken;
  } catch {
    return null;
  }
}

export function buildDemoScheduleUrl(
  siteUrl: string | undefined,
  actor: DemoScheduleActor,
  record: DemoScheduleRecord,
): string | null {
  if (!siteUrl) {
    return null;
  }

  const url = new URL('/demo-afspraak', `${siteUrl}/`);
  url.searchParams.set('t', createDemoScheduleToken(actor, record));
  return url.toString();
}

function getTimeSlot(value: DemoPreferenceTime) {
  switch (value) {
    case 'morning':
      return { start: '093000', end: '100000' };
    case 'afternoon':
      return { start: '133000', end: '140000' };
    case 'late-afternoon':
      return { start: '160000', end: '163000' };
  }
}

export function buildCalendarUrl(record: DemoScheduleRecord, titlePrefix = 'VloerGroep demo'): string {
  const slot = getTimeSlot(record.currentProposal.time);
  const dateBase = record.currentProposal.date.replaceAll('-', '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${titlePrefix} ${record.customer.company}`.trim(),
    dates: `${dateBase}T${slot.start}/${dateBase}T${slot.end}`,
    details: [
      `Contact: ${record.customer.name}`,
      `Bedrijf: ${record.customer.company}`,
      `E-mail: ${record.customer.email}`,
      `Telefoon: ${record.customer.phone}`,
      record.currentProposal.note ? `Opmerking: ${record.currentProposal.note}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    location: 'Online / telefonisch',
    ctz: 'Europe/Amsterdam',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function updateRecordForProposal(
  record: DemoScheduleRecord,
  actor: DemoScheduleActor,
  proposal: DemoScheduleProposal,
  now = Date.now(),
): DemoScheduleRecord {
  return {
    ...record,
    version: record.version + 1,
    status: actor === 'admin' ? 'awaiting_customer' : 'awaiting_admin',
    awaitingActor: actor === 'admin' ? 'customer' : 'admin',
    currentProposal: proposal,
    updatedAt: now,
    history: [
      ...record.history,
      {
        actor,
        kind: 'proposal',
        timestamp: now,
        summary:
          actor === 'admin'
            ? `Nieuw voorstel verstuurd: ${buildSummary(proposal.date, proposal.time, proposal.secondaryDate)}`
            : `Nieuwe voorkeur ontvangen: ${buildSummary(proposal.date, proposal.time, proposal.secondaryDate)}`,
      },
    ],
  };
}

export function updateRecordForConfirmation(
  record: DemoScheduleRecord,
  actor: DemoScheduleActor,
  confirmedBy: 'admin' | 'customer' | 'phone',
  proposal?: DemoScheduleProposal,
  now = Date.now(),
): DemoScheduleRecord {
  const nextProposal = proposal ?? record.currentProposal;

  return {
    ...record,
    version: record.version + 1,
    status: 'confirmed',
    awaitingActor: null,
    confirmedBy,
    currentProposal: nextProposal,
    updatedAt: now,
    history: [
      ...record.history,
      {
        actor,
        kind: confirmedBy === 'phone' ? 'confirmed' : 'accepted',
        timestamp: now,
        summary:
          confirmedBy === 'phone'
            ? `Telefonisch bevestigd: ${buildSummary(nextProposal.date, nextProposal.time, nextProposal.secondaryDate)}`
            : `Afspraak bevestigd: ${buildSummary(nextProposal.date, nextProposal.time, nextProposal.secondaryDate)}`,
      },
    ],
  };
}
