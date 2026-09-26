import { type FC, type FormEvent, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useGetNetworkRolesQuery } from '../../../store/services/networkAdminApi';
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '../../../utils/constants';
import type { AdminUser } from '../../../types/user';

export interface NetworkUserFormValues {
  name: string;
  email: string;
  roles: string[];
  is_super_admin: boolean;
  password: string;
  password_confirmation: string;
}

interface NetworkUserFormModalProps {
  user?: AdminUser | null;
  selfId?: string | number;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (values: NetworkUserFormValues) => void;
  onClose: () => void;
}

export const NetworkUserFormModal: FC<NetworkUserFormModalProps> = ({
  user = null,
  selfId,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const isEdit = Boolean(user);
  const isSelf = Boolean(user) && String(user?.id) === String(selfId);

  const { data: rolesData, isLoading: isLoadingRoles } = useGetNetworkRolesQuery();
  const roleOptions = rolesData?.data ?? [];

  const [values, setValues] = useState<NetworkUserFormValues>(() => ({
    name: user?.name ?? '',
    email: user?.email ?? '',
    roles: user?.roles ?? [],
    is_super_admin: user?.is_super_admin ?? false,
    password: '',
    password_confirmation: '',
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setField = <K extends keyof NetworkUserFormValues>(
    field: K,
    value: NetworkUserFormValues[K],
  ) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const toggleRole = (role: string) => {
    setValues((previous) => ({
      ...previous,
      roles: previous.roles.includes(role)
        ? previous.roles.filter((item) => item !== role)
        : [...previous.roles, role],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};

    if (!values.name.trim()) {
      errors.name = t('admin.networkAdmin.userForm.errors.nameRequired');
    }

    if (!values.email.trim()) {
      errors.email = t('admin.networkAdmin.userForm.errors.emailRequired');
    } else if (!EMAIL_REGEX.test(values.email.trim())) {
      errors.email = t('admin.networkAdmin.userForm.errors.emailInvalid');
    }

    if (!isEdit) {
      if (!values.password) {
        errors.password = t('admin.networkAdmin.userForm.errors.passwordRequired');
      } else if (values.password.length < MIN_PASSWORD_LENGTH) {
        errors.password = t('admin.networkAdmin.userForm.errors.passwordMin', {
          min: MIN_PASSWORD_LENGTH,
        });
      }

      if (!values.password_confirmation) {
        errors.password_confirmation = t('admin.networkAdmin.userForm.errors.confirmRequired');
      } else if (values.password !== values.password_confirmation) {
        errors.password_confirmation = t('admin.networkAdmin.userForm.errors.passwordMismatch');
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    onSubmit({
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={
        isEdit
          ? t('admin.networkAdmin.userForm.editTitle')
          : t('admin.networkAdmin.userForm.createTitle')
      }
      description={
        isEdit
          ? t('admin.networkAdmin.userForm.editSubtitle')
          : t('admin.networkAdmin.userForm.createSubtitle')
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorAlert message={error} />}

        <Input
          label={t('admin.networkAdmin.userForm.name')}
          placeholder={t('admin.networkAdmin.userForm.namePlaceholder')}
          value={values.name}
          onChange={(event) => setField('name', event.target.value)}
          error={fieldErrors.name}
          autoFocus
        />

        <Input
          label={t('admin.networkAdmin.userForm.email')}
          type="email"
          placeholder={t('admin.networkAdmin.userForm.emailPlaceholder')}
          value={values.email}
          onChange={(event) => setField('email', event.target.value)}
          error={fieldErrors.email}
        />

        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            {t('admin.networkAdmin.userForm.roles')}
          </span>

          {isLoadingRoles ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t('admin.networkAdmin.userForm.loadingRoles')}</span>
            </div>
          ) : roleOptions.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-1">
              {t('admin.networkAdmin.userForm.noRoles')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roleOptions.map((role) => (
                <label
                  key={role.id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    values.roles.includes(role.name)
                      ? 'border-indigo-500/40 bg-indigo-500/5 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300'
                  } ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    className="accent-indigo-600 w-4 h-4"
                    checked={values.roles.includes(role.name)}
                    disabled={isSelf}
                    onChange={() => toggleRole(role.name)}
                  />
                  <span className="truncate">{role.name}</span>
                </label>
              ))}
            </div>
          )}
          {isSelf && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('admin.networkAdmin.userForm.selfRolesHint')}
            </p>
          )}
        </div>

        <label
          className={`flex items-start gap-3 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] ${
            isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            className="accent-indigo-600 w-4 h-4 mt-0.5"
            checked={values.is_super_admin}
            disabled={isSelf}
            onChange={(event) => setField('is_super_admin', event.target.checked)}
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              {t('admin.networkAdmin.userForm.superAdmin')}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('admin.networkAdmin.userForm.superAdminHint')}
            </span>
          </span>
        </label>

        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin.networkAdmin.userForm.password')}
              type="password"
              placeholder={t('admin.networkAdmin.userForm.passwordPlaceholder')}
              value={values.password}
              onChange={(event) => setField('password', event.target.value)}
              error={fieldErrors.password}
            />
            <Input
              label={t('admin.networkAdmin.userForm.confirmPassword')}
              type="password"
              placeholder={t('admin.networkAdmin.userForm.confirmPasswordPlaceholder')}
              value={values.password_confirmation}
              onChange={(event) => setField('password_confirmation', event.target.value)}
              error={fieldErrors.password_confirmation}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('admin.networkAdmin.userForm.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit
              ? t('admin.networkAdmin.userForm.save')
              : t('admin.networkAdmin.userForm.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
