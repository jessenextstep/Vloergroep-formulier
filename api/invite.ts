import { getInviteByEncodedEmail } from '../src/server/inviteService.js';

type MinimalRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type MinimalResponse = {
  status: (statusCode: number) => MinimalResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

function resolveEncodedInvite(req: MinimalRequest): string {
  const queryValue = req.query?.e;
  if (Array.isArray(queryValue)) {
    return queryValue[0] ?? '';
  }

  if (typeof queryValue === 'string') {
    return queryValue;
  }

  const url = req.url ? new URL(req.url, 'https://formulier.vloergroep.nl') : null;
  return url?.searchParams.get('e') ?? '';
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  try {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    if (req.method !== 'GET') {
      return res.status(405).json({
        ok: false,
        message: 'Method not allowed.',
      });
    }

    const encodedInvite = resolveEncodedInvite(req);

    if (!encodedInvite) {
      return res.status(400).json({
        ok: false,
        message: 'Missing invite parameter.',
      });
    }

    const invite = await getInviteByEncodedEmail(encodedInvite, {});

    return res.status(200).json({
      ok: true,
      invite,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'De uitnodiging kon niet worden geladen.';
    const status = message === 'Invitation contact not found.' ? 404 : 500;

    return res.status(status).json({
      ok: false,
      message,
    });
  }
}
