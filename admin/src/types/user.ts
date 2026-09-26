import type { AuthUser } from './auth';

export interface Role {
  id: number;
  name: string;
}

export interface AdminUser extends AuthUser {
  deleted_at?: string | null;
}

export type TrashedFilter = 'only' | 'with';

export interface UserListParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  trashed?: TrashedFilter;
  sort?: 'name' | 'email' | 'created_at';
  direction?: 'asc' | 'desc';
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  links: PaginationLink[];
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  roles: string[];
  is_super_admin: boolean;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  roles: string[];
  is_super_admin: boolean;
}

export interface ResetUserPasswordPayload {
  password: string;
  password_confirmation: string;
}

export interface MessageResponse {
  message: string;
}
