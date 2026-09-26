import { useMemo, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { NavigationItem } from '../../types/navigation';
import { filterNavigation } from '../../utils/navigation';
import { resolveNavIcon } from '../../utils/navIcons';
import { useAppSelector } from '../../store/hooks';
import { websitePath } from '../../utils/website';
import { useGetNavigationQuery } from '../../store/services/navigationApi';
import { SidebarShell, type SidebarNavEntry, type SidebarNavItem } from './SidebarShell';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const toItems = (items: NavigationItem[], websiteId?: string): SidebarNavItem[] =>
  items.map((item) => ({
    to: websitePath(item.to ?? '/', websiteId),
    label: item.label,
    Icon: resolveNavIcon(item.icon),
  }));

const toEntries = (items: NavigationItem[], websiteId?: string): SidebarNavEntry[] =>
  items.map((item) =>
    item.children.length > 0
      ? {
          label: item.label,
          Icon: resolveNavIcon(item.icon),
          children: toItems(item.children, websiteId),
        }
      : {
          to: websitePath(item.to ?? '/', websiteId),
          label: item.label,
          Icon: resolveNavIcon(item.icon),
        },
  );

export const AdminSidebar: FC<AdminSidebarProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { websiteId } = useParams<{ websiteId: string }>();
  const permissions = useAppSelector((state) => state.auth.user?.permissions);
  const { data } = useGetNavigationQuery();

  const items = useMemo(
    () => toEntries(filterNavigation(data?.data ?? [], permissions), websiteId),
    [data, permissions, websiteId],
  );

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
