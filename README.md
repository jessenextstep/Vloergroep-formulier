<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your VloerGroep scan

Deze repo bevat de interactieve groeiscan voor VloerGroep, inclusief een voorbereid lead-endpoint voor Vercel en Resend.

## Run Locally

**Prerequisites:** Node.js


1. Installeer dependencies:
   `npm ci`
2. Maak lokaal een `.env.local` aan als je de mailflow wilt testen:
   `RESEND_API_KEY=...`
   `RESEND_FROM_EMAIL=VloerGroep <onboarding@resend.dev>`
   `LEAD_NOTIFICATION_EMAIL=info@vloergroep.nl`
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

Zodra `RESEND_API_KEY` in Vercel staat, is de flow live. Zonder sleutel draait de app lokaal in previewmodus zodat de UX gewoon getest kan worden.
