import type { AdminModule } from '../../app/types';
import { UsersView } from './lazy';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

export const usersModule: AdminModule = {
  routes: [
    {
      path: '/users',
      element: <UsersView />,
      handle: { permission: 'users.manage' },
    },
  ],
  i18n: { en: i18nEn, vi: i18nVi },
};
