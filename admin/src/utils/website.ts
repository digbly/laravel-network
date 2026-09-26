/**
 * The admin SPA is served under `/admin/...`. Two kinds of routes exist:
 *
 * - `/admin/websites`        website picker (no website selected yet)
 * - `/admin/{websiteId}/...` website-scoped admin pages
 *
 * The website id is part of the router path and used both as the API prefix
 * and to remember the last visited website.
 */
const ADMIN_PREFIX = '/admin';

const WEBSITE_ID_PATTERN = /^\/admin\/([^/]+)/;

/** Admin segments that are not website ids (e.g. the picker, auth pages). */
const RESERVED_SEGMENTS = new Set(['websites', 'auth']);

const LAST_WEBSITE_KEY = 'sitestore_last_website';

export const getWebsiteId = (): string | null => {
  const segment = window.location.pathname.match(WEBSITE_ID_PATTERN)?.[1] ?? null;

  if (!segment || RESERVED_SEGMENTS.has(segment)) {
    return null;
  }

  return segment;
};

export const getAdminBasename = (): string => ADMIN_PREFIX;

/**
 * Build a router path scoped to a website, e.g. `/dashboard` becomes
 * `/{websiteId}/dashboard`. Returns the path unchanged when no website is given.
 */
export const websitePath = (path: string, websiteId?: string | null): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  return websiteId ? `/${websiteId}${normalized}` : normalized;
};

/** Remove the leading `/{websiteId}` segment from a router pathname. */
export const stripWebsitePrefix = (
  pathname: string,
  websiteId?: string | null,
): string => {
  const prefix = websiteId ? `/${websiteId}` : null;

  if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return pathname.slice(prefix.length) || '/';
  }

  return pathname;
};

/**
 * Prefix an admin API path with the current website id.
 *
 * Example: `/users` -> `/admin/websites/{websiteId}/users`
 */
export const adminApiPath = (path: string): string => {
  const websiteId = getWebsiteId();
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (!websiteId) {
    throw new Error(
      'Admin website id is missing. Access the admin under /admin/{websiteId}.',
    );
  }

  return `${ADMIN_PREFIX}/websites/${websiteId}${normalized}`;
};

export const getLastWebsiteId = (): string | null => {
  try {
    return localStorage.getItem(LAST_WEBSITE_KEY);
  } catch {
    return null;
  }
};

export const setLastWebsiteId = (websiteId: string): void => {
  try {
    localStorage.setItem(LAST_WEBSITE_KEY, websiteId);
  } catch {
    // Ignore storage failures (private mode, quota, ...).
  }
};

export const clearLastWebsiteId = (): void => {
  try {
    localStorage.removeItem(LAST_WEBSITE_KEY);
  } catch {
    // Ignore storage failures (private mode, quota, ...).
  }
};
