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
  useCreateNetworkUserMutation,
  useGetNetworkUserQuery,
  useUpdateNetworkUserMutation,
} from '../../../store/services/networkAdminApi';
import { getErrorMessage } from '../../../utils/apiError';
import type { CreateUserPayload, UpdateUserPayload } from '../../../types/user';
import { NetworkUserForm, type NetworkUserFormValues } from '../components/NetworkUserForm';

export const NetworkUserFormView = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const selfId = useAppSelector((state) => state.auth.user?.id);

  const isEditing = Boolean(userId);
  const [error, setError] = useState<string | null>(null);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
  } = useGetNetworkUserQuery(userId ?? '', { skip: !userId });
  const [createUser, createState] = useCreateNetworkUserMutation();
  const [updateUser, updateState] = useUpdateNetworkUserMutation();

  const user = userData?.data ?? null;

  const goBack = () => navigate('/network/users');

  const handleSubmit = async (values: NetworkUserFormValues) => {
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
      setError(getErrorMessage(submitError, t('admin.networkAdmin.errors.saveFailed')));
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
          {t('admin.networkAdmin.userForm.back')}
        </Button>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditing
              ? t('admin.networkAdmin.userForm.editTitle')
              : t('admin.networkAdmin.userForm.createTitle')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isEditing
              ? t('admin.networkAdmin.userForm.editSubtitle')
              : t('admin.networkAdmin.userForm.createSubtitle')}
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
            <ErrorAlert message={t('admin.networkAdmin.userForm.loadFailed')} />
            <Button variant="secondary" size="sm" onClick={() => void refetchUser()}>
              {t('admin.networkAdmin.errors.retry')}
            </Button>
          </CardBody>
        </Card>
      )}

      {(!isEditing || (!isUserLoading && !isUserError)) && (
        <Card>
          <CardBody>
            <NetworkUserForm
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
