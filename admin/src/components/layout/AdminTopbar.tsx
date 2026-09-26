import type { FC } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/useTheme';
import { getRouteTitles } from '../../app/registry';
import { stripWebsitePrefix } from '../../utils/website';
import { UserMenu } from './UserMenu';

interface AdminTopbarProps {
  onOpenSidebar: () => void;
}

export const AdminTopbar: FC<AdminTopbarProps> = ({ onOpenSidebar }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { websiteId } = useParams<{ websiteId: string }>();
  const { pathname } = useLocation();
  const routeTitles = getRouteTitles();

  const routePath = stripWebsitePrefix(pathname, websiteId);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.07]">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
        aria-label={t('admin.topbar.openMenu')}
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
        {t(routeTitles[routePath] ?? 'admin.nav.dashboard')}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] transition-all cursor-pointer"
          title={
            theme === 'dark'
              ? t('layout.themeToggle.switchToLight')
              : t('layout.themeToggle.switchToDark')
          }
          aria-label={
            theme === 'dark'
              ? t('layout.themeToggle.switchToLight')
              : t('layout.themeToggle.switchToDark')
          }
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        <UserMenu />
      </div>
    </header>
  );
};
