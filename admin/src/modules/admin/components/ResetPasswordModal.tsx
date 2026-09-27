import { type FC, type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { MIN_PASSWORD_LENGTH } from '../../../utils/constants';
import type { AdminUser } from '../../../types/user';

interface ResetPasswordModalProps {
  user: AdminUser;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (values: { password: string; password_confirmation: string }) => void;
  onClose: () => void;
}

export const ResetPasswordModal: FC<ResetPasswordModalProps> = ({
  user,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};

    if (!password) {
      errors.password = t('admin.users.form.errors.passwordRequired');
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = t('admin.users.form.errors.passwordMin', { min: MIN_PASSWORD_LENGTH });
    }

    if (!confirmation) {
      errors.password_confirmation = t('admin.users.form.errors.confirmRequired');
    } else if (password !== confirmation) {
      errors.password_confirmation = t('admin.users.form.errors.passwordMismatch');
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    onSubmit({ password, password_confirmation: confirmation });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('admin.users.resetPassword.title')}
      description={t('admin.users.resetPassword.subtitle', { name: user.name })}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorAlert message={error} />}

        <Input
          label={t('admin.users.form.password')}
          type="password"
          placeholder={t('admin.users.form.passwordPlaceholder')}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((previous) => ({ ...previous, password: '' }));
          }}
          error={fieldErrors.password}
          autoFocus
        />

        <Input
          label={t('admin.users.form.confirmPassword')}
          type="password"
          placeholder={t('admin.users.form.confirmPasswordPlaceholder')}
          value={confirmation}
          onChange={(event) => {
            setConfirmation(event.target.value);
            setFieldErrors((previous) => ({ ...previous, password_confirmation: '' }));
          }}
          error={fieldErrors.password_confirmation}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('admin.users.form.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {t('admin.users.resetPassword.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
