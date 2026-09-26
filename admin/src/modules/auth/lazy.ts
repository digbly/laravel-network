import { lazy } from 'react';

export const LoginView = lazy(() =>
  import('./views/LoginView').then((module) => ({ default: module.LoginView }))
);
export const RegisterView = lazy(() =>
  import('./views/RegisterView').then((module) => ({ default: module.RegisterView }))
);
export const ForgotPasswordView = lazy(() =>
  import('./views/ForgotPasswordView').then((module) => ({
    default: module.ForgotPasswordView,
  }))
);
export const ResetPasswordView = lazy(() =>
  import('./views/ResetPasswordView').then((module) => ({
    default: module.ResetPasswordView,
  }))
);
export const VerifyEmailView = lazy(() =>
  import('./views/VerifyEmailView').then((module) => ({ default: module.VerifyEmailView }))
);
export const OAuthCallbackView = lazy(() =>
  import('./views/OAuthCallbackView').then((module) => ({
    default: module.OAuthCallbackView,
  }))
);
