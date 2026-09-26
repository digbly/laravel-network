import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ComingSoon } from '../../../components/admin/ComingSoon';

export const SettingsView = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon
      Icon={Settings}
      title={t('admin.settings.title')}
      description={t('admin.settings.placeholder')}
    />
  );
};
