import type { AdminModule } from '../../app/types';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

/**
 * The website picker lives outside the admin shell (`/websites`), so it
 * contributes translations only. Its route is wired in `app/routes.tsx`.
 */
export const networkModule: AdminModule = {
  i18n: { en: i18nEn, vi: i18nVi },
};
