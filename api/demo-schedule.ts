import {
  getDemoScheduleState,
  processDemoScheduleAction,
} from '../src/server/demoScheduleService.js';

type MinimalRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
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

function readQueryToken(req: MinimalRequest): string {
  const fromQuery = req.query?.t;
  if (typeof fromQuery === 'string') {
    return fromQuery;
  }

  if (req.url) {
    try {
      const url = new URL(req.url, 'http://localhost');
      return url.searchParams.get('t')?.trim() ?? '';
    } catch {
      return '';
    }
  }

  return '';
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  try {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    if (req.method === 'GET') {
      const token = readQueryToken(req);
      const result = await getDemoScheduleState(token, {
        siteUrl: resolveRequestOrigin(req),
      });
      return res.status(result.status).json(result.body);
    }

    if (req.method === 'POST') {
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

      const result = await processDemoScheduleAction(parsedBody, {
        siteUrl: resolveRequestOrigin(req),
      });
      return res.status(result.status).json(result.body);
    }

    return res.status(405).json({
      ok: false,
      deliveryMode: 'preview',
      message: 'Method not allowed.',
    });
  } catch (error) {
    console.error('Unhandled demo schedule API error', error);
    return res.status(500).json({
      ok: false,
      deliveryMode: 'preview',
      message: 'Er ging iets mis in de afspraakflow. Probeer het zo nog eens.',
    });
  }
}
