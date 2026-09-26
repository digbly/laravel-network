import type { NavigationItem } from '../types/navigation';
import { hasPermission } from './permission';

/**
 * Keep only the items the user is allowed to see. Groups are kept while at
 * least one child remains visible. Unknown permissions stay visible, matching
 * the UI-side (non-authoritative) permission model.
 */
export const filterNavigation = (
  items: NavigationItem[],
  permissions?: string[],
): NavigationItem[] =>
  items.flatMap((item) => {
    if (item.children.length > 0) {
      const children = filterNavigation(item.children, permissions);

      return children.length > 0 ? [{ ...item, children }] : [];
    }

    if (!item.to) {
      return [];
    }

    return hasPermission(permissions, item.permission ?? undefined) ? [item] : [];
  });

export const flattenNavigation = (items: NavigationItem[]): NavigationItem[] =>
  items.flatMap((item) => [item, ...flattenNavigation(item.children)]);

/**
 * Resolve the title for a route path, falling back to the longest nav prefix
 * so detail/form pages (e.g. `/blog/posts/new`) inherit the section title.
 */
export const resolveNavigationTitle = (
  items: NavigationItem[],
  pathname: string,
): string | undefined => {
  const links = flattenNavigation(items).filter(
    (item): item is NavigationItem & { to: string } => Boolean(item.to),
  );

  const exact = links.find((item) => item.to === pathname);

  if (exact) {
    return exact.label;
  }

  return links
    .filter((item) => pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0]?.label;
};
