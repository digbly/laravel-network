import { useTranslation } from 'react-i18next';
import { NetworkUsersPanel } from './NetworkUsersPanel';

export const NetworkUsersView = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('admin.networkAdmin.users.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('admin.networkAdmin.users.subtitle')}
        </p>
      </div>

      <NetworkUsersPanel />
    </div>
  );
};
