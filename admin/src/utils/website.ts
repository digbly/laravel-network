/**
 * The website picker lives at `/websites` (no website selected yet) while the
 * website-scoped admin pages live at `/websites/{websiteId}/...`.
 *
 * The website id is part of the router path and used both as the API prefix
 * and to remember the last visited website. Note that the JSON API is still
 * namespaced under `/admin`, e.g. `/admin/websites/{websiteId}/users`.
 */

/** Backend API namespace (unchanged by the frontend URL prefix). */
const API_PREFIX = '/admin';

/** Frontend segment that groups the picker and the website-scoped pages. */
const WEBSITES_SEGMENT = 'websites';

const LAST_WEBSITE_KEY = 'sitestore_last_website';

export const getAdminBasename = (): string =>
  (import.meta.env.BASE_URL as string | undefined) || '/';

/** Current pathname with the deployment basename stripped. */
const getCurrentPath = (): string => {
  const basename = getAdminBasename();
  const { pathname } = window.location;

  if (basename && basename !== '/' && pathname.startsWith(basename)) {
    return pathname.slice(basename.length - 1);
  }

  return pathname;
};

export const getWebsiteId = (): string | null => {
  const [segment, websiteId] = getCurrentPath().split('/').filter(Boolean);

  return segment === WEBSITES_SEGMENT ? websiteId ?? null : null;
};

/**
 * Build a router path scoped to a website, e.g. `/dashboard` becomes
 * `/websites/{websiteId}/dashboard`. Returns the path unchanged when no website
 * is given.
 */
export const websitePath = (path: string, websiteId?: string | null): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  return websiteId ? `/${WEBSITES_SEGMENT}/${websiteId}${normalized}` : normalized;
};

/** Remove the leading `/websites/{websiteId}` segment from a router pathname. */
export const stripWebsitePrefix = (
  pathname: string,
  websiteId?: string | null,
): string => {
  const prefix = websiteId ? `/${WEBSITES_SEGMENT}/${websiteId}` : null;

  if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return pathname.slice(prefix.length) || '/';
  }

  return pathname;
};

/** API path of the website collection, e.g. `/admin/websites`. */
export const websitesApiPath = (): string => `${API_PREFIX}/websites`;

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
      'Admin website id is missing. Access the admin under /websites/{websiteId}.',
    );
  }

  return `${websitesApiPath()}/${websiteId}${normalized}`;
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
