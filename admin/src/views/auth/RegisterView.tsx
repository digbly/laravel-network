import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useRegisterMutation } from '../../store/services/authApi';
import { getErrorMessage } from '../../utils/apiError';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { SocialLoginButtons } from '../../components/ui/SocialLoginButtons';
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '../../utils/constants';

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  agreeTerms: boolean;
}

export const RegisterView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      agreeTerms: false,
    },
  });

  const passwordValue = watch('password');

  const [registerUser, { isLoading, error: apiError }] = useRegisterMutation();

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= MIN_PASSWORD_LENGTH) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(passwordValue);
  const strengthLabels = [
    t('auth.register.strength.weak'),
    t('auth.register.strength.fair'),
    t('auth.register.strength.good'),
    t('auth.register.strength.strong'),
  ];
  const strengthColors = [
    'bg-rose-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-emerald-500',
  ];

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
      }).unwrap();

      navigate(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch {
      // Backend error is captured in apiError
    }
  };

  const serverErrorMessage = apiError ? getErrorMessage(apiError) : null;
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('auth.register.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('auth.register.subtitle')}
        </p>
      </div>

      <SocialLoginButtons dividerLabel={t('social.orRegisterWith')} />

      {/* Backend Error Alert */}
      {serverErrorMessage && <ErrorAlert message={serverErrorMessage} />}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Input
          label={t('auth.register.nameLabel')}
          type="text"
          placeholder={t('auth.register.namePlaceholder')}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', {
            required: t('auth.register.errors.nameRequired'),
            minLength: {
              value: 2,
              message: t('auth.register.errors.nameMinLength'),
            },
          })}
        />

        <Input
          label={t('auth.register.emailLabel')}
          type="email"
          placeholder={t('auth.register.emailPlaceholder')}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: t('auth.register.errors.emailRequired'),
            pattern: {
              value: EMAIL_REGEX,
              message: t('auth.register.errors.emailInvalid'),
            },
          })}
        />

        <div className="space-y-1.5">
          <Input
            label={t('auth.register.passwordLabel')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.register.passwordPlaceholder')}
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
              required: t('auth.register.errors.passwordRequired'),
              minLength: {
                value: MIN_PASSWORD_LENGTH,
                message: t('auth.register.errors.passwordMinLength', { min: MIN_PASSWORD_LENGTH }),
              },
            })}
          />

          {/* Password Strength Bars */}
          {passwordValue.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex gap-1 h-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      i < strength
                        ? strengthColors[strength - 1]
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>
                  {t('auth.register.strength.tooWeak')}
                  {strength > 0 ? `: ${strengthLabels[strength - 1]}` : ''}
                </span>
                <span>{t('auth.register.strength.hint')}</span>
              </div>
            </div>
          )}
        </div>

        <Input
          label={t('auth.register.confirmPasswordLabel')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          error={errors.passwordConfirmation?.message}
          {...register('passwordConfirmation', {
            required: t('auth.register.errors.confirmRequired'),
            validate: (value, formValues) =>
              value === formValues.password || t('auth.register.errors.passwordMismatch'),
          })}
        />

        {/* Terms agreement checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500/20 dark:bg-slate-800 mt-0.5 shrink-0"
              {...register('agreeTerms', {
                required: t('auth.register.errors.termsRequired'),
              })}
            />
            <span className="leading-snug">
              {t('auth.register.agreeTerms', {
                terms: t('auth.register.terms'),
                privacy: t('auth.register.privacy'),
              })}
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-xs text-rose-500 mt-1">{errors.agreeTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          {t('auth.register.submit')}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
        {t('auth.register.hasAccount')}{' '}
        <Link
          to="/auth/login"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {t('auth.register.signIn')}
        </Link>
      </div>
    </div>
  );
};
