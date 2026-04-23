export type TeamSize = '' | 'alone' | '1-2' | 'small-team' | 'large-team';
export type PaymentDays = 14 | 30 | 45 | 60 | 90;
export type MissedProjects = 0 | 1 | 2 | 3;
export type LeadScenario = 'conservative' | 'realistic' | 'ambitious';
export type LeadIntent = 'demo' | 'info' | 'scan';
export type LeadSource = 'groeiscan' | 'ads-scan';

export interface QuizState {
  teamSize: TeamSize;
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
  teamSize: '',
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
