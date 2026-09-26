import { lazy } from 'react';

export const WebsitePickerView = lazy(() =>
  import('./views/WebsitePickerView').then((module) => ({
    default: module.WebsitePickerView,
  }))
);

export const NetworkView = lazy(() =>
  import('./views/NetworkView').then((module) => ({
    default: module.NetworkView,
  }))
);
