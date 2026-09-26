import { type FC, type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useGetNetworkConfigQuery } from '../../../store/services/networkApi';
import type { WebsiteStatus } from '../../../types/website';

export interface WebsiteFormValues {
  title: string;
  subdomain: string;
  description: string;
  status: WebsiteStatus;
}

interface WebsiteFormModalProps {
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (values: WebsiteFormValues) => void;
  onClose: () => void;
}

const SUBDOMAIN_REGEX = /^[a-zA-Z0-9_-]+$/;
const STATUSES: WebsiteStatus[] = ['active', 'inactive', 'suspended'];

export const WebsiteFormModal: FC<WebsiteFormModalProps> = ({
  isSubmitting,
  error,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const { data: networkConfig } = useGetNetworkConfigQuery();
  const networkDomain = networkConfig?.data?.domain ?? '';

  const [values, setValues] = useState<WebsiteFormValues>({
    title: '',
    subdomain: '',
    description: '',
    status: 'active',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setField = <K extends keyof WebsiteFormValues>(
    field: K,
    value: WebsiteFormValues[K],
  ) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};
    const title = values.title.trim();
    const subdomain = values.subdomain.trim();

    if (!title) {
      errors.title = t('admin.network.form.errors.titleRequired');
    }

    if (!subdomain) {
      errors.subdomain = t('admin.network.form.errors.subdomainRequired');
    } else if (subdomain.length > 32) {
      errors.subdomain = t('admin.network.form.errors.subdomainMax', { max: 32 });
    } else if (!SUBDOMAIN_REGEX.test(subdomain)) {
      errors.subdomain = t('admin.network.form.errors.subdomainInvalid');
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    onSubmit({
      title,
      subdomain,
      description: values.description.trim(),
      status: values.status,
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('admin.network.form.createTitle')}
      description={t('admin.network.form.createSubtitle')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorAlert message={error} />}

        <Input
          label={t('admin.network.form.title')}
          placeholder={t('admin.network.form.titlePlaceholder')}
          value={values.title}
          onChange={(event) => setField('title', event.target.value)}
          error={fieldErrors.title}
          autoFocus
        />

        <div>
          <label
            htmlFor="website-subdomain"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {t('admin.network.form.subdomain')}
          </label>
          <div
            className={`flex items-stretch overflow-hidden rounded-xl border bg-slate-50/80 dark:bg-slate-900/60 transition-all duration-150 focus-within:ring-2 ${
              fieldErrors.subdomain
                ? 'border-rose-500 focus-within:ring-rose-500'
                : 'border-slate-200 dark:border-white/[0.08] focus-within:border-indigo-500 focus-within:ring-indigo-500/20'
            }`}
          >
            <input
              id="website-subdomain"
              value={values.subdomain}
              onChange={(event) => setField('subdomain', event.target.value)}
              placeholder={t('admin.network.form.subdomainPlaceholder')}
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
              {t('admin.network.form.subdomainHint')}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="website-status"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {t('admin.network.form.status')}
          </label>
          <select
            id="website-status"
            value={values.status}
            onChange={(event) => setField('status', event.target.value as WebsiteStatus)}
            className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
            htmlFor="website-description"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {t('admin.network.form.description')}
          </label>
          <textarea
            id="website-description"
            rows={3}
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
            placeholder={t('admin.network.form.descriptionPlaceholder')}
            className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('admin.network.form.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {t('admin.network.form.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
