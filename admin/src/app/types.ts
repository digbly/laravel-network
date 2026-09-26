import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';

export interface NavItem {
  to: string;
  labelKey: string;
  Icon: ComponentType<{ className?: string }>;
  end?: boolean;
}

export interface AdminNavItem extends NavItem {
  permission?: string;
}

export interface ModuleI18nBundle {
  [language: string]: Record<string, unknown>;
}

export interface AdminModule {
  /** Sidebar entries contributed by this module. */
  nav?: AdminNavItem[];
  /** Routes rendered inside the protected admin shell. */
  routes?: RouteObject[];
  /** Routes rendered outside the admin shell (e.g. public auth pages). */
  publicRoutes?: RouteObject[];
  /** Translation bundles merged into the `translation` namespace on registration. */
  i18n?: ModuleI18nBundle;
}
