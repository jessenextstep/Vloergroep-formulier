export type LegacyTeamSize = '' | 'alone' | '1-2' | 'small-team' | 'large-team';
export type PaymentDays = 14 | 30 | 45 | 60 | 90;
export type MissedProjects = 0 | 1 | 2 | 3;
export type LeadScenario = 'conservative' | 'realistic' | 'ambitious';
export type LeadIntent = 'demo' | 'info' | 'scan';
export type LeadSource = 'groeiscan' | 'ads-scan';
export type DemoPreferenceTime = 'morning' | 'afternoon' | 'late-afternoon';

export interface QuizState {
  teamCount: number;
  companyName: string;
  firstName: string;

  hourlyRate: number;
  hoursPerWeek: number;
  weeksPerYear: number;

  timeAdmin: number;
  timePlanning: number;
  timeComm: number;
  timePayment: number;

  paymentDays: PaymentDays;
  percentageVloergroep: number;

  leadsPerMonth?: number; // Removed from direct prompt, kept minimal if needed
  conversionRate?: number; 
  hoursPerLead?: number;
  leadScenario: LeadScenario;

  missedProjects: MissedProjects;
}

export const defaultQuizState: QuizState = {
  teamCount: 1,
  companyName: '',
  firstName: '',

  hourlyRate: 61,
  hoursPerWeek: 33,
  weeksPerYear: 46,

  timeAdmin: 0,
  timePlanning: 0,
  timeComm: 0,
  timePayment: 0,

  paymentDays: 30,
  percentageVloergroep: 60,

  leadsPerMonth: 6,
  conversionRate: 25,
  hoursPerLead: 12,
  leadScenario: 'realistic',

  missedProjects: 0,
};

const LEGACY_TEAM_COUNT_MAP: Record<Exclude<LegacyTeamSize, ''>, number> = {
  alone: 1,
  '1-2': 2,
  'small-team': 4,
  'large-team': 8,
};

export function clampTeamCount(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultQuizState.teamCount;
  }

  return Math.max(1, Math.min(25, Math.round(value)));
}

export function parseLegacyTeamCount(value: unknown): number | null {
  if (typeof value !== 'string' || !(value in LEGACY_TEAM_COUNT_MAP)) {
    return null;
  }

  return LEGACY_TEAM_COUNT_MAP[value as Exclude<LegacyTeamSize, ''>];
}

export function readTeamCount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return clampTeamCount(value);
  }

  return null;
}

export function normalizeStoredQuizState(rawState: unknown): QuizState {
  if (typeof rawState !== 'object' || rawState === null) {
    return defaultQuizState;
  }

  const parsedState = rawState as Partial<QuizState> & { teamSize?: LegacyTeamSize };
  const teamCount =
    readTeamCount(parsedState.teamCount) ??
    parseLegacyTeamCount(parsedState.teamSize) ??
    defaultQuizState.teamCount;

  return {
    ...defaultQuizState,
    ...parsedState,
    teamCount,
  };
}

export interface CalculationResults {
  base: {
    baseYearlyRevenue: number;
    baseYearlyHours: number;
  };
  timeSaved: {
    hoursPerWeekSaved: number;
    ownerHoursSaved: number;
    teamEfficiencySaved: number;
    monetizableHoursYear: number;
    extraRevenueTime: number;
    extraProfitTime: number;
    extraWorkWeeks: number;
  };
  cashflow: {
    fasterCashflow: number;
  };
  growthLeads: {
    extraProjectsYear: number;
    extraHoursYear: number;
    extraRevenueLeads: number;
  };
  growthCollaboration: {
    extraRevenueTeam: number;
  };
  totals: {
    totalExtraRevenue: number;
    totalExtraProfit: number;
    totalExtraCapacityWeeks: number;
  };
}

export interface LeadCaptureFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  intent: LeadIntent;
  consent: boolean;
  website: string;
}

export interface LeadSubmissionPayload {
  contact: LeadCaptureFormData;
  quiz: QuizState;
  meta: {
    source: LeadSource;
    sessionStartedAt: number;
    submittedAt: number;
    pathname?: string;
    userAgent?: string;
  };
}

export interface LeadSubmissionResponse {
  ok: boolean;
  deliveryMode: 'live' | 'preview';
  message?: string;
}

export interface DemoRequestFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  preferredDatePrimary: string;
  preferredDateSecondary: string;
  preferredTime: DemoPreferenceTime;
  notes: string;
  consent: boolean;
  website: string;
}

export interface DemoRequestPayload {
  request: DemoRequestFormData;
  meta: {
    source: 'scan-email' | 'direct';
    submittedAt: number;
    pathname?: string;
    userAgent?: string;
  };
}

export interface DemoRequestSubmissionResponse {
  ok: boolean;
  deliveryMode: 'live' | 'preview';
  message?: string;
}
