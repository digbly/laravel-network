import { Navigate, useRoutes, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';
import { getAdminRoutes, getPublicRoutes } from './registry';

export const AppRoutes = () => {
  const routes: RouteObject[] = [
    ...getPublicRoutes(),
    {
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: getAdminRoutes(),
    },
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '*', element: <Navigate to="/auth/login" replace /> },
  ];

  return useRoutes(routes);
};
