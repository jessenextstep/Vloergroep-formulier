import { processLeadSubmission } from '../src/server/leadService';

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
        deliveryMode: 'preview',
        message: 'Method not allowed.',
      });
    }

    const parsedBody =
      typeof req.body === 'string'
        ? (() => {
            try {
              return JSON.parse(req.body);
            } catch {
              return req.body;
            }
          })()
        : req.body;

    const result = await processLeadSubmission(parsedBody);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Unhandled lead API error', error);
    return res.status(500).json({
      ok: false,
      deliveryMode: 'preview',
      message: 'Er ging iets mis in de serverfunctie. Probeer het zo nog eens.',
    });
  }
}
