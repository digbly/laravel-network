import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';

export interface NavItem {
  to: string;
  labelKey: string;
  Icon: ComponentType<{ className?: string }>;
  end?: boolean;
}

export interface AdminModule {
  /** Routes rendered inside the protected admin shell. */
  routes?: RouteObject[];
  /**
   * Routes rendered under `/websites/:websiteId` but outside the admin shell
   * (no sidebar/topbar). Used by full-screen experiences such as the theme
   * customizer.
   */
  standaloneRoutes?: RouteObject[];
  /** Routes rendered outside the admin shell (e.g. public auth pages). */
  publicRoutes?: RouteObject[];
}
