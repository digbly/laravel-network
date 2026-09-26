import type { AdminUser } from './user';
import type { Website } from './website';

export interface NetworkWebsiteStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}

export interface NetworkUserStats {
  total: number;
  verified: number;
  unverified: number;
  trashed: number;
}

export interface NetworkDashboardStats {
  websites: NetworkWebsiteStats;
  users: NetworkUserStats;
}

export interface NetworkDashboard {
  stats: NetworkDashboardStats;
  recent_websites: Website[];
  recent_users: AdminUser[];
}
