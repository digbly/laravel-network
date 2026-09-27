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

export const UserFormView = lazy(() =>
  import('./views/UserFormView').then((module) => ({ default: module.UserFormView }))
);

export const MenusView = lazy(() =>
  import('./views/MenusView').then((module) => ({ default: module.MenusView }))
);

export const WidgetsView = lazy(() =>
  import('./views/WidgetsView').then((module) => ({ default: module.WidgetsView }))
);

export const CustomizeView = lazy(() =>
  import('./views/CustomizeView').then((module) => ({ default: module.CustomizeView }))
);

export const PagesView = lazy(() =>
  import('./views/PagesView').then((module) => ({ default: module.PagesView }))
);
