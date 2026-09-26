import { lazy } from 'react';

export const UsersView = lazy(() =>
  import('./views/UsersView').then((module) => ({ default: module.UsersView }))
);
