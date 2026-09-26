import { LayoutDashboard } from 'lucide-react';
import type { AdminModule } from '../../app/types';
import { DashboardView } from './lazy';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

export const dashboardModule: AdminModule = {
  nav: [
    {
      to: '/dashboard',
      labelKey: 'admin.nav.dashboard',
      Icon: LayoutDashboard,
      permission: 'dashboard.view',
    },
  ],
  routes: [
    {
      path: '/dashboard',
      element: <DashboardView />,
      handle: { permission: 'dashboard.view' },
    },
  ],
  i18n: { en: i18nEn, vi: i18nVi },
};
