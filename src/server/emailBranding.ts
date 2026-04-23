const EMAIL_LOGO_PATH = '/email/vloergroep-logo-white.png';
const EMAIL_INVITE_THANKS_HERO_PATH = '/email/hero-screen-thanks.webp';

function normalizeAbsoluteUrl(value?: string): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  );
}

function buildEmailAssetUrl(assetPath: string, siteUrl?: string): string | null {
  const baseUrl = normalizeAbsoluteUrl(siteUrl);
  if (!baseUrl) {
    return null;
  }

  const base = new URL(baseUrl);
  if (isLocalHostname(base.hostname)) {
    return null;
  }

  return new URL(assetPath, `${base.toString()}/`).toString();
}

export function buildEmailLogoUrl(siteUrl?: string): string | null {
  return buildEmailAssetUrl(EMAIL_LOGO_PATH, siteUrl);
}

export function buildEmailInviteThanksHeroUrl(siteUrl?: string): string | null {
  return buildEmailAssetUrl(EMAIL_INVITE_THANKS_HERO_PATH, siteUrl);
}
