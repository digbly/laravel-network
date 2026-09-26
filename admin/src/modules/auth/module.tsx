import { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import type { AdminModule } from '../../app/types';
import { PublicRoute } from '../../components/auth/PublicRoute';
import { PageLoader } from '../../components/ui/PageLoader';
import { AuthLayout } from './layout/AuthLayout';
import {
  ForgotPasswordView,
  LoginView,
  OAuthCallbackView,
  RegisterView,
  ResetPasswordView,
  VerifyEmailView,
} from './lazy';

export const authModule: AdminModule = {
  publicRoutes: [
    {
      path: '/auth/callback',
      element: (
        <Suspense fallback={<PageLoader />}>
          <OAuthCallbackView />
        </Suspense>
      ),
    },
    {
      path: '/auth',
      element: (
        <PublicRoute>
          <AuthLayout />
        </PublicRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/auth/login" replace /> },
        { path: 'login', element: <LoginView /> },
        { path: 'register', element: <RegisterView /> },
        { path: 'forgot-password', element: <ForgotPasswordView /> },
        { path: 'reset-password', element: <ResetPasswordView /> },
        { path: 'verify-email', element: <VerifyEmailView /> },
        { path: '*', element: <Navigate to="/auth/login" replace /> },
      ],
    },
  ],
};
