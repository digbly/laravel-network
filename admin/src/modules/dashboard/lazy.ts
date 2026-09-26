import { lazy } from 'react';

export const DashboardView = lazy(() =>
  import('./views/DashboardView').then((module) => ({ default: module.DashboardView }))
);
