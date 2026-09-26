import i18n, { i18nReady } from '../i18n';
import type { RouteObject } from 'react-router-dom';
import type { AdminModule, AdminNavEntry, AdminNavItem } from './types';
import { isNavGroup } from './types';
import { hasPermission } from '../utils/permission';

const modules: AdminModule[] = [];

const mergeModuleTranslations = (module: AdminModule): void => {
  if (!module.i18n) return;

  Object.entries(module.i18n).forEach(([language, bundle]) => {
    i18n.addResourceBundle(language, 'translation', bundle, true, true);
  });
};

/**
 * Merge module translation bundles only after the shared `translation`
 * namespace has loaded, otherwise the HTTP backend would overwrite them.
 */
const applyTranslations = (registered: AdminModule[]): void => {
  i18nReady
    .then(() => registered.forEach(mergeModuleTranslations))
    .catch((error) => {
      console.error('Failed to merge module translations', error);
    });
};

export const registerModules = (registered: AdminModule[]): void => {
  modules.push(...registered);
  applyTranslations(registered);
};

export const getAdminRoutes = (): RouteObject[] =>
  modules.flatMap((module) => module.routes ?? []);

export const getPublicRoutes = (): RouteObject[] =>
  modules.flatMap((module) => module.publicRoutes ?? []);

const getAllNavigation = (): AdminNavEntry[] =>
  modules.flatMap((module) => module.nav ?? []);

/** Flatten groups into their child links. */
const flattenNavigation = (entries: AdminNavEntry[]): AdminNavItem[] =>
  entries.flatMap((entry) => (isNavGroup(entry) ? entry.children : entry));

export const getNavigation = (permissions?: string[]): AdminNavEntry[] =>
  getAllNavigation()
    .map((entry) =>
      isNavGroup(entry)
        ? {
            ...entry,
            children: entry.children.filter((child) =>
              hasPermission(permissions, child.permission),
            ),
          }
        : entry,
    )
    .filter((entry) =>
      isNavGroup(entry)
        ? entry.children.length > 0
        : hasPermission(permissions, entry.permission),
    );

export const getRouteTitles = (): Record<string, string> =>
  Object.fromEntries(
    flattenNavigation(getAllNavigation()).map((item) => [item.to, item.labelKey]),
  );
