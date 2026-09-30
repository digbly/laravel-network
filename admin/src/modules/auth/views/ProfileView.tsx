import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Save,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useChangePasswordMutation } from '../../../store/services/authApi';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../../store/services/userApi';
import { getErrorMessage } from '../../../utils/apiError';
import { MIN_PASSWORD_LENGTH } from '../../../utils/constants';
import { getLastWebsiteId } from '../../../utils/website';

type Notice = { type: 'success' | 'error'; message: string };

interface ProfileFormInputs {
  name: string;
}

interface PasswordFormInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const getInitials = (value: string): string => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const ProfileView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useGetProfileQuery();
  const profile = data?.data;

  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormInputs>({ mode: 'onTouched' });
  const passwordForm = useForm<PasswordFormInputs>({ mode: 'onTouched' });

  useEffect(() => {
    if (profile) {
      profileForm.reset({ name: profile.name });
    }
  }, [profile, profileForm]);

  useEffect(() => {
    if (notice?.type !== 'success') return;

    const handle = window.setTimeout(() => setNotice(null), 4000);

    return () => window.clearTimeout(handle);
  }, [notice]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const displayName = profile?.name || profile?.email || '';
  const avatarUrl = avatarPreview ?? profile?.avatar ?? null;

  const handleBack = () => {
    const websiteId = getLastWebsiteId();
    navigate(websiteId ? `/websites/${websiteId}/dashboard` : '/websites');
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError(t('auth:profile.errors.avatarInvalid'));
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError(t('auth:profile.errors.avatarTooLarge'));
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmitProfile = async (values: ProfileFormInputs) => {
    try {
      await updateProfile({ name: values.name, avatar: avatarFile }).unwrap();
      setAvatarFile(null);
      setNotice({ type: 'success', message: t('auth:profile.notices.profileUpdated') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const onSubmitPassword = async (values: PasswordFormInputs) => {
    try {
      await changePassword({
        current_password: values.currentPassword,
        password: values.newPassword,
        password_confirmation: values.confirmPassword,
      }).unwrap();

      passwordForm.reset();
      setNotice({ type: 'success', message: t('auth:profile.notices.passwordUpdated') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) });
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-100 text-slate-400 dark:bg-[#090D16] dark:text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{t('auth:profile.loading')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#090D16] dark:text-slate-100">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-white/[0.07] dark:bg-[#090D16]/80">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
          aria-label={t('auth:profile.back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold tracking-tight">
          {t('auth:profile.title')}
        </h1>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {notice && (
          <div
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs ${
              notice.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
            role="status"
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
        )}

        <Card>
          <CardHeader
            title={t('auth:profile.personal.title')}
            subtitle={t('auth:profile.personal.subtitle')}
          />
          <CardBody>
            <form
              onSubmit={profileForm.handleSubmit(onSubmitProfile)}
              className="space-y-5"
              noValidate
            >
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-lg font-bold text-white">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      getInitials(displayName)
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition-colors hover:text-indigo-600 dark:border-white/[0.08] dark:bg-[#0F1626] dark:text-slate-300 dark:hover:text-indigo-400"
                    aria-label={t('auth:profile.personal.changeAvatar')}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('auth:profile.personal.avatarLabel')}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Camera className="h-3.5 w-3.5" />}
                  >
                    {t('auth:profile.personal.changeAvatar')}
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('auth:profile.personal.avatarHint')}
                  </p>
                  {avatarError && <p className="text-xs text-rose-500">{avatarError}</p>}
                </div>
              </div>

              <Input
                label={t('auth:profile.personal.nameLabel')}
                placeholder={t('auth:profile.personal.namePlaceholder')}
                error={profileForm.formState.errors.name?.message}
                {...profileForm.register('name', {
                  required: t('auth:profile.errors.nameRequired'),
                  minLength: {
                    value: 2,
                    message: t('auth:profile.errors.nameMinLength'),
                  },
                })}
              />

              <Input
                label={t('auth:profile.personal.emailLabel')}
                value={profile?.email ?? ''}
                disabled
                readOnly
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingProfile}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  {t('auth:profile.personal.submit')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t('auth:profile.password.title')}
            subtitle={t('auth:profile.password.subtitle')}
          />
          <CardBody>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="space-y-4"
              noValidate
            >
              <Input
                label={t('auth:profile.password.currentLabel')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword', {
                  required: t('auth:profile.errors.currentRequired'),
                })}
              />

              <Input
                label={t('auth:profile.password.newLabel')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={passwordForm.formState.errors.newPassword?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...passwordForm.register('newPassword', {
                  required: t('auth:profile.errors.passwordRequired'),
                  minLength: {
                    value: MIN_PASSWORD_LENGTH,
                    message: t('auth:profile.errors.passwordMinLength', {
                      min: MIN_PASSWORD_LENGTH,
                    }),
                  },
                })}
              />

              <Input
                label={t('auth:profile.password.confirmLabel')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword', {
                  required: t('auth:profile.errors.confirmRequired'),
                  validate: (value, values) =>
                    value === values.newPassword || t('auth:profile.errors.passwordMismatch'),
                })}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isChangingPassword}
                  leftIcon={<KeyRound className="h-4 w-4" />}
                >
                  {t('auth:profile.password.submit')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </main>
    </div>
  );
};

export default ProfileView;
