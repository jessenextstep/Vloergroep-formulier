<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your VloerGroep scan

Deze repo bevat de interactieve groeiscan voor VloerGroep, inclusief een voorbereid lead-endpoint voor Vercel, Resend en Brevo.

## Run Locally

**Prerequisites:** Node.js


1. Installeer dependencies:
   `npm ci`
2. Maak lokaal een `.env.local` aan als je de mailflow wilt testen:
   `RESEND_API_KEY=...`
   `RESEND_FROM_EMAIL=VloerGroep <onboarding@resend.dev>` (alleen voor lokaal testen)
   `LEAD_NOTIFICATION_EMAIL=info@vloergroep.nl`
   `BREVO_API=...`
   `BREVO_LIST_IDS=12`
   `BREVO_DEMO_LIST_ID=34`
   `BREVO_INFO_LIST_ID=56`
   `VLOERGROEP_DEMO_URL=https://vloergroep.nl`
   `VITE_VLOERGROEP_DEMO_URL=https://vloergroep.nl`
3. Start de app:
   `npm run dev`

## Mailflow

Bij een lead-aanvraag gebeurt automatisch het volgende:

1. De frontend post naar `/api/lead`.
2. De server valideert de invoer opnieuw, rekent de business case server-side door en blokkeert simpele spam via een honeypot + snelheidcheck.
3. Er worden twee mails opgebouwd:
   - een moderne bevestigingsmail voor de gebruiker met scanoverzicht en gekozen opties
   - een interne salesmail naar `info@vloergroep.nl` met kansen, valkuilen en verkooptips
4. Als `BREVO_API` aanwezig is, wordt de lead ook naar Brevo gesynchroniseerd:
   - contact wordt aangemaakt of bijgewerkt via het contact-endpoint
   - scan-attributen worden gevuld op het contact
   - de lead wordt optioneel aan gedeelde en/of intent-specifieke lijsten toegevoegd

Zodra `RESEND_API_KEY` in Vercel staat, is de flow live. Zonder sleutel draait de app lokaal in previewmodus zodat de UX gewoon getest kan worden.

## Resend in productie

Voor productie is `onboarding@resend.dev` niet toegestaan voor echte ontvangers.

- Verifieer eerst een domein of subdomein in Resend
- Zet daarna in Vercel `RESEND_FROM_EMAIL` op een afzender van dat domein
- Voorbeeld: `VloerGroep <demo@updates.vloergroep.nl>`

Als `RESEND_FROM_EMAIL` ontbreekt of nog op `resend.dev` staat, blokkeert de backend verzending nu bewust met een duidelijke foutmelding.

## Brevo variabelen

- `BREVO_API`: je Brevo API key
- `BREVO_LIST_IDS`: optionele komma-gescheiden basislijsten voor alle scan-leads
- `BREVO_DEMO_LIST_ID`: optionele extra lijst voor demo-aanvragen
- `BREVO_INFO_LIST_ID`: optionele extra lijst voor info-aanvragen

De code vult nu onder andere deze Brevo-attributen voor de groeiscan:

- `VOLLEDIGE_NAAM`
- `FIRSTNAME`
- `TELEFOONNUMMER`
- `BEDRIJF`
- `SOURCE`
- `LEAD_INTENT`
- `TEAM_GROOTTE`
- `UURTARIEF`
- `FACTUREERBARE_UREN_PER_WEEK`
- `WERKWEKEN_PER_JAAR`
- `TIJD_ADMIN`
- `TIJD_PLANNING`
- `TIJD_COMMUNICATIE`
- `TIJD_BETALING`
- `BETAALTERMIJN_DAGEN`
- `AANDEEL_VLOERGROEP_PROCENT`
- `GEMISTE_GROTE_PROJECTEN`
- `EXTRA_OMZET_POTENTIE`
- `EXTRA_WINST_POTENTIE`
- `EXTRA_CAPACITEIT_WEKEN`
- `SNELLER_VRIJ_WERKKAPITAAL`
- `LEAD_SCORE`
- `LEAD_TEMPERATUUR`
- `PRIMAIRE_HAAK`
- `AANBEVOLEN_VOLGENDE_STAP`
- `SCAN_DATUM`
