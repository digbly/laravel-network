import { useEffect, useRef, useState } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { beginOAuthLogin, isOAuthConfigured } from '../../../utils/oauth';
import { getErrorMessage } from '../../../utils/apiError';

export const LoginView = () => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(() =>
    isOAuthConfigured() ? null : t('auth.oauth.notConfigured')
  );
  const started = useRef(false);

  const startSignIn = () => {
    setError(null);
    void beginOAuthLogin().catch((e) => {
      setError(getErrorMessage(e, t('auth.oauth.failed')));
    });
  };

  useEffect(() => {
    if (started.current || !isOAuthConfigured()) return;
    started.current = true;

    void beginOAuthLogin().catch((e) => {
      setError(getErrorMessage(e, t('auth.oauth.failed')));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('auth.login.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('auth.login.subtitle')}
        </p>
      </div>

      {error ? (
        <>
          <ErrorAlert message={error} />
          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full"
            onClick={startSignIn}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            {t('auth.login.submit')}
          </Button>
        </>
      ) : (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('auth.oauth.redirecting')}</span>
        </div>
      )}
    </div>
  );
};
