export function formatDutchDate(value?: string | null): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!isoMatch) {
    return trimmed;
  }

  return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
}
