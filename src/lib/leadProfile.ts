import {
  CalculationResults,
  LeadIntent,
  PaymentDays,
  QuizState,
} from '../types.js';
import { clamp, formatCurrency, formatNumber } from './utils.js';

export interface LeadInsightProfile {
  score: number;
  temperature: 'Hoog' | 'Gemiddeld' | 'Licht';
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
  scan: 'Scan per mail',
};

export function getTeamSizeLabel(teamCount: number): string {
  return teamCount === 1 ? '1 persoon in uitvoering' : `${teamCount} mensen in uitvoering`;
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
      caption: 'Indicatief per jaar, opgebouwd uit tijdswinst, betere leads en samenwerking.',
    },
    {
      label: 'Vrijgespeelde capaciteit',
      value: `+${formatNumber(results.totals.totalExtraCapacityWeeks, 1)} weken`,
      caption: 'Extra ruimte om slimmer te plannen en meer werk aan te nemen.',
    },
    {
      label: 'Sneller vrij werkkapitaal',
      value: formatCurrency(results.cashflow.fasterCashflow),
      caption: 'Geld dat minder lang vaststaat in openstaande posten.',
    },
  ];
}

export function buildLeadSummary(
  state: QuizState,
  results: CalculationResults,
  intent: LeadIntent,
): SummaryItem[] {
  return [
    { label: 'Mensen in uitvoering', value: getTeamSizeLabel(state.teamCount) },
    { label: 'Uurtarief ex. btw', value: formatCurrency(state.hourlyRate) },
    { label: 'Factureerbare uren p.p.', value: `${state.hoursPerWeek} uur per week` },
    { label: 'Werkweken', value: `${state.weeksPerYear} per jaar` },
    {
      label: 'Regelwerk organisatie',
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
      message: `Er lekt nu ongeveer ${formatNumber(results.timeSaved.hoursPerWeekSaved, 1)} uur per week weg aan regelen. Laat vooral zien hoe planning, communicatie en betalingen weer rust en overzicht geven.`,
    },
    {
      key: 'cashflow',
      label: 'Sneller betaald en meer grip op cashflow',
      score: cashScore,
      message: `Er zit hier een duidelijke cashflowkans: ongeveer ${formatCurrency(results.cashflow.fasterCashflow)} kan sneller vrijkomen. Leg rustig uit wat projectdepot en geborgde betalingen daarin veranderen.`,
    },
    {
      key: 'growth',
      label: 'Groei via betere leads en samenwerking',
      score: growthScore,
      message: `De groeikans zit vooral in beter passende klussen en grotere projecten wel kunnen aannemen. Maak het concreet voor hun bedrijf, niet algemeen.`,
    },
  ].sort((left, right) => right.score - left.score);

  let score = 38;
  score += Math.min(results.timeSaved.hoursPerWeekSaved * 4, 18);
  score += Math.min(state.missedProjects * 8, 24);
  score += state.paymentDays >= 45 ? 14 : state.paymentDays >= 30 ? 8 : 4;
  score += state.percentageVloergroep >= 60 ? 10 : state.percentageVloergroep >= 40 ? 6 : 3;
  score += Math.min(state.teamCount * 1.2, 10);
  score += intent === 'demo' ? 8 : intent === 'scan' ? 3 : 0;
  score = clamp(Math.round(score), 24, 98);

  const temperature: LeadInsightProfile['temperature'] =
    score >= 78 ? 'Hoog' : score >= 58 ? 'Gemiddeld' : 'Licht';

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
      `Er blijven nu grotere opdrachten liggen doordat capaciteit of afstemming ontbreekt. Dat maakt samenwerking via het netwerk meteen relevant voor dit bedrijf.`,
    );
  }
  if (results.growthLeads.extraRevenueLeads >= 10000) {
    opportunities.push(
      `Beter passende opdrachten vertegenwoordigen al circa ${formatCurrency(results.growthLeads.extraRevenueLeads)} extra jaaromzet, zonder extra ruis in planning en uitvoering.`,
    );
  }
  if (opportunities.length === 0) {
    opportunities.push(
      `De business case is gematigder, maar nog steeds bruikbaar: focus op overzicht, professionele uitstraling en minder losse administratie in de werkdag.`,
    );
  }

  const pitfalls: string[] = [];
  if (state.teamCount === 1) {
    pitfalls.push(
      `Dit is een klein bedrijf. Houd het gesprek praktisch, kort en dicht op de werkdag.`,
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
  if (results.timeSaved.hoursPerWeekSaved < 2) {
    pitfalls.push(
      `De tijdspijn voelt waarschijnlijk niet extreem. Laat daarom ook zien wat meer overzicht en strakkere samenwerking oplevert.`,
    );
  }
  if (pitfalls.length === 0) {
    pitfalls.push(
      `Er is geen grote blokkade zichtbaar. De valkuil is dan te algemeen blijven en te weinig aan te sluiten op hun eigen werkweek.`,
    );
  }

  const salesTips: string[] = [
    `Open met: “Voor ${state.companyName || 'jouw bedrijf'} zit de snelste winst in ${angleRanking[0].label.toLowerCase()}.”`,
    temperature === 'Hoog'
      ? 'Bel dit bedrijf snel na. Hier zit genoeg urgentie in om het gesprek meteen concreet te maken.'
      : 'Vertaal de scan in je eerste gesprek naar hun werkdag en bedrijfssituatie, niet alleen naar losse cijfers.',
    intent === 'demo'
      ? 'Deze aanvraag vraagt al om een demo. Houd je opening kort en ga daarna meteen naar de grootste winsthoek.'
      : intent === 'scan'
        ? 'De scan is al verstuurd. Open je eerste contact bij de sterkste uitkomst en vraag of ze dat nu ook zo ervaren in hun bedrijf.'
        : 'Stuur eerst de samenvatting. Pak daarna in je eerste contact de grootste winsthoek erbij.',
    state.missedProjects > 0
      ? 'Laat concreet zien hoe samenwerking, projectdepot en duidelijke verdeling grotere klussen veiliger maken.'
      : 'Laat zien hoe VloerGroep de bestaande operatie strakker maakt, ook zonder meteen groter te hoeven worden.',
  ];

  const nextStep =
    intent === 'demo'
      ? 'Bel binnen 1 werkdag. Open met de sterkste uitkomst uit de scan en prik daarna pas een demo.'
      : intent === 'scan'
        ? 'De scan is al verstuurd. Pak binnen 1 of 2 werkdagen de sterkste uitkomst erbij en vraag of ze dat herkennen in hun bedrijf.'
        : 'Stuur eerst de samenvatting. Bel daarna kort na en open bij de grootste winsthoek uit de scan.';

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
