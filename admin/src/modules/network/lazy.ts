import { lazy } from 'react';

export const WebsitePickerView = lazy(() =>
  import('./views/WebsitePickerView').then((module) => ({
    default: module.WebsitePickerView,
  }))
);

export const NetworkDashboardView = lazy(() =>
  import('./views/NetworkDashboardView').then((module) => ({
    default: module.NetworkDashboardView,
  }))
);

export const NetworkWebsitesView = lazy(() =>
  import('./views/NetworkWebsitesView').then((module) => ({
    default: module.NetworkWebsitesView,
  }))
);

export const NetworkUsersView = lazy(() =>
  import('./views/NetworkUsersView').then((module) => ({
    default: module.NetworkUsersView,
  }))
);
