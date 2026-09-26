/**
 * The admin SPA is served under `/admin/{websiteId}/...` (mirrors the backend
 * `admin_url()` helper). The website id is therefore taken from the URL path
 * and used both as the router basename and as the API prefix.
 */
const WEBSITE_ID_PATTERN = /^\/admin\/([^/]+)/;

export const getWebsiteId = (): string | null =>
  window.location.pathname.match(WEBSITE_ID_PATTERN)?.[1] ?? null;

export const getAdminBasename = (): string | undefined => {
  const websiteId = getWebsiteId();

  return websiteId ? `/admin/${websiteId}` : undefined;
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

  return `/admin/websites/${websiteId}${normalized}`;
};
