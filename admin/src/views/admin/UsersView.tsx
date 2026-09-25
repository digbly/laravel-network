import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ComingSoon } from '../../components/admin/ComingSoon';

export const UsersView = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon
      Icon={Users}
      title={t('admin.users.title')}
      description={t('admin.users.placeholder')}
    />
  );
};
