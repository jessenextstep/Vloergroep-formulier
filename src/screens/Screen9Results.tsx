import React, { useMemo, useState } from 'react';
import { QuizState, CalculationResults } from '../types';
import { formatCurrency, formatNumber } from '../lib/utils';
import { buildLeadProfile, getPaymentDaysLabel } from '../lib/leadProfile';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import extraOmzetIcon from '../Afbeeldingen/Extra omzet.png';

interface Props {
  state: QuizState;
  results: CalculationResults;
  onNext: () => void;
  onBack: () => void;
}

export default function Screen9Results({ state, results, onNext, onBack }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const profile = useMemo(() => buildLeadProfile(state, results, 'scan'), [results, state]);
  const companyReference = state.companyName || 'jouw bedrijf';

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center pb-8 pt-12 md:py-8">
      
      {/* Header */}
      <div className="text-center mb-10 w-full">
        <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tighter">
          {state.firstName 
            ? `Jouw potentiële groei met VloerGroep, ${state.firstName}` 
            : `Jouw potentiële groei met VloerGroep`}
        </h1>
        <p className="text-lg text-[#FBEFD5]/60 max-w-2xl mx-auto">
          {state.companyName 
            ? `We hebben de berekening speciaal voor ${state.companyName} gemaakt op basis van je antwoorden.` 
            : `Volledig toegespitst op de antwoorden uit jouw praktijk.`}
        </p>
        <p className="text-sm text-[#FBEFD5]/42 max-w-2xl mx-auto mt-3">
          Alle bedragen in deze scan zijn indicatief en ex. btw.
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
        <Card className="relative overflow-hidden group !p-6 flex flex-col justify-between">
          <div className="relative mb-4 h-[58px] md:h-[64px]">
            <div className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-amber-gold/14 blur-2xl" />
            <img
              src={extraOmzetIcon}
              alt=""
              aria-hidden="true"
              className="relative z-10 h-auto w-[56px] object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.28)] md:w-[62px]"
            />
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-gold mb-2">Extra omzet p/j</p>
          <h2 className="text-4xl font-bold font-display text-white mb-1">
            {formatCurrency(results.totals.totalExtraRevenue)}
          </h2>
          <p className="text-[11px] text-[#FBEFD5]/40 mt-auto">Groeipotentieel via tijd, leads en samenwerking</p>
        </Card>

        <Card className="relative overflow-hidden group !p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-amber-gold">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-gold mb-2">Extra capaciteit</p>
          <h2 className="text-4xl font-bold font-display text-white mb-1 flex items-baseline gap-1">
            +{formatNumber(results.totals.totalExtraCapacityWeeks, 1)} <span className="text-lg font-light text-[#FBEFD5]/60">weken</span>
          </h2>
          <p className="text-[11px] text-[#FBEFD5]/40 mt-auto">Ruimte voor grotere projecten</p>
        </Card>

        <Card className="relative overflow-hidden group !p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-amber-gold">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-gold mb-2">Cashflow versnelling</p>
          <h2 className="text-4xl font-bold font-display text-white mb-1">
            {formatCurrency(results.cashflow.fasterCashflow)}
          </h2>
          <p className="text-[11px] text-[#FBEFD5]/40 mt-auto">Sneller vrij geld voor je bedrijf</p>
        </Card>

        <Card className="relative overflow-hidden group !p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-amber-gold">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-gold mb-2">Extra winst p/j</p>
          <h2 className="text-4xl font-bold font-display text-white mb-1">
            {formatCurrency(results.totals.totalExtraProfit)}
          </h2>
          <p className="text-[11px] text-[#FBEFD5]/40 mt-auto">Op basis van marge ({formatNumber(51.8, 1)}%)</p>
        </Card>
      </div>

      {/* Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
        
        <div className="flex items-start gap-4 rounded-[20px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(38,38,38,0.4),rgba(18,18,18,0.18))] p-5 text-left shadow-lg backdrop-blur-xl">
          <div className="w-10 h-10 shrink-0 rounded-full bg-amber-gold/10 flex items-center justify-center text-amber-gold font-bold">1</div>
          <div className="min-w-0 flex-1 text-left">
            <h4 className="text-sm font-semibold text-white">Tijdswinst per week</h4>
            <p className="text-xs text-[#FBEFD5]/50">{formatNumber(results.timeSaved.hoursPerWeekSaved, 1)} uur minder regelwerk in de organisatie</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-[20px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(38,38,38,0.4),rgba(18,18,18,0.18))] p-5 text-left shadow-lg backdrop-blur-xl">
          <div className="w-10 h-10 shrink-0 rounded-full bg-amber-gold/10 flex items-center justify-center text-amber-gold font-bold">2</div>
          <div className="min-w-0 flex-1 text-left">
            <h4 className="text-sm font-semibold text-white">Focus op betere leads</h4>
            <p className="text-xs text-[#FBEFD5]/50">Meer passende klussen voor jullie team</p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-[20px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(38,38,38,0.4),rgba(18,18,18,0.18))] p-5 text-left shadow-lg backdrop-blur-xl">
          <div className="w-10 h-10 shrink-0 rounded-full bg-amber-gold/10 flex items-center justify-center text-amber-gold font-bold">3</div>
          <div className="min-w-0 flex-1 text-left">
            <h4 className="text-sm font-semibold text-white">Samenwerking</h4>
            <p className="text-xs text-[#FBEFD5]/50">{state.missedProjects === 0 ? 'Netwerk als extra optie' : `${state.missedProjects} misgelopen klus${state.missedProjects > 1 ? 'sen' : ''} weer kunnen oppakken`}</p>
          </div>
        </div>
        
      </div>

      <div className="w-full mb-10 rounded-[24px] border border-amber-gold/14 bg-[linear-gradient(180deg,rgba(224,172,62,0.10),rgba(224,172,62,0.04))] p-6 md:p-7 text-center md:text-left">
        <span className="inline-flex rounded-full border border-amber-gold/18 bg-amber-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-gold mb-4">
          Volgende stap
        </span>
        <div className="max-w-3xl">
          <h3 className="text-2xl md:text-3xl font-bold font-display text-white mb-3 tracking-tight">
            Wil je de volledige scan rustig teruglezen?
          </h3>
          <p className="max-w-2xl text-white/80 leading-7">
            We sturen de complete berekening voor {companyReference} naar je inbox, inclusief de toelichting achter de cijfers en waar volgens je antwoorden de meeste ruimte zit in {profile.primaryAngle.toLowerCase()}.
          </p>
          <button
            type="button"
            onClick={onNext}
            className="mt-5 inline-flex items-center gap-2 text-sm font-display font-bold tracking-[-0.02em] text-amber-gold transition-colors hover:text-[#f0bc50]"
          >
            Ontvang mijn volledige scan
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Details Toggle */}
      <div className="flex justify-center mb-12">
         <button 
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls="results-details-panel"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors py-2 px-4 rounded-full bg-white/5"
          >
            {showDetails ? 'Verberg details' : 'Hoe is dit berekend?'}
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
         </button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div 
            id="results-details-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-12 rounded-[20px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(38,38,38,0.4),rgba(18,18,18,0.18))] p-6 text-sm text-white/70 shadow-lg backdrop-blur-md md:p-8">
              <span className="inline-block text-xs font-semibold tracking-wider text-amber-gold uppercase mb-2">
                Dit verandert er in de werkdag van {state.companyName || 'jouw bedrijf'}
              </span>
              <h4 className="text-2xl font-bold text-white mb-2">Hoe VloerGroep dit voor je oplevert</h4>
              <p className="text-white/60 mb-8 border-b border-white/10 pb-6">Geen losse berekening, maar gebaseerd op wat er in jouw werkproces verandert.</p>
              
              <div className="space-y-10">
                {/* Tijdswinst */}
                <div>
                  <h5 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-gold"></span>
                    Tijdswinst (automatisering & overzicht)
                  </h5>
                  <p className="mb-4">
                    In de scan heb je ingevuld hoeveel tijd er in jullie hele organisatie per week opgaat aan administratie, planning, communicatie en betalingen.
                    Daardoor rekenen we niet met een ruwe aanname per medewerker, maar met jouw eigen totaal. In totaal winnen jullie die tijd wekelijks terug door:
                  </p>
                  <ul className="space-y-1.5 mb-5 pl-4">
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span>Automatische leadverdeling</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span>Centrale communicatie (geen losse appjes)</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span>Planning en overzicht in één systeem</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span>Facturatie en betaling vooraf geregeld</span>
                    </li>
                  </ul>
                  {results.timeSaved.hoursPerWeekSaved > 0 && (
                    <div className="flex gap-3 items-start bg-amber-gold/5 p-4 rounded-xl border border-amber-gold/10 text-white/90">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-gold shrink-0 mt-2"></div>
                      <span>Dit levert in totaal circa {formatNumber(results.timeSaved.hoursPerWeekSaved, 1)} bruikbare uren per week op voor het hele bedrijf. Daarvan rekenen we 85% als realistisch inzetbaar voor extra werk of rust in de planning.</span>
                    </div>
                  )}
                </div>

                {/* Extra omzet (tijd) */}
                {results.timeSaved.hoursPerWeekSaved > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-gold"></span>
                      Extra omzet (tijd → betaalde uren)
                    </h5>
                    <p className="mb-4">
                      De uren die vrijkomen worden niet “extra gewerkt”, maar verschuiven van regelen naar betaald werk. We rekenen met {state.weeksPerYear} werkbare weken per jaar tegen jullie gemiddelde uurtarief van {formatCurrency(state.hourlyRate)} ex. btw.
                    </p>
                    <div className="flex gap-3 items-start bg-amber-gold/5 p-4 rounded-xl border border-amber-gold/10 text-white/90">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-gold shrink-0 mt-2"></div>
                      <span>
                        Daarom ontstaat extra omzet zonder dat je harder werkt:<br/>
                        <strong className="text-amber-gold font-medium mt-1 inline-block">
                          {formatNumber(results.timeSaved.hoursPerWeekSaved, 1)} uur × {state.weeksPerYear} weken × 85% factureerbaar × {formatCurrency(state.hourlyRate)} = {formatCurrency(results.timeSaved.extraRevenueTime)}
                        </strong> per jaar.
                      </span>
                    </div>
                  </div>
                )}

                {/* Groei */}
                <div>
                  <h5 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-gold"></span>
                    Groei (betere leads & samenwerking)
                  </h5>
                  <p className="mb-4">
                    Je krijgt minder ruis en meer gerichte klussen door de VloerGroep matchmaking. Voor een bedrijf met {state.teamCount} {state.teamCount === 1 ? 'persoon' : 'mensen'} in uitvoering rekenen we daarom met zo'n {formatNumber(results.growthLeads.extraProjectsYear, 1)} extra passende klussen per jaar.
                    {state.missedProjects > 0 ? ` Ook gaf je aan dat jullie soms een grotere klus moeten laten lopen. Via de projectuitwisseling en samenwerking in het netwerk vang je daarvan ongeveer ${formatCurrency(results.growthCollaboration.extraRevenueTeam)} weer op.` : ''}
                  </p>
                  <ul className="space-y-1.5 mb-5 pl-4">
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span>Grotere projecten aannemen via het netwerk</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span>Werk verdelen met gecertificeerde vakmannen</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span>Sneller opleveren</span>
                    </li>
                  </ul>
                  <div className="flex gap-3 items-start bg-amber-gold/5 p-4 rounded-xl border border-amber-gold/10 text-white/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-gold shrink-0 mt-2"></div>
                    <div className="w-full">
                      <span>Hier zie je hoe dat is opgebouwd voor jullie bedrijf:</span>
                      <ul className="mt-3 space-y-2 text-sm">
                        <li className="flex justify-between items-center border-b border-amber-gold/10 pb-2">
                          <span className="text-white/70">10% groei via leads ({formatNumber(results.growthLeads.extraHoursYear, 0)} uur × {formatCurrency(state.hourlyRate)})</span>
                          <strong className="text-amber-gold">{formatCurrency(results.growthLeads.extraRevenueLeads)}</strong>
                        </li>
                        {state.missedProjects > 0 && (
                          <li className="flex justify-between items-center border-b border-amber-gold/10 pb-2">
                          <span className="text-white/70">Grotere projecten alsnog kunnen uitvoeren</span>
                            <strong className="text-amber-gold">{formatCurrency(results.growthCollaboration.extraRevenueTeam)}</strong>
                          </li>
                        )}
                        <li className="flex justify-between items-center pt-1 font-medium">
                          <span>Totaal groeipotentieel via platform</span>
                          <strong className="text-amber-gold text-base">{formatCurrency(results.growthLeads.extraRevenueLeads + results.growthCollaboration.extraRevenueTeam)} / jr</strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cashflow */}
                <div>
                  <h5 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-gold"></span>
                    Cashflow (sneller de touwtjes in handen)
                  </h5>
                  <p className="mb-4">
                    Dit is geen extra omzet, maar wel een fundamentele groeiversneller. Je gaf aan dat je nu meestal {getPaymentDaysLabel(state.paymentDays).toLowerCase()} moet wachten op je geld. Omdat VloerGroep vanuit het veilige projectdepot direct betaalt, komt er veel minder geld vast te zitten in openstaande posten:
                  </p>
                  <ul className="space-y-1.5 mb-5 pl-4">
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span><strong>Materiaal & Materieel:</strong> Direct budget voor investeringen.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span><strong>Risicovrij:</strong> Geen stress om onbetaalde facturen, zeker bij grote projecten.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-amber-gold/60 mt-0.5">•</span>
                      <span><strong>Rust in je hoofd:</strong> Je weet precies waar het bedrijf financieel aan toe is.</span>
                    </li>
                  </ul>
                  <div className="flex gap-3 items-start bg-amber-gold/5 p-4 rounded-xl border border-amber-gold/10 text-white/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-gold shrink-0 mt-2"></div>
                    <span>Bij jullie bedrijfsgrootte praten we dan al snel over <strong className="text-amber-gold font-medium">{formatCurrency(results.cashflow.fasterCashflow)}</strong> cash die veel sneller vrijkomt in plaats van vast te zitten in debiteuren. </span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to push content above sticky footer */}
      <div className="h-32 w-full shrink-0" />

      {/* Sticky footer for both mobile and desktop with primary CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#050505]/92 p-4 pb-[max(env(safe-area-inset-bottom),1rem)] backdrop-blur-3xl sm:p-5">
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between px-2 sm:px-6">
          <button onClick={onBack} className="text-white/60 hover:text-white transition-colors text-sm font-medium hidden sm:block">
            Aanpassen
          </button>
          <div className="flex w-full sm:w-auto ml-auto">
            <Button onClick={onNext} className="w-full sm:w-auto !px-10 !py-4 text-[16px] xl:text-[18px] shadow-xl shadow-amber-gold/20 active:scale-95">
              Ontvang mijn volledige scan
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
