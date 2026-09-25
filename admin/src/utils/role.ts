export interface RoleMeta {
  labelKey: string;
  variant: 'violet' | 'slate';
}

export const getRoleMeta = (role?: string): RoleMeta =>
  role === 'admin'
    ? { labelKey: 'admin.role.admin', variant: 'violet' }
    : { labelKey: 'admin.role.user', variant: 'slate' };
