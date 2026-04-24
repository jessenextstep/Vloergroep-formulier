import { CalculationResults, QuizState, clampTeamCount } from '../types.js';

export function getFteEstimate(teamCount: QuizState['teamCount']): number {
  return clampTeamCount(teamCount);
}

export function calculateResults(state: QuizState, customMargin: number = 51.8): CalculationResults {
  const teamCount = getFteEstimate(state.teamCount);
  
  // 1. BASIS
  // Jaaromzet groeit mee met het aantal mensen dat op de vloer staat en gemiddeld factureerbare uren draait.
  const baseYearlyHours = state.hoursPerWeek * state.weeksPerYear * teamCount;
  const baseYearlyRevenue = baseYearlyHours * state.hourlyRate;

  // 2. TIJDSWINST
  // De ingevulde tijdlekken gaan over de hele organisatie. Daarom tellen we hier geen extra verborgen team-opslag bovenop.
  const ownerTimeSavedPerWeek = state.timeAdmin + state.timePlanning + state.timeComm + state.timePayment;
  const teamEfficiencySavedPerWeek = 0;
  const totalTimeSavedPerWeek = ownerTimeSavedPerWeek;
  const timeSavedPerYear = totalTimeSavedPerWeek * state.weeksPerYear;
  
  // 85% is in de praktijk realistisch te factureren of converteert in vrije werkcapaciteit
  const monetizableHoursYear = timeSavedPerYear * 0.85;
  const extraRevenueTime = monetizableHoursYear * state.hourlyRate;

  // 3. EXTRA WINST
  const extraProfitTime = extraRevenueTime * (customMargin / 100);

  // 4. EXTRA CAPACITEIT
  // Hoeveel netto extra werkweken voor 1 volle FTE levert dit op?
  const extraWorkWeeks = monetizableHoursYear / (state.hoursPerWeek || 40);

  // 5. CASHFLOW
  // Schaalt lineair en correct mee. Groter bedrijf = véél meer omzet = exponentieel groter voordeel van sneller cash vastklikken in VloerGroep.
  const capDays = Math.min(state.paymentDays, 60);
  const fasterCashflow = baseYearlyRevenue * (state.percentageVloergroep / 100) * (capDays / 365);

  // 6. GROEI VIA BETERE LEADS
  // Een groter team kan meer passende opdrachten oppakken, maar we houden de aanwas bewust conservatief.
  const BASE_LEADS_PER_MONTH = 4 + (teamCount * 1.5);
  const BASE_HOURS_PER_LEAD = 12;

  // Realistische aanname: 10% uplift in conversie / beter geprijsde klussen d.m.v. betere leadkwalificatie
  const uplift = 0.10; 

  const extraProjectsLeadsYear = BASE_LEADS_PER_MONTH * 12 * uplift;
  const extraHoursLeadsYear = extraProjectsLeadsYear * BASE_HOURS_PER_LEAD;
  const extraRevenueLeads = extraHoursLeadsYear * state.hourlyRate;

  // 7. GROEI VIA GROTERE KLUSSEN
  // Een bedrijf met meer vakmensen kan grotere klussen samen uitvoeren, dus ook grotere misgelopen waarde terugpakken.
  const missedProjectSizeHours = 60 + (teamCount * 20);
  const extraRevenueTeam = state.missedProjects * missedProjectSizeHours * state.hourlyRate;

  // 8. TOTALS
  const totalExtraRevenue = extraRevenueTime + extraRevenueLeads + extraRevenueTeam;
  const totalExtraProfit = totalExtraRevenue * (customMargin / 100);
  const totalExtraCapacityWeeks = extraWorkWeeks;

  return {
    base: {
      baseYearlyRevenue,
      baseYearlyHours,
    },
    timeSaved: {
      hoursPerWeekSaved: totalTimeSavedPerWeek,
      ownerHoursSaved: ownerTimeSavedPerWeek,
      teamEfficiencySaved: teamEfficiencySavedPerWeek,
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
    },
  };
}
