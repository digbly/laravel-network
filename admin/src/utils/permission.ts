/**
 * UI-level permission check used for the sidebar and route guards.
 * The API remains the real authorization boundary, so unknown permissions
 * (not loaded yet, legacy cache, or a failed profile fetch) do not block.
 */
export const hasPermission = (
  granted: string[] | undefined,
  required?: string
): boolean => {
  if (!required || !granted) return true;

  return granted.includes('*') || granted.includes(required);
};
