import { type FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Globe, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import { PageLoader } from '../../../components/ui/PageLoader';
import { getErrorMessage } from '../../../utils/apiError';
import { getWebsiteId } from '../../../utils/website';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../../store/services/settingApi';
import type { SettingsData, UpdateSettingsPayload } from '../../../types/setting';
import { MediaField } from '../components/MediaField';

const LOCALES = ['en', 'vi'] as const;

const emptyTranslations = (): Record<string, string> =>
  Object.fromEntries(LOCALES.map((locale) => [locale, '']));

const fromData = (data: SettingsData): UpdateSettingsPayload => ({
  title: { ...emptyTranslations(), ...(data.title ?? {}) },
  description: { ...emptyTranslations(), ...(data.description ?? {}) },
  sitename: data.sitename ?? '',
  logo: data.logo ?? null,
  favicon: data.favicon ?? null,
  banner: data.banner ?? null,
  user_registration: data.user_registration ?? false,
  user_verification: data.user_verification ?? false,
});

const LocaleTabs = ({
  active,
  onChange,
}: {
  active: string;
  onChange: (locale: string) => void;
}) => (
  <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] w-fit">
    {LOCALES.map((locale) => (
      <button
        key={locale}
        type="button"
        onClick={() => onChange(locale)}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors ${
          active === locale
            ? 'bg-white dark:bg-[#0F1626] text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        {locale}
      </button>
    ))}
  </div>
);

const Toggle = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <label className="flex items-start justify-between gap-4 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] cursor-pointer">
    <span>
      <span className="block text-sm font-medium text-slate-900 dark:text-white">{label}</span>
      <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</span>
    </span>
    <input
      type="checkbox"
      className="sr-only"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span
      aria-hidden="true"
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${
        checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </span>
  </label>
);

const SettingsForm = ({ websiteId, initial }: { websiteId: string; initial: SettingsData }) => {
  const { t } = useTranslation();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const [form, setForm] = useState<UpdateSettingsPayload>(() => fromData(initial));
  const [activeLocale, setActiveLocale] = useState<string>(LOCALES[0]);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const setTranslation = (key: 'title' | 'description', locale: string, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: { ...current[key], [locale]: value },
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);

    try {
      await updateSettings({
        websiteId,
        body: {
          ...form,
          sitename: form.sitename?.trim() ? form.sitename.trim() : null,
        },
      }).unwrap();

      setNotice({ type: 'success', message: t('admin.settings.notices.saved') });
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, t('admin.settings.errors.saveFailed')),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {notice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border animate-in fade-in ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      <Card>
        <CardHeader title={t('admin.settings.general.title')} subtitle={t('admin.settings.general.subtitle')} />
        <CardBody className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              {t('admin.settings.general.locale')}
            </span>
            <LocaleTabs active={activeLocale} onChange={setActiveLocale} />
          </div>

          <Input
            label={t('admin.settings.fields.title')}
            value={form.title[activeLocale] ?? ''}
            placeholder={t('admin.settings.fields.titlePlaceholder')}
            onChange={(event) => setTranslation('title', activeLocale, event.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {t('admin.settings.fields.description')}
            </label>
            <textarea
              value={form.description[activeLocale] ?? ''}
              rows={3}
              placeholder={t('admin.settings.fields.descriptionPlaceholder')}
              onChange={(event) => setTranslation('description', activeLocale, event.target.value)}
              className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <Input
            label={t('admin.settings.fields.sitename')}
            value={form.sitename ?? ''}
            placeholder={t('admin.settings.fields.sitenamePlaceholder')}
            onChange={(event) => setForm((current) => ({ ...current, sitename: event.target.value }))}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t('admin.settings.branding.title')}
          subtitle={t('admin.settings.branding.subtitle')}
        />
        <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <MediaField
            label={t('admin.settings.fields.logo')}
            value={form.logo}
            onChange={(id) => setForm((current) => ({ ...current, logo: id }))}
          />
          <MediaField
            label={t('admin.settings.fields.favicon')}
            value={form.favicon}
            onChange={(id) => setForm((current) => ({ ...current, favicon: id }))}
          />
          <MediaField
            label={t('admin.settings.fields.banner')}
            value={form.banner}
            onChange={(id) => setForm((current) => ({ ...current, banner: id }))}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t('admin.settings.users.title')} subtitle={t('admin.settings.users.subtitle')} />
        <CardBody className="space-y-3">
          <Toggle
            label={t('admin.settings.fields.userRegistration')}
            description={t('admin.settings.fields.userRegistrationHint')}
            checked={form.user_registration}
            onChange={(value) => setForm((current) => ({ ...current, user_registration: value }))}
          />
          <Toggle
            label={t('admin.settings.fields.userVerification')}
            description={t('admin.settings.fields.userVerificationHint')}
            checked={form.user_verification}
            onChange={(value) => setForm((current) => ({ ...current, user_verification: value }))}
          />
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
          {t('admin.settings.save')}
        </Button>
      </div>
    </form>
  );
};

export const SettingsView = () => {
  const { t } = useTranslation();
  const websiteId = getWebsiteId();
  const { data, isLoading, isError, refetch } = useGetSettingsQuery(websiteId ?? '', {
    skip: !websiteId,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('admin.settings.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('admin.settings.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <div className="space-y-3">
          <ErrorAlert message={t('admin.settings.errors.loadFailed')} />
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            {t('admin.settings.errors.retry')}
          </Button>
        </div>
      ) : data?.data && websiteId ? (
        <SettingsForm key={websiteId} websiteId={websiteId} initial={data.data} />
      ) : null}
    </div>
  );
};
