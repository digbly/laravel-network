import { useTranslation } from 'react-i18next';
import { NetworkWebsitesPanel } from './NetworkWebsitesPanel';

export const NetworkWebsitesView = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('admin.networkAdmin.websites.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('admin.networkAdmin.websites.subtitle')}
        </p>
      </div>

      <NetworkWebsitesPanel />
    </div>
  );
};
