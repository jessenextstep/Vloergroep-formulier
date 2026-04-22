import {
  CalculationResults,
  LeadIntent,
  PaymentDays,
  QuizState,
  TeamSize,
} from '../types';
import { clamp, formatCurrency, formatNumber } from './utils';

export interface LeadInsightProfile {
  score: number;
  temperature: 'Hot' | 'Warm' | 'Nurture';
  primaryAngle: string;
  primaryMessage: string;
  opportunities: string[];
  pitfalls: string[];
  salesTips: string[];
  nextStep: string;
}

export interface SummaryItem {
  label: string;
  value: string;
}

export interface LeadKpi {
  label: string;
  value: string;
  caption: string;
}

const teamSizeLabels: Record<TeamSize, string> = {
  '': 'Onbekend',
  alone: 'Alleen',
  '1-2': '1-2 extra mensen',
  'small-team': 'Klein team (3-5 man)',
  'large-team': 'Groot team (5+ personen)',
};

const paymentLabels: Record<PaymentDays, string> = {
  14: 'Binnen 14 dagen',
  30: 'Binnen 30 dagen',
  45: 'Binnen 45 dagen',
  60: '60+ dagen',
  90: '90+ dagen',
};

const intentLabels: Record<LeadIntent, string> = {
  demo: 'Demo plannen',
  info: 'Eerst meer uitleg',
};

export function getTeamSizeLabel(teamSize: TeamSize): string {
  return teamSizeLabels[teamSize];
}

export function getPaymentDaysLabel(paymentDays: PaymentDays): string {
  return paymentLabels[paymentDays];
}

export function getIntentLabel(intent: LeadIntent): string {
  return intentLabels[intent];
}

export function buildLeadKpis(results: CalculationResults): LeadKpi[] {
  return [
    {
      label: 'Extra omzetpotentie',
      value: formatCurrency(results.totals.totalExtraRevenue),
      caption: 'Jaarlijks via tijdswinst, betere leads en samenwerking.',
    },
    {
      label: 'Vrijgespeelde capaciteit',
      value: `+${formatNumber(results.totals.totalExtraCapacityWeeks, 1)} weken`,
      caption: 'Extra ruimte om slimmer te plannen en meer aan te nemen.',
    },
    {
      label: 'Sneller vrij werkkapitaal',
      value: formatCurrency(results.cashflow.fasterCashflow),
      caption: 'Kapitaal dat minder lang vaststaat in openstaande posten.',
    },
  ];
}

export function buildLeadSummary(
  state: QuizState,
  results: CalculationResults,
  intent: LeadIntent,
): SummaryItem[] {
  return [
    { label: 'Team', value: getTeamSizeLabel(state.teamSize) },
    { label: 'Uurtarief', value: formatCurrency(state.hourlyRate) },
    { label: 'Factureerbare uren', value: `${state.hoursPerWeek} uur per week` },
    { label: 'Werkweken', value: `${state.weeksPerYear} per jaar` },
    {
      label: 'Regelwerk',
      value: `${formatNumber(results.timeSaved.hoursPerWeekSaved, 1)} uur per week`,
    },
    { label: 'Betaaltermijn', value: getPaymentDaysLabel(state.paymentDays) },
    {
      label: 'Aandeel via VloerGroep',
      value: `${state.percentageVloergroep}% van de omzet`,
    },
    {
      label: 'Gemiste grotere klussen',
      value:
        state.missedProjects === 0
          ? 'Geen'
          : state.missedProjects === 3
            ? '3 of meer per jaar'
            : `${state.missedProjects} per jaar`,
    },
    { label: 'Voorkeur', value: getIntentLabel(intent) },
  ];
}

