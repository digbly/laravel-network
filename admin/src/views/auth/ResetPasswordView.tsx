import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useResetPasswordMutation } from '../../store/services/authApi';
import { getErrorMessage } from '../../utils/apiError';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '../../utils/constants';

interface ResetPasswordFormInputs {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export const ResetPasswordView = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    mode: 'onTouched',
    defaultValues: {
      email: emailParam,
      password: '',
      passwordConfirmation: '',
    },
  });

  const [resetPassword, { isLoading, error: apiError }] = useResetPasswordMutation();

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    try {
      await resetPassword({
        email: data.email,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
        token: tokenParam,
      }).unwrap();

      setIsSuccess(true);
    } catch {
      // Handled via apiError
    }
  };

  const serverErrorMessage = apiError ? getErrorMessage(apiError) : null;

  if (!tokenParam) {
    return (
      <div className="space-y-6 text-center animate-in fade-in duration-200">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('auth.resetPassword.invalidLink')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {t('auth.resetPassword.invalidLinkDesc')}
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/auth/forgot-password"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t('auth.resetPassword.requestNew')}
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('auth.resetPassword.successTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {t('auth.resetPassword.successMessage')}
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => navigate('/auth/login')}
          >
            {t('auth.resetPassword.proceedToSignIn')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('auth.resetPassword.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('auth.resetPassword.subtitle')}
        </p>
      </div>

      {/* Backend Error Alert */}
      {serverErrorMessage && <ErrorAlert message={serverErrorMessage} />}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label={t('auth.resetPassword.emailLabel')}
          type="email"
          placeholder={t('auth.resetPassword.emailPlaceholder')}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: t('auth.resetPassword.errors.emailRequired'),
            pattern: {
              value: EMAIL_REGEX,
              message: t('auth.resetPassword.errors.emailInvalid'),
            },
          })}
        />

        <Input
          label={t('auth.resetPassword.newPasswordLabel')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          error={errors.password?.message}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          {...register('password', {
            required: t('auth.resetPassword.errors.passwordRequired'),
            minLength: {
              value: MIN_PASSWORD_LENGTH,
              message: t('auth.resetPassword.errors.passwordMinLength', { min: MIN_PASSWORD_LENGTH }),
            },
          })}
        />

        <Input
          label={t('auth.resetPassword.confirmPasswordLabel')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          error={errors.passwordConfirmation?.message}
          {...register('passwordConfirmation', {
            required: t('auth.resetPassword.errors.confirmRequired'),
            validate: (value, formValues) =>
              value === formValues.password || t('auth.resetPassword.errors.passwordMismatch'),
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<KeyRound className="w-4 h-4" />}
        >
          {t('auth.resetPassword.submit')}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center pt-2">
        <Link
          to="/auth/login"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
        >
          {t('auth.resetPassword.cancelAndReturn')}
        </Link>
      </div>
    </div>
  );
};
