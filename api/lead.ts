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

  const result = await processLeadSubmission(req.body);
  return res.status(result.status).json(result.body);
}
