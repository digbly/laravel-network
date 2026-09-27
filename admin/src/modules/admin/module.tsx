import type { AdminModule } from '../../app/types';
import { DashboardView, SettingsView, UserFormView, UsersView } from './lazy';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

export const adminModule: AdminModule = {
  routes: [
    {
      path: '/dashboard',
      element: <DashboardView />,
      handle: { permission: 'dashboard.view' },
    },
    {
      path: '/settings',
      element: <SettingsView />,
      handle: { permission: 'settings.manage' },
    },
    {
      path: '/users',
      element: <UsersView />,
      handle: { permission: 'users.manage' },
    },
    {
      path: '/users/new',
      element: <UserFormView />,
      handle: { permission: 'users.manage' },
    },
    {
      path: '/users/:userId/edit',
      element: <UserFormView />,
      handle: { permission: 'users.manage' },
    },
  ],
  i18n: { en: i18nEn, vi: i18nVi },
};
