import { type FC, type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useGetNetworkConfigQuery } from '../../../store/services/networkApi';
import type { AdminUser } from '../../../types/user';
import type { Website, WebsiteStatus } from '../../../types/website';

export interface NetworkWebsiteFormValues {
  title: string;
  subdomain: string;
  domain: string;
  status: WebsiteStatus;
  user_id: string;
  description: string;
}

interface NetworkWebsiteFormModalProps {
  website?: Website | null;
  ownerOptions: AdminUser[];
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (values: NetworkWebsiteFormValues) => void;
  onClose: () => void;
}

const SUBDOMAIN_REGEX = /^[a-zA-Z0-9_-]+$/;
const STATUSES: WebsiteStatus[] = ['active', 'inactive', 'suspended'];

export const NetworkWebsiteFormModal: FC<NetworkWebsiteFormModalProps> = ({
  website = null,
  ownerOptions,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const { data: networkConfig } = useGetNetworkConfigQuery();
  const networkDomain = networkConfig?.data?.domain ?? '';
  const isEdit = Boolean(website);

  const [values, setValues] = useState<NetworkWebsiteFormValues>(() => ({
    title: website?.title ?? '',
    subdomain: website?.subdomain ?? '',
    domain: website?.domain ?? '',
    status: website?.status ?? 'active',
    user_id: String(website?.user_id ?? ownerOptions[0]?.id ?? ''),
    description: website?.description ?? '',
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setField = <K extends keyof NetworkWebsiteFormValues>(
    field: K,
    value: NetworkWebsiteFormValues[K],
  ) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};
    const title = values.title.trim();
    const subdomain = values.subdomain.trim();
    const domain = values.domain.trim();

    if (!title) {
      errors.title = t('admin.networkAdmin.websiteForm.errors.titleRequired');
    }

    if (!subdomain) {
      errors.subdomain = t('admin.networkAdmin.websiteForm.errors.subdomainRequired');
    } else if (subdomain.length > 32) {
      errors.subdomain = t('admin.networkAdmin.websiteForm.errors.subdomainMax', { max: 32 });
    } else if (!SUBDOMAIN_REGEX.test(subdomain)) {
      errors.subdomain = t('admin.networkAdmin.websiteForm.errors.subdomainInvalid');
    }

    if (domain.length > 64) {
      errors.domain = t('admin.networkAdmin.websiteForm.errors.domainMax', { max: 64 });
    }

    if (!values.user_id) {
      errors.user_id = t('admin.networkAdmin.websiteForm.errors.ownerRequired');
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    onSubmit({
      title,
      subdomain,
      domain,
      status: values.status,
      user_id: values.user_id,
      description: values.description.trim(),
    });
  };

  const selectClassName =
    'w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500';

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={
        isEdit
          ? t('admin.networkAdmin.websiteForm.editTitle')
          : t('admin.networkAdmin.websiteForm.createTitle')
      }
      description={
        isEdit
          ? t('admin.networkAdmin.websiteForm.editSubtitle')
          : t('admin.networkAdmin.websiteForm.createSubtitle')
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorAlert message={error} />}

        <Input
          label={t('admin.networkAdmin.websiteForm.title')}
          placeholder={t('admin.networkAdmin.websiteForm.titlePlaceholder')}
          value={values.title}
          onChange={(event) => setField('title', event.target.value)}
          error={fieldErrors.title}
          autoFocus
        />

        <div>
          <label
            htmlFor="network-website-subdomain"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {t('admin.networkAdmin.websiteForm.subdomain')}
          </label>
          <div
            className={`flex items-stretch overflow-hidden rounded-xl border bg-slate-50/80 dark:bg-slate-900/60 transition-all duration-150 focus-within:ring-2 ${
              fieldErrors.subdomain
                ? 'border-rose-500 focus-within:ring-rose-500'
                : 'border-slate-200 dark:border-white/[0.08] focus-within:border-indigo-500 focus-within:ring-indigo-500/20'
            }`}
          >
            <input
              id="network-website-subdomain"
              value={values.subdomain}
              onChange={(event) => setField('subdomain', event.target.value)}
              placeholder={t('admin.networkAdmin.websiteForm.subdomainPlaceholder')}
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm px-3.5 py-2.5 focus:outline-none"
            />
            {networkDomain && (
              <span className="flex items-center px-3 text-sm text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-white/[0.08] whitespace-nowrap select-none">
                .{networkDomain}
              </span>
            )}
          </div>
          {fieldErrors.subdomain ? (
            <p className="text-xs text-rose-500 mt-1">{fieldErrors.subdomain}</p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('admin.networkAdmin.websiteForm.subdomainHint')}
            </p>
          )}
        </div>

        <Input
          label={t('admin.networkAdmin.websiteForm.domain')}
          placeholder={t('admin.networkAdmin.websiteForm.domainPlaceholder')}
          value={values.domain}
          onChange={(event) => setField('domain', event.target.value)}
          error={fieldErrors.domain}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="network-website-status"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
            >
              {t('admin.networkAdmin.websiteForm.status')}
            </label>
            <select
              id="network-website-status"
              value={values.status}
              onChange={(event) => setField('status', event.target.value as WebsiteStatus)}
              className={selectClassName}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`admin.network.status.${status}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="network-website-owner"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
            >
              {t('admin.networkAdmin.websiteForm.owner')}
            </label>
            <select
              id="network-website-owner"
              value={values.user_id}
              onChange={(event) => setField('user_id', event.target.value)}
              className={selectClassName}
            >
              <option value="">{t('admin.networkAdmin.websiteForm.ownerPlaceholder')}</option>
              {ownerOptions.map((owner) => (
                <option key={owner.id} value={String(owner.id)}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            {fieldErrors.user_id && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.user_id}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="network-website-description"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {t('admin.networkAdmin.websiteForm.description')}
          </label>
          <textarea
            id="network-website-description"
            rows={3}
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
            placeholder={t('admin.networkAdmin.websiteForm.descriptionPlaceholder')}
            className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('admin.networkAdmin.websiteForm.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit
              ? t('admin.networkAdmin.websiteForm.save')
              : t('admin.networkAdmin.websiteForm.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
