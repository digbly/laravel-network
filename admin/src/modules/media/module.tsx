import type { AdminModule } from '../../app/types';
import { MediaLibraryView } from './lazy';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

export const mediaModule: AdminModule = {
  routes: [
    {
      path: '/media',
      element: <MediaLibraryView />,
      handle: { permission: 'media.view' },
    },
  ],
  i18n: { en: i18nEn, vi: i18nVi },
};
