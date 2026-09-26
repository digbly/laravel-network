import { lazy } from 'react';

export const WebsitePickerView = lazy(() =>
  import('./views/WebsitePickerView').then((module) => ({
    default: module.WebsitePickerView,
  }))
);
