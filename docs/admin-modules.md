# Admin Modules

The admin SPA lives in `admin/` and is built as a **single app with a module
registry**. Each feature module owns its routes, sidebar entries, and
translations. The shell (`AdminLayout`) and the registry (`src/app`) stay
feature-agnostic.

## Directory layout

```
admin/src/
  app/
    types.ts        # AdminModule, AdminNavItem, ModuleI18nBundle
    registry.ts     # registerModules(), getAdminRoutes(), getPublicRoutes(),
                    # getNavigation(), getRouteTitles()
    routes.tsx      # builds the RouteObject[] via useRoutes()
    modules.ts      # registers every module (imported for side effects)
  modules/
    auth/
      module.tsx    # publicRoutes only (login/register/...)
      lazy.ts       # React.lazy wrappers (kept out of module.tsx)
      layout/AuthLayout.tsx
      views/*.tsx
    dashboard/
      module.tsx    # nav + routes + i18n
      lazy.ts
      views/DashboardView.tsx
      i18n/{en,vi}.json
    users/ settings/ ...
  components/       # shared UI, layout shell, route guards
  store/ utils/     # shared state and helpers
```

## Create a module (example: `reports`)

### 1. Create the view

`admin/src/modules/reports/views/ReportsView.tsx`

```tsx
export const ReportsView = () => {
  return <div>{/* feature UI */}</div>;
};
```

### 2. Add a lazy wrapper

`module.tsx` must not declare components (the `react-refresh` lint rule flags
files that both export config and define components). Put `React.lazy` here:

`admin/src/modules/reports/lazy.ts`

```ts
import { lazy } from 'react';

export const ReportsView = lazy(() =>
  import('./views/ReportsView').then((module) => ({ default: module.ReportsView }))
);
```

### 3. Add translations

`admin/src/modules/reports/i18n/en.json`

```json
{
  "admin": {
    "nav": { "reports": "Reports" },
    "reports": { "title": "Reports" }
  }
}
```

`admin/src/modules/reports/i18n/vi.json`

```json
{
  "admin": {
    "nav": { "reports": "Báo cáo" },
    "reports": { "title": "Báo cáo" }
  }
}
```

Use `vi.json` for the key set. Both files are merged into the `translation`
namespace at runtime.

### 4. Describe the module

`admin/src/modules/reports/module.tsx`

```tsx
import { FileBarChart } from 'lucide-react';
import type { AdminModule } from '../../app/types';
import { ReportsView } from './lazy';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

export const reportsModule: AdminModule = {
  nav: [
    {
      to: '/reports',
      labelKey: 'admin.nav.reports',
      Icon: FileBarChart,
      permission: 'reports.view',
    },
  ],
  routes: [
    {
      path: '/reports',
      element: <ReportsView />,
      handle: { permission: 'reports.view' },
    },
  ],
  i18n: { en: i18nEn, vi: i18nVi },
};
```

### 5. Register the module

`admin/src/app/modules.ts`

```ts
import { reportsModule } from '../modules/reports/module';

registerModules([authModule, dashboardModule, usersModule, settingsModule, reportsModule]);
```

That is all: the route, the sidebar entry, the topbar title, and the
translations are wired automatically.

## Module contract

Defined in `admin/src/app/types.ts`:

```ts
interface AdminNavItem {
  to: string;                                        // route path
  labelKey: string;                                  // i18n key, e.g. admin.nav.reports
  Icon: ComponentType<{ className?: string }>;       // lucide-react icon
  permission?: string;                               // hide entry if missing
}

interface AdminModule {
  nav?: AdminNavItem[];          // sidebar entries
  routes?: RouteObject[];        // inside ProtectedRoute + AdminLayout
  publicRoutes?: RouteObject[];  // outside the admin shell (e.g. auth pages)
  i18n?: { [language: string]: Record<string, unknown> };
}
```

All fields are optional, so `auth` only provides `publicRoutes`, while feature
modules provide `nav` + `routes` + `i18n`.

## Routing and lazy loading

