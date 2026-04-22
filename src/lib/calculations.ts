import { QuizState, CalculationResults } from '../types.js';

export function getFteEstimate(teamSize: QuizState['teamSize']): number {
  if (teamSize === '1-2') return 2;
  if (teamSize === 'small-team') return 4;
  if (teamSize === 'large-team') return 8;
  return 1;
}

export function calculateResults(state: QuizState, customMargin: number = 51.8): CalculationResults {
  // 0. FTE BEPALING (Realistische schaling i.p.v. blinde vermenigvuldiging)
  const fte = getFteEstimate(state.teamSize);
  
  // 1. BASIS
  // Jaaromzet groeit mee met het aantal mensen dat op de vloer staat
  const baseYearlyHours = state.hoursPerWeek * state.weeksPerYear * fte;
  const baseYearlyRevenue = baseYearlyHours * state.hourlyRate;

  // 2. TIJDSWINST
  // Tijdswinst zit hem in de eigenaar / kantoor (ingevulde sliders), PLUS verhoogde efficiëntie voor de operatie.
  // We rekenen super conservatief: 1,5 uur winst per medewerker buiten de eigenaar (minder bellen, zoeken, foutjes).
  const ownerTimeSavedPerWeek = state.timeAdmin + state.timePlanning + state.timeComm + state.timePayment;
  const teamEfficiencySavedPerWeek = (fte > 1) ? (fte - 1) * 1.5 : 0;
  
  const totalTimeSavedPerWeek = ownerTimeSavedPerWeek + teamEfficiencySavedPerWeek;
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
  // Een groter bedrijf kan van nature meer leads aan, maar we laten de lead-aanstroom degressief stijgen (realistischer).
  const BASE_LEADS_PER_MONTH = 4 + (fte * 2); // al=6, 1-2=8, sm=12, lg=20
  const BASE_HOURS_PER_LEAD = 12;

  // Realistische aanname: 10% uplift in conversie / beter geprijsde klussen d.m.v. betere leadkwalificatie
  const uplift = 0.10; 

  const extraProjectsLeadsYear = BASE_LEADS_PER_MONTH * 12 * uplift;
  const extraHoursLeadsYear = extraProjectsLeadsYear * BASE_HOURS_PER_LEAD;
  const extraRevenueLeads = extraHoursLeadsYear * state.hourlyRate;

  // 7. GROEI VIA GROTERE KLUSSEN
  // Een klus die afgeketst wordt door capaciteitsgebrek bij een 6-manszaak had een veel massievere omvang (200+ uur) dan een afgeketste klus bij 1 man (80 uur).
  const missedProjectSizeHours = 60 + (fte * 20); // al=80h, 1-2=100h, sm=140h, lg=220h
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
