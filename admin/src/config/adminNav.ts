import type { ComponentType } from 'react';
import { LayoutDashboard, Settings, Users } from 'lucide-react';

export interface AdminNavItem {
  to: string;
  labelKey: string;
  Icon: ComponentType<{ className?: string }>;
}

export const adminNavItems: AdminNavItem[] = [
  { to: '/dashboard', labelKey: 'admin.nav.dashboard', Icon: LayoutDashboard },
  { to: '/users', labelKey: 'admin.nav.users', Icon: Users },
  { to: '/settings', labelKey: 'admin.nav.settings', Icon: Settings },
];

export const adminRouteTitles: Record<string, string> = Object.fromEntries(
  adminNavItems.map((item) => [item.to, item.labelKey])
);
