import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage } from 'node:http';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { processLeadSubmission } from './src/server/leadService';

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
            demoUrl: process.env.VLOERGROEP_DEMO_URL,
            environment: process.env.NODE_ENV,
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
