import type { AdminModule } from '../../app/types';
import { CustomizeView, DashboardView, MenusView, PagesView, SettingsView, UserFormView, UsersView, WidgetsView } from './lazy';

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
    {
      path: '/menus',
      element: <MenusView />,
      handle: { permission: 'menus.view' },
    },
    {
      path: '/widgets',
      element: <WidgetsView />,
      handle: { permission: 'widgets.view' },
    },
    {
      path: '/pages',
      element: <PagesView />,
      handle: { permission: 'pages.view' },
    },
  ],
  standaloneRoutes: [
    {
      path: '/customize',
      element: <CustomizeView />,
      handle: { permission: 'themes.view' },
    },
  ],
};
