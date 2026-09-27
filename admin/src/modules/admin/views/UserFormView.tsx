import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { PageLoader } from '../../../components/ui/PageLoader';
import { useAppSelector } from '../../../store/hooks';
import {
  useCreateUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} from '../../../store/services/adminUserApi';
import { getErrorMessage } from '../../../utils/apiError';
import { websitePath } from '../../../utils/website';
import type { CreateUserPayload, UpdateUserPayload } from '../../../types/user';
import { UserForm, type UserFormValues } from '../components/UserForm';

export const UserFormView = () => {
  const { t } = useTranslation();
  const { websiteId, userId } = useParams<{ websiteId: string; userId: string }>();
  const navigate = useNavigate();
  const selfId = useAppSelector((state) => state.auth.user?.id);

  const isEditing = Boolean(userId);
  const [error, setError] = useState<string | null>(null);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
  } = useGetUserQuery(userId ?? '', { skip: !userId });
  const [createUser, createState] = useCreateUserMutation();
  const [updateUser, updateState] = useUpdateUserMutation();

  const user = userData?.data ?? null;

  const goBack = () => navigate(websitePath('/users', websiteId));

  const handleSubmit = async (values: UserFormValues) => {
    setError(null);

    try {
      if (user) {
        const body: UpdateUserPayload = {
          name: values.name,
          email: values.email,
          roles: values.roles,
          is_super_admin: values.is_super_admin,
        };

        await updateUser({ id: String(user.id), body }).unwrap();
      } else {
        const body: CreateUserPayload = {
          name: values.name,
          email: values.email,
          roles: values.roles,
          is_super_admin: values.is_super_admin,
          password: values.password,
          password_confirmation: values.password_confirmation,
        };

        await createUser(body).unwrap();
      }

      goBack();
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('admin:users.errors.saveFailed')));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit -ml-2"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={goBack}
        >
          {t('admin:users.form.back')}
        </Button>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditing ? t('admin:users.form.editTitle') : t('admin:users.form.createTitle')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isEditing ? t('admin:users.form.editSubtitle') : t('admin:users.form.createSubtitle')}
          </p>
        </div>
      </div>

      {isEditing && isUserLoading && (
        <Card>
          <CardBody>
            <PageLoader />
          </CardBody>
        </Card>
      )}

      {isEditing && isUserError && (
        <Card>
          <CardBody className="space-y-4">
            <ErrorAlert message={t('admin:users.form.loadFailed')} />
            <Button variant="secondary" size="sm" onClick={() => void refetchUser()}>
              {t('admin:users.errors.retry')}
            </Button>
          </CardBody>
        </Card>
      )}

      {(!isEditing || (!isUserLoading && !isUserError)) && (
        <Card>
          <CardBody>
            <UserForm
              key={user?.id ?? 'new'}
              user={user}
              selfId={selfId}
              isSubmitting={createState.isLoading || updateState.isLoading}
              error={error}
              onSubmit={(values) => void handleSubmit(values)}
              onCancel={goBack}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
};
