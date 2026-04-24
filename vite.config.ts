import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage } from 'node:http';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { processLeadSubmission } from './src/server/leadService';
import { processDemoRequestSubmission } from './src/server/demoRequestService';
import { getInviteByEncodedEmail } from './src/server/inviteService';
import { processInviteRsvp } from './src/server/inviteRsvpService';

async function readJsonBody(req: IncomingMessage) {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

function leadApiDevPlugin() {
  return {
    name: 'lead-api-dev-plugin',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/invite-rsvp')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({
              ok: false,
              message: 'Method not allowed.',
            }));
            return;
          }

          try {
            const payload = await readJsonBody(req);
            const result = await processInviteRsvp(payload, {
              brevoApiKey: process.env.BREVO_API,
              senderEmail: process.env.BREVO_FROM_EMAIL || process.env.RESEND_FROM_EMAIL,
              adminEmail: process.env.INVITE_ADMIN_EMAIL || process.env.LEAD_NOTIFICATION_EMAIL,
              siteUrl: process.env.PUBLIC_SITE_URL || 'http://localhost:3000',
              launchDate: process.env.INVITE_LAUNCH_DATE,
              launchTime: process.env.INVITE_LAUNCH_TIME,
              launchLocation: process.env.INVITE_LAUNCH_LOCATION,
              calendarUrl: process.env.INVITE_CALENDAR_URL,
              eventStartIso: process.env.INVITE_EVENT_START_ISO,
              eventEndIso: process.env.INVITE_EVENT_END_ISO,
              eventTitle: process.env.INVITE_EVENT_TITLE,
              eventDescription: process.env.INVITE_EVENT_DESCRIPTION,
            });

            res.statusCode = result.status;
            res.end(JSON.stringify(result.body));
            return;
          } catch (error) {
            console.error('Invite RSVP dev middleware failed', error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              ok: false,
              message: error instanceof Error ? error.message : 'Invite RSVP kon lokaal niet worden verwerkt.',
            }));
            return;
          }
        }

        if (req.url?.startsWith('/api/invite')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');

          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.end(JSON.stringify({
              ok: false,
              message: 'Method not allowed.',
            }));
            return;
          }

          try {
            const requestUrl = new URL(req.url, 'http://localhost:3000');
            const encodedInvite = requestUrl.searchParams.get('e')?.trim() ?? '';

            if (!encodedInvite) {
              res.statusCode = 400;
              res.end(JSON.stringify({
                ok: false,
                message: 'Missing invite parameter.',
              }));
              return;
            }

            const invite = await getInviteByEncodedEmail(encodedInvite, {
              apiKey: process.env.BREVO_API,
              launchDate: process.env.INVITE_LAUNCH_DATE,
              launchTime: process.env.INVITE_LAUNCH_TIME,
              launchLocation: process.env.INVITE_LAUNCH_LOCATION,
              calendarUrl: process.env.INVITE_CALENDAR_URL,
              eventStartIso: process.env.INVITE_EVENT_START_ISO,
              eventEndIso: process.env.INVITE_EVENT_END_ISO,
              eventTitle: process.env.INVITE_EVENT_TITLE,
              eventDescription: process.env.INVITE_EVENT_DESCRIPTION,
            });

            res.statusCode = 200;
            res.end(JSON.stringify({
              ok: true,
              invite,
            }));
            return;
          } catch (error) {
            console.error('Invite API dev middleware failed', error);
            const message = error instanceof Error ? error.message : 'Invite API kon lokaal niet worden verwerkt.';
            res.statusCode = message === 'Invitation contact not found.' ? 404 : 500;
            res.end(JSON.stringify({
              ok: false,
              message,
            }));
            return;
          }
        }

        if (req.url?.startsWith('/api/demo-request')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({
              ok: false,
              deliveryMode: 'preview',
              message: 'Method not allowed.',
            }));
            return;
          }

          try {
            const payload = await readJsonBody(req);
            const result = await processDemoRequestSubmission(payload, {
              resendApiKey: process.env.RESEND_API_KEY,
              resendFromEmail: process.env.RESEND_FROM_EMAIL,
              adminEmail: process.env.DEMO_REQUEST_ADMIN_EMAIL || 'joost@vloergroep.nl',
              environment: process.env.NODE_ENV,
              siteUrl: process.env.PUBLIC_SITE_URL || 'http://localhost:3000',
              brevoApiKey: process.env.BREVO_API,
            });

            res.statusCode = result.status;
            res.end(JSON.stringify(result.body));
            return;
          } catch (error) {
            console.error('Demo request API dev middleware failed', error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              ok: false,
              deliveryMode: 'preview',
              message: 'Demo API kon lokaal niet worden verwerkt.',
            }));
            return;
          }
        }

        if (!req.url?.startsWith('/api/lead')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({
            ok: false,
            deliveryMode: 'preview',
            message: 'Method not allowed.',
          }));
          return;
        }

        try {
          const payload = await readJsonBody(req);
          const result = await processLeadSubmission(payload, {
            resendApiKey: process.env.RESEND_API_KEY,
            resendFromEmail: process.env.RESEND_FROM_EMAIL,
            internalEmail: process.env.LEAD_NOTIFICATION_EMAIL,
            environment: process.env.NODE_ENV,
            siteUrl: process.env.PUBLIC_SITE_URL || 'http://localhost:3000',
          });

          res.statusCode = result.status;
          res.end(JSON.stringify(result.body));
        } catch (error) {
          console.error('Lead API dev middleware failed', error);
          res.statusCode = 500;
          res.end(JSON.stringify({
            ok: false,
            deliveryMode: 'preview',
            message: 'Lead API kon lokaal niet worden verwerkt.',
          }));
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), leadApiDevPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
