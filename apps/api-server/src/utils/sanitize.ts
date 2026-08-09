const MAX_DISPLAY_NAME = 20;

/**
 * Normalises any name that leaves the API. Names are server-assigned today, but this is
 * the single choke point that keeps markup, control characters and oversized strings out
 * of the leaderboard the day editable names or chat are added.
 */
export function sanitizeDisplayName(raw: string): string {
  const cleaned = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_DISPLAY_NAME);
  return cleaned.length > 0 ? cleaned : 'Corredor RD';
}
