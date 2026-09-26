import type { AuthUser } from './auth';

export type WebsiteStatus = 'active' | 'inactive' | 'suspended';

export interface Website {
  id: string;
  title: string;
  description?: string | null;
  subdomain: string;
  domain?: string | null;
  status: WebsiteStatus;
  status_label?: string;
  setup?: boolean;
  is_demo?: boolean;
  language?: string | null;
  theme?: string | null;
  database?: string | null;
  url?: string | null;
  user_id: string;
  owner?: AuthUser | null;
  users_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}
