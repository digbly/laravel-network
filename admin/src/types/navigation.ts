/**
 * Admin sidebar navigation returned by
 * `GET /api/v1/admin/websites/{website}/navigation`.
 *
 * Labels are already translated by the API (based on `Accept-Language`) and
 * `children` may be empty for leaf links.
 */
export interface NavigationItem {
  id: string;
  label: string;
  to: string | null;
  icon: string;
  permission: string | null;
  children: NavigationItem[];
}
