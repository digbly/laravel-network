import type { AdminModule } from '../../app/types';
import { MenusView } from './lazy';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

export const menusModule: AdminModule = {
  routes: [
    {
      path: '/menus',
      element: <MenusView />,
      handle: { permission: 'menus.view' },
    },
  ],
  i18n: { en: i18nEn, vi: i18nVi },
};
