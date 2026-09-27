import { lazy } from 'react';

export const DashboardView = lazy(() =>
  import('./views/DashboardView').then((module) => ({ default: module.DashboardView }))
);

export const SettingsView = lazy(() =>
  import('./views/SettingsView').then((module) => ({ default: module.SettingsView }))
);

export const UsersView = lazy(() =>
  import('./views/UsersView').then((module) => ({ default: module.UsersView }))
);
