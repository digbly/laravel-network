import { Settings } from 'lucide-react';
import type { AdminModule } from '../../app/types';
import { SettingsView } from './lazy';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

export const settingsModule: AdminModule = {
  nav: [
    {
      to: '/settings',
      labelKey: 'admin.nav.settings',
      Icon: Settings,
      permission: 'settings.manage',
    },
  ],
  routes: [
    {
      path: '/settings',
      element: <SettingsView />,
      handle: { permission: 'settings.manage' },
    },
  ],
  i18n: { en: i18nEn, vi: i18nVi },
};
