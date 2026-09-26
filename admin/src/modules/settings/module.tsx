import type { AdminModule } from '../../app/types';
import { SettingsView } from './lazy';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

export const settingsModule: AdminModule = {
  routes: [
    {
      path: '/settings',
      element: <SettingsView />,
      handle: { permission: 'settings.manage' },
    },
  ],
  i18n: { en: i18nEn, vi: i18nVi },
};
