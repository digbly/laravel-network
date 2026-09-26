import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import { exchangeAuthorizationCode, fetchProfile } from '../../../utils/oauth';
import { getErrorMessage } from '../../../utils/apiError';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';

const readInitialError = (missingCodeMessage: string): string | null => {
  const params = new URLSearchParams(window.location.search);
  const errorParam = params.get('error');

  if (errorParam) {
    return params.get('error_description') || errorParam;
  }

  if (!params.get('code') || !params.get('state')) {
    return missingCodeMessage;
  }

  return null;
};

export const OAuthCallbackView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(() =>
    readInitialError(t('auth.oauth.missingCode'))
  );
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current || error) return;
    processed.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    void (async () => {
      try {
        const token = await exchangeAuthorizationCode(code as string, state as string);
        const user = await fetchProfile(token.access_token);

        dispatch(setCredentials({ user, token }));
        navigate('/dashboard', { replace: true });
      } catch (e) {
        setError(getErrorMessage(e, t('auth.oauth.failed')));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, navigate, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D16] px-4">
      <div className="w-full max-w-sm space-y-5 text-center">
        {error ? (
          <>
            <ErrorAlert message={error} />
            <Link
              to="/auth/login"
              className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('auth.oauth.backToLogin')}
            </Link>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('auth.oauth.processing')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
