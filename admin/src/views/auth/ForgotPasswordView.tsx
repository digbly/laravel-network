import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useForgotPasswordMutation } from '../../store/services/authApi';
import { getErrorMessage } from '../../utils/apiError';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { EMAIL_REGEX } from '../../utils/constants';

interface ForgotPasswordFormInputs {
  email: string;
}

export const ForgotPasswordView = () => {
  const { t } = useTranslation();
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  });

  const [forgotPassword, { isLoading, error: apiError }] = useForgotPasswordMutation();

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch {
      // Server error is handled via apiError state
    }
  };

  const serverErrorMessage = apiError ? getErrorMessage(apiError) : null;

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('auth.forgotPassword.success.title')}
          </h2>
          <p
            className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto"
            dangerouslySetInnerHTML={{
              __html: t('auth.forgotPassword.success.message', { email: submittedEmail }),
            }}
          />
        </div>

        <div className="pt-2 space-y-3">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => setIsSubmitted(false)}
          >
            {t('auth.forgotPassword.success.sendAnother')}
          </Button>

          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('auth.forgotPassword.backToLogin')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('auth.forgotPassword.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('auth.forgotPassword.subtitle')}
        </p>
      </div>

      {/* Backend Error Alert */}
      {serverErrorMessage && <ErrorAlert message={serverErrorMessage} />}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label={t('auth.forgotPassword.emailLabel')}
          type="email"
          placeholder={t('auth.forgotPassword.emailPlaceholder')}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: t('auth.forgotPassword.errors.emailRequired'),
            pattern: {
              value: EMAIL_REGEX,
              message: t('auth.forgotPassword.errors.emailInvalid'),
            },
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<Send className="w-4 h-4" />}
        >
          {t('auth.forgotPassword.submit')}
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center pt-2">
        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('auth.forgotPassword.backToLogin')}</span>
        </Link>
      </div>
    </div>
  );
};
