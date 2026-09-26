import { lazy } from 'react';

export const SettingsView = lazy(() =>
  import('./views/SettingsView').then((module) => ({ default: module.SettingsView }))
);
