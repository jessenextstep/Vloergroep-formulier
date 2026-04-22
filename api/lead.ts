import { processLeadSubmission } from '../src/server/leadService.js';

type MinimalRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type MinimalResponse = {
  status: (statusCode: number) => MinimalResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

function readHeader(
  headers: Record<string, string | string[] | undefined> | undefined,
  name: string,
): string | undefined {
  if (!headers) {
    return undefined;
  }

  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function resolveRequestOrigin(req: MinimalRequest): string | undefined {
  const forwardedHost = readHeader(req.headers, 'x-forwarded-host')
    ?.split(',')[0]
    ?.trim();
  const host = forwardedHost || readHeader(req.headers, 'host')?.split(',')[0]?.trim();

  if (!host) {
    return undefined;
  }

  const forwardedProto = readHeader(req.headers, 'x-forwarded-proto')
    ?.split(',')[0]
    ?.trim();
  const protocol = forwardedProto || (host.includes('localhost') ? 'http' : 'https');

  return `${protocol}://${host}`;
}

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

    const result = await processLeadSubmission(parsedBody, {
      siteUrl: resolveRequestOrigin(req),
    });
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
