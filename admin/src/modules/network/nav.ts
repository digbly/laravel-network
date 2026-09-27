import { Globe, LayoutDashboard, Users } from 'lucide-react';
import type { NavItem } from '../../app/types';

/**
 * Canonical network-admin navigation. Consumed by both the sidebar and the
 * topbar so route, label and icon stay in sync.
 */
export const NETWORK_NAV_ITEMS: NavItem[] = [
  { to: '/network', labelKey: 'network:networkAdmin.nav.dashboard', Icon: LayoutDashboard, end: true },
  { to: '/network/websites', labelKey: 'network:networkAdmin.nav.websites', Icon: Globe },
  { to: '/network/users', labelKey: 'network:networkAdmin.nav.users', Icon: Users },
];

export const getNetworkTitleKey = (pathname: string): string =>
  NETWORK_NAV_ITEMS.find((item) => item.to === pathname)?.labelKey ??
  NETWORK_NAV_ITEMS[0].labelKey;
