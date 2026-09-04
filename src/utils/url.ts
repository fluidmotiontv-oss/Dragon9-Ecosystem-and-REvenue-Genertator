/**
 * URL and Link utility helpers for Dragon9 Ecosystem
 * Ensures all external and internal links function reliably across devices,
 * viewports, and sandboxed iframe environments.
 */

export function ensureUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Safely opens an external link in a new window/tab,
 * with fallback handling for restrictive iframe sandbox policies.
 */
export function openExternalUrl(url: string, e?: React.MouseEvent) {
  if (e) {
    // If command/ctrl click, let browser handle naturally
    if (e.metaKey || e.ctrlKey) return;
  }
  const safeUrl = ensureUrl(url);
  if (!safeUrl) return;

  try {
    const opened = window.open(safeUrl, '_blank', 'noopener,noreferrer');
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      // In case window.open was blocked by an iframe sandbox popup policy,
      // create a synthetic temporary anchor and trigger click
      const a = document.createElement('a');
      a.href = safeUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.warn('Failed to open window directly, falling back to anchor dispatch', err);
    const a = document.createElement('a');
    a.href = safeUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Extracts all HTTP/HTTPS and URL patterns from raw text.
 */
export function extractUrls(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/(https?:\/\/[^\s\)\],]+|www\.[^\s\)\],]+)/gi);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => ensureUrl(m))));
}
