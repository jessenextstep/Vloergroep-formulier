import { QuizState, CalculationResults } from '../types';

export function calculateResults(state: QuizState, customMargin: number = 51.8): CalculationResults {
  // 1. BASIS
  const baseYearlyHours = state.hoursPerWeek * state.weeksPerYear;
  const baseYearlyRevenue = baseYearlyHours * state.hourlyRate;

  // 2. TIJDSWINST
  const timeSavedPerWeek = state.timeAdmin + state.timePlanning + state.timeComm + state.timePayment;
  const timeSavedPerYear = timeSavedPerWeek * state.weeksPerYear;
  // 85% is realistically monetizable
  const monetizableHoursYear = timeSavedPerYear * 0.85;
  const extraRevenueTime = monetizableHoursYear * state.hourlyRate;

  // 3. EXTRA WINST
  const extraProfitTime = extraRevenueTime * (customMargin / 100);

  // 4. EXTRA CAPACITEIT
  // Additional work weeks freed up
  const extraWorkWeeks = monetizableHoursYear / state.hoursPerWeek;

  // 5. CASHFLOW
  // Max 60 days used in calc unless explicitly longer, but we just use the user's input up to 60 as per typical bounds if they were given.
  // Actually, standard math given: cashflow_sneller_beschikbaar = jaaromzet_huidig * aandeel_omzet_via_vloergroep * gemiddelde_betaaldagen / 365
  const capDays = Math.min(state.paymentDays, 60);
  const fasterCashflow = baseYearlyRevenue * (state.percentageVloergroep / 100) * (capDays / 365);

  // 6. GROEI VIA BETERE LEADS
  // Business case constants: 6 leads/month, 12 hours billable per won job.
  const BASE_LEADS_PER_MONTH = 6;
  const BASE_HOURS_PER_LEAD = 12;

  let uplift = 0;
  if (state.leadScenario === 'conservative') uplift = 0.05; // 5 pp
  else if (state.leadScenario === 'realistic') uplift = 0.10; // 10 pp
  else if (state.leadScenario === 'ambitious') uplift = 0.125; // 12.5 pp

  const extraProjectsLeadsYear = BASE_LEADS_PER_MONTH * 12 * uplift;
  const extraHoursLeadsYear = extraProjectsLeadsYear * BASE_HOURS_PER_LEAD;
  const extraRevenueLeads = extraHoursLeadsYear * state.hourlyRate;

  // 7. GROEI VIA GROTERE KLUSSEN
  // 1 teamed project share = 75 billable hours
  // 2 teamed shares = 150 billable hours
  // We use missedProjects as multiplier. Assuming 1 project = 1 share for simplicity, or 2 projects = 2 shares.
  const extraRevenueTeam = state.missedProjects * 75 * state.hourlyRate;

  // 8. TOTALS
  // A. Basisresultaat = tijdswinst + cashflow
  // B. Groeipotentieel = tijdswinst + leads + samenwerking (in terms of Revenue/Capacity)
  
  const totalExtraRevenue = extraRevenueTime + extraRevenueLeads + extraRevenueTeam;
  const totalExtraProfit = totalExtraRevenue * (customMargin / 100);
  const totalExtraCapacityWeeks = extraWorkWeeks;

  return {
    base: {
      baseYearlyRevenue,
      baseYearlyHours,
    },
    timeSaved: {
      hoursPerWeekSaved: timeSavedPerWeek,
      monetizableHoursYear,
      extraRevenueTime,
      extraProfitTime,
      extraWorkWeeks,
    },
    cashflow: {
      fasterCashflow,
    },
    growthLeads: {
      extraProjectsYear: extraProjectsLeadsYear,
      extraHoursYear: extraHoursLeadsYear,
      extraRevenueLeads,
    },
    growthCollaboration: {
      extraRevenueTeam,
    },
    totals: {
      totalExtraRevenue,
      totalExtraProfit,
      totalExtraCapacityWeeks,
    }
  };
}
