import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getNavigation } from '../../app/registry';
import { useAppSelector } from '../../store/hooks';
import { websitePath } from '../../utils/website';
import { SidebarShell } from './SidebarShell';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const AdminSidebar: FC<AdminSidebarProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { websiteId } = useParams<{ websiteId: string }>();
  const permissions = useAppSelector((state) => state.auth.user?.permissions);

  const items = getNavigation(permissions).map(({ to, labelKey, Icon }) => ({
    to: websitePath(to, websiteId),
    labelKey,
    Icon,
  }));

  return (
    <SidebarShell
      id="admin-sidebar"
      ariaLabel={t('admin.nav.menuLabel')}
      open={open}
      onClose={onClose}
      brandTo={websitePath('/dashboard', websiteId)}
      brandDescriptionKey="admin.brandDesc"
      items={items}
    />
  );
};
