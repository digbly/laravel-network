import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { LoginView } from './views/auth/LoginView';
import { RegisterView } from './views/auth/RegisterView';
import { ForgotPasswordView } from './views/auth/ForgotPasswordView';
import { ResetPasswordView } from './views/auth/ResetPasswordView';
import { VerifyEmailView } from './views/auth/VerifyEmailView';
import { PublicRoute } from './components/auth/PublicRoute';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthLayout />
              </PublicRoute>
            }
          >
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<LoginView />} />
            <Route path="register" element={<RegisterView />} />
            <Route path="forgot-password" element={<ForgotPasswordView />} />
            <Route path="reset-password" element={<ResetPasswordView />} />
            <Route path="verify-email" element={<VerifyEmailView />} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* Redirect root to dashboard (uses ProtectedRoute — unauthenticated users go to login) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
