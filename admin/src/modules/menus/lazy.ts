import { lazy } from 'react';

export const MenusView = lazy(() =>
  import('./views/MenusView').then((module) => ({ default: module.MenusView })),
);
