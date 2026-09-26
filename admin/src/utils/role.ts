export type RoleVariant = 'violet' | 'slate' | 'cyan';

/**
 * Roles are dynamic (admin-defined), so we infer a cosmetic badge variant
 * from the role name instead of hardcoding a fixed set of roles.
 */
export const getRoleVariant = (role: string): RoleVariant => {
  const normalized = role.toLowerCase();

  if (normalized.includes('admin')) return 'violet';
  if (normalized.includes('editor') || normalized.includes('manager') || normalized.includes('moderator')) {
    return 'cyan';
  }

  return 'slate';
};