export function buildLeadProfile(
  state: QuizState,
  results: CalculationResults,
  intent: LeadIntent,
): LeadInsightProfile {
  const timeScore =
    results.timeSaved.hoursPerWeekSaved * 4.5 +
    results.timeSaved.extraRevenueTime / 5000;
  const cashScore =
    state.paymentDays / 3 +
    state.percentageVloergroep / 5 +
    results.cashflow.fasterCashflow / 8000;
  const growthScore =
    state.missedProjects * 13 +
    results.growthLeads.extraRevenueLeads / 9000 +
    results.growthCollaboration.extraRevenueTeam / 9000;

  const angleRanking = [
    {
      key: 'time',
      label: 'Tijdswinst en rust in de operatie',
      score: timeScore,
      message: `Er lekt nu ongeveer ${formatNumber(results.timeSaved.hoursPerWeekSaved, 1)} uur per week weg aan regelwerk. Laat in de demo direct zien hoe planning, communicatie en betalingen in een flow samenkomen.`,
    },
    {
      key: 'cashflow',
      label: 'Sneller betaald en meer grip op cashflow',
      score: cashScore,
      message: `De prospect heeft een duidelijke cashflow-case: ongeveer ${formatCurrency(results.cashflow.fasterCashflow)} kan sneller vrijkomen. Zet het projectdepot en minder debiteurenstress vroeg in het gesprek neer.`,
    },
    {
      key: 'growth',
      label: 'Groei via betere leads en samenwerking',
      score: growthScore,
      message: `De groeikans ligt vooral in beter passende klussen en grotere projecten wel kunnen aannemen. Koppel VloerGroep aan omzetkansen in plaats van alleen software.`,
    },
  ].sort((left, right) => right.score - left.score);

  let score = 38;
  score += Math.min(results.timeSaved.hoursPerWeekSaved * 4, 18);
  score += Math.min(state.missedProjects * 8, 24);
  score += state.paymentDays >= 45 ? 14 : state.paymentDays >= 30 ? 8 : 4;
  score += state.percentageVloergroep >= 60 ? 10 : state.percentageVloergroep >= 40 ? 6 : 3;
  score += state.teamSize === 'large-team' ? 8 : state.teamSize === 'small-team' ? 6 : state.teamSize === '1-2' ? 4 : 2;
  score += intent === 'demo' ? 8 : 0;
  score = clamp(Math.round(score), 24, 98);

  const temperature: LeadInsightProfile['temperature'] =
    score >= 78 ? 'Hot' : score >= 58 ? 'Warm' : 'Nurture';

  const opportunities: string[] = [];
  if (results.timeSaved.hoursPerWeekSaved >= 2) {
    opportunities.push(
      `${formatNumber(results.timeSaved.hoursPerWeekSaved, 1)} uur per week regelwerk kan worden omgezet in productieve tijd, goed voor circa ${formatCurrency(results.timeSaved.extraRevenueTime)} extra omzetpotentie per jaar.`,
    );
  }
  if (results.cashflow.fasterCashflow >= 12000) {
    opportunities.push(
      `${formatCurrency(results.cashflow.fasterCashflow)} aan cashflow kan aantoonbaar sneller vrijkomen, wat het gesprek over depot en betaalzekerheid sterk maakt.`,
    );
  }
  if (state.missedProjects > 0) {
    opportunities.push(
      `Er gaan nu grotere opdrachten verloren door capaciteit. Het netwerkverhaal is concreet, omdat ${state.missedProjects === 3 ? 'meerdere' : state.missedProjects} grotere klus${state.missedProjects > 1 ? 'sen' : ''} per jaar blijft liggen.`,
    );
  }
  if (results.growthLeads.extraRevenueLeads >= 10000) {
    opportunities.push(
      `Beter gekwalificeerde leads vertegenwoordigen al circa ${formatCurrency(results.growthLeads.extraRevenueLeads)} extra jaaromzet, zonder dat er meer ruis in het proces komt.`,
    );
  }
  if (opportunities.length === 0) {
    opportunities.push(
      `De business case is gematigder, maar nog steeds bruikbaar: focus op overzicht, professionele uitstraling en minder losse administratie in de werkdag.`,
    );
  }

  const pitfalls: string[] = [];
  if (state.teamSize === 'alone') {
    pitfalls.push(
      `Dit is een solo-ondernemer. Verkoop geen zwaar systeem; laat vooral eenvoud, snelheid en minder gedoe zien.`,
    );
  }
  if (state.percentageVloergroep < 50) {
    pitfalls.push(
      `De bereidheid om veel omzet via VloerGroep te laten lopen is nog voorzichtig. Bied een eerste project of pilot als logische instap aan.`,
    );
  }
  if (state.paymentDays <= 30) {
    pitfalls.push(
      `Cashflowpijn is aanwezig maar niet extreem. Leun dus niet alleen op “sneller betaald”, maar combineer het met tijdswinst en betrouwbaarheid.`,
    );
  }
  if (state.missedProjects === 0) {
    pitfalls.push(
      `Samenwerking is niet direct de grootste pijn. Positioneer het netwerk als bonus, niet als hoofdargument.`,
    );
  }
  if (results.timeSaved.ownerHoursSaved < 1.5) {
    pitfalls.push(
      `Administratieve frustratie wordt nog niet als dramatisch ervaren. Laat de demo daarom ook premium uitstraling en controle op projecten zien.`,
    );
  }
  if (pitfalls.length === 0) {
    pitfalls.push(
      `Er is geen grote blokkade zichtbaar, dus de grootste valkuil is een te generieke demo. Maak het gesprek scherp en persoonlijk.`,
    );
  }

  const salesTips: string[] = [
    `Open met: “Voor ${state.companyName || 'jouw bedrijf'} zit de snelste winst in ${angleRanking[0].label.toLowerCase()}.”`,
    temperature === 'Hot'
      ? 'Bel deze lead snel na. De combinatie van pijn, schaal en interesse maakt de kans op een afspraak hoog.'
      : 'Gebruik de eerste follow-up om de berekening te vertalen naar een concrete werkdag, niet alleen naar losse cijfers.',
    intent === 'demo'
      ? 'De prospect vroeg al om een demo. Zet de afspraak zo kort mogelijk op de bal en laat in 15 minuten de belangrijkste flow zien.'
      : 'Start met de samenvatting per mail en bied daarna een vrijblijvende walkthrough aan als zachte vervolgstap.',
    state.missedProjects > 0
      ? 'Laat in het gesprek expliciet zien hoe projectdepot en samenwerking risico wegnemen bij grotere klussen.'
      : 'Laat zien hoe VloerGroep de bestaande operatie strakker maakt, ook zonder meteen groter te hoeven worden.',
  ];

  const nextStep =
    intent === 'demo'
      ? 'Binnen 1 werkdag opvolgen met een korte demo-uitnodiging en de drie belangrijkste pijnpunten uit de scan.'
      : 'Samenvatting mailen, daarna opvolgen met een consultatief gesprek over tijdswinst en cashflow.';

  return {
    score,
    temperature,
    primaryAngle: angleRanking[0].label,
    primaryMessage: angleRanking[0].message,
    opportunities,
    pitfalls,
    salesTips,
    nextStep,
  };
}
