import { processInviteRsvp } from '../src/server/inviteRsvpService.js';

type MinimalRequest = {
  method?: string;
  body?: unknown;
};

type MinimalResponse = {
  status: (statusCode: number) => MinimalResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  try {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        ok: false,
        message: 'Method not allowed.',
      });
    }

    const parsedBody =
      typeof req.body === 'string'
        ? (() => {
            try {
              return JSON.parse(req.body);
            } catch {
              return {};
            }
          })()
        : req.body;

    const result = await processInviteRsvp(
      (parsedBody as { e?: string }) ?? {},
      {},
    );

    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : 'De bevestiging kon niet worden verwerkt.',
    });
  }
}