`src/app/routes.tsx` composes the tree. Admin routes are nested under
`ProtectedRoute > AdminLayout`; public routes are top-level:

```tsx
const routes: RouteObject[] = [
  ...getPublicRoutes(),
  {
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: getAdminRoutes(),
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/auth/login" replace /> },
];
return useRoutes(routes);
```

Every view is `React.lazy`, so it ships as its own chunk. Suspense boundaries
are provided by the shell, which keeps the sidebar/topbar visible while a page
loads:

- `AdminLayout` wraps `<Outlet />` in `<Suspense fallback={<PageLoader />}>`.
- `AuthLayout` wraps its `<Outlet />`.
- `/auth/callback` is wrapped in `auth/module.tsx`.

Do not add a top-level Suspense around `AppRoutes`; it would unmount the shell
during navigation.

## Navigation and titles

- `AdminSidebar` renders `getNavigation(permissions)`, filtered by the current
  user's permissions (`state.auth.user.permissions`).
- `AdminTopbar` resolves the title with `getRouteTitles()[pathname]`, which is
  built from every module's `nav` regardless of permissions (so a forbidden
  page still shows its name).

## Permissions

Permission checks are split between the API (the real boundary) and the UI
(usability).

Frontend:

- `AdminNavItem.permission` hides the sidebar entry when the user lacks it.
- `route.handle.permission` is read by `RequirePermission` (via `useMatches`,
  deepest match wins) and renders `ForbiddenView` when access is denied.
- `admin/src/utils/permission.ts` treats **unknown** permissions as allowed so
  a not-yet-loaded profile never blocks the UI. The API remains authoritative.

Backend contract (`modules/auth`):

- `Modules\Auth\Enums\Permission` lists the permission strings.
- `User::permissions()` maps the role to the granted list.
- `UserResource` returns `permissions` in every user payload.

If a module introduces a new permission, add it to `Permission`, include it in
`User::permissions()`, and use the same string on `nav.permission` and
`handle.permission`. When the module adds admin-only API endpoints, enforce the
permission server-side as well — the UI guard is not authorization.

## i18n

Module bundles are merged into the `translation` namespace after the shared file
(`admin/public/locales/<lng>/translation.json`) has loaded, so the HTTP backend
cannot overwrite them. Keys are namespaced under `admin`:

```
admin.nav.<module>       sidebar label (also the topbar title)
admin.<module>.*         module-specific strings
admin.forbidden.*        shared access-denied screen
admin.topbar.* / admin.userMenu.* / admin.role.* / admin.comingSoon   shared shell
```

JSON imports require `resolveJsonModule` in `admin/tsconfig.app.json` (already
enabled).

## Conventions and gotchas

- Keep `module.tsx` free of component definitions; put `React.lazy` in `lazy.ts`.
- Admin route paths are absolute (`/reports`) and rendered inside the shell.
- One route entry per page; group a module's pages under a path prefix when it
  grows (e.g. `/reports`, `/reports/settings`).
- Backend modules should namespace their API routes per module
  (`api/v1/reports/...`) to avoid collisions.
- Do not touch `src/i18n` for module strings — use the module's `i18n/*.json`.

## Verify

```bash
cd admin
npm run lint     # 0 errors
npm run build    # tsc -b + vite build
```

Backend, when permissions/endpoints change:

```bash
php artisan test tests/Unit/Auth tests/Feature/Auth
```

## Checklist

- [ ] `modules/<name>/views/XxxView.tsx` created
- [ ] `modules/<name>/lazy.ts` exports the lazy component
- [ ] `modules/<name>/i18n/{en,vi}.json` hold `admin.nav.<name>` and `admin.<name>.*`
- [ ] `modules/<name>/module.tsx` exports the `AdminModule`
- [ ] `src/app/modules.ts` registers the module
- [ ] New permission (if any) added to backend `Permission` + `User::permissions()`
- [ ] `handle.permission` on the route and `permission` on the nav item match the backend string
- [ ] `npm run lint` and `npm run build` pass
