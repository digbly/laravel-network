import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useLoginMutation } from '../../store/services/authApi';
import { getErrorMessage } from '../../utils/apiError';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { SocialLoginButtons } from '../../components/ui/SocialLoginButtons';
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '../../utils/constants';

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const LoginView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const [login, { isLoading, error: apiError }] = useLoginMutation();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      navigate('/dashboard');
    } catch {
      // Backend error is displayed via apiError state
    }
  };

  const serverErrorMessage = apiError ? getErrorMessage(apiError) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('auth.login.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('auth.login.subtitle')}
        </p>
      </div>

      <SocialLoginButtons />

      {/* Backend / Server Error Alert */}
      {serverErrorMessage && <ErrorAlert message={serverErrorMessage} />}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label={t('auth.login.emailLabel')}
          type="email"
          placeholder={t('auth.login.emailPlaceholder')}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: t('auth.login.errors.emailRequired'),
            pattern: {
              value: EMAIL_REGEX,
              message: t('auth.login.errors.emailInvalid'),
            },
          })}
        />

        <div className="space-y-1">
          <Input
            label={t('auth.login.passwordLabel')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.login.passwordPlaceholder')}
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
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
              required: t('auth.login.errors.passwordRequired'),
              minLength: {
                value: MIN_PASSWORD_LENGTH,
                message: t('auth.login.errors.passwordMinLength', { min: MIN_PASSWORD_LENGTH }),
              },
            })}
          />
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500/20 dark:bg-slate-800"
              {...register('rememberMe')}
            />
            <span>{t('auth.login.rememberMe')}</span>
          </label>

          <Link
            to="/auth/forgot-password"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t('auth.login.forgotPassword')}
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          {t('auth.login.submit')}
        </Button>
      </form>

      {/* Switch to Register link */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
        {t('auth.login.noAccount')}{' '}
        <Link
          to="/auth/register"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {t('auth.login.createAccount')}
        </Link>
      </div>
    </div>
  );
};
