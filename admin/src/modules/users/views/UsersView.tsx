import { type ComponentType, type FC, type ReactNode, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import { useAppSelector } from '../../../store/hooks';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetUsersQuery,
  useResendUserVerificationMutation,
  useResetUserPasswordMutation,
  useRestoreUserMutation,
  useUpdateUserMutation,
} from '../../../store/services/adminUserApi';
import { getErrorMessage } from '../../../utils/apiError';
import { getRoleVariant } from '../../../utils/role';
import type {
  AdminUser,
  CreateUserPayload,
  TrashedFilter,
  UpdateUserPayload,
  UserListParams,
} from '../../../types/user';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Pagination } from '../components/Pagination';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { UserFormModal, type UserFormValues } from '../components/UserFormModal';

const PER_PAGE = 10;

interface Notice {
  type: 'success' | 'error';
  message: string;
}

interface RowActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger' | 'accent';
  children: ReactNode;
}

const RowAction: FC<RowActionProps> = ({
  label,
  onClick,
  disabled = false,
  tone = 'default',
  children,
}) => {
  const toneClasses = {
    default:
      'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.08]',
    danger:
      'text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:text-rose-300',
    accent:
      'text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 dark:hover:text-indigo-300',
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
};

const StatCard: FC<{ Icon: ComponentType<{ className?: string }>; label: string; value: ReactNode }> = ({
  Icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{value}</p>
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  </div>
);

export const UsersView = () => {
  const { t, i18n } = useTranslation();
  const selfId = useAppSelector((state) => state.auth.user?.id);
  const currentIsSuperAdmin = useAppSelector((state) => state.auth.user?.is_super_admin ?? false);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [trashed, setTrashed] = useState<TrashedFilter | ''>('');
  const [notice, setNotice] = useState<Notice | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formUser, setFormUser] = useState<AdminUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const [createUser, createState] = useCreateUserMutation();
  const [updateUser, updateState] = useUpdateUserMutation();
  const [deleteUser, deleteState] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const [resetUserPassword, resetState] = useResetUserPasswordMutation();
  const [resendUserVerification] = useResendUserVerificationMutation();

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (notice?.type !== 'success') return;

    const handle = window.setTimeout(() => setNotice(null), 4000);

    return () => window.clearTimeout(handle);
  }, [notice]);

  const params: UserListParams = {
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    role: role || undefined,
    trashed: trashed || undefined,
    sort: 'created_at',
    direction: 'desc',
  };

  const { data, isFetching, isError, refetch } = useGetUsersQuery(params);
  const { data: rolesData } = useGetRolesQuery();

  const users = data?.data ?? [];
  const meta = data?.meta;
  const roleOptions = rolesData?.data ?? [];

  const formatDate = (value?: string | null): string =>
    value
      ? new Date(value).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const openCreate = () => {
    setFormUser(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setFormUser(user);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormUser(null);
    setFormError(null);
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    setFormError(null);

    try {
      if (formUser) {
        const body: UpdateUserPayload = {
          name: values.name,
          email: values.email,
          roles: values.roles,
          is_super_admin: values.is_super_admin,
        };

        await updateUser({ id: String(formUser.id), body }).unwrap();
        setNotice({ type: 'success', message: t('admin.users.notices.updated') });
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
        setNotice({ type: 'success', message: t('admin.users.notices.created') });
      }

      closeForm();
    } catch (error) {
      setFormError(getErrorMessage(error, t('admin.users.errors.saveFailed')));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteUser(String(deleteTarget.id)).unwrap();
      setNotice({ type: 'success', message: t('admin.users.notices.deleted') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, t('admin.users.errors.deleteFailed')) });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRestore = async (user: AdminUser) => {
    try {
      await restoreUser(String(user.id)).unwrap();
      setNotice({ type: 'success', message: t('admin.users.notices.restored') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, t('admin.users.errors.restoreFailed')) });
    }
  };

  const handleResend = async (user: AdminUser) => {
    try {
      await resendUserVerification(String(user.id)).unwrap();
      setNotice({ type: 'success', message: t('admin.users.notices.verificationSent') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, t('admin.users.errors.resendFailed')) });
    }
  };

  const handleResetPassword = async (values: {
    password: string;
    password_confirmation: string;
  }) => {
    if (!resetTarget) return;

    setResetError(null);

    try {
      await resetUserPassword({ id: String(resetTarget.id), body: values }).unwrap();
      setNotice({ type: 'success', message: t('admin.users.notices.passwordReset') });
      setResetTarget(null);
    } catch (error) {
      setResetError(getErrorMessage(error, t('admin.users.errors.resetFailed')));
    }
  };

  const isSaving = createState.isLoading || updateState.isLoading;

  const renderStatus = (user: AdminUser) => {
    if (user.deleted_at) {
      return (
        <Badge variant="rose" size="sm" dot>
          {t('admin.users.status.deleted')}
        </Badge>
      );
    }

    return user.email_verified_at ? (
      <Badge variant="emerald" size="sm" dot>
        {t('admin.users.status.verified')}
      </Badge>
    ) : (
      <Badge variant="amber" size="sm" dot>
        {t('admin.users.status.unverified')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('admin.users.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('admin.users.subtitle')}
          </p>
        </div>

        <Button onClick={openCreate} leftIcon={<UserPlus className="w-4 h-4" />}>
          {t('admin.users.addUser')}
        </Button>
      </div>

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

      {isError && <ErrorAlert message={t('admin.users.errors.loadFailed')} />}

      <Card>
        <CardBody className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('admin.users.searchPlaceholder')}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">{t('admin.users.filters.allRoles')}</option>
              {roleOptions.map((roleOption) => (
                <option key={roleOption.id} value={roleOption.name}>
                  {roleOption.name}
                </option>
              ))}
            </select>

            <select
              value={trashed}
              onChange={(event) => {
                setTrashed(event.target.value as TrashedFilter | '');
                setPage(1);
              }}
              className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">{t('admin.users.filters.active')}</option>
              <option value="only">{t('admin.users.filters.deleted')}</option>
              <option value="with">{t('admin.users.filters.all')}</option>
            </select>
          </div>

          {meta && (
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
              <StatCard Icon={Users} label={t('admin.users.stats.total')} value={meta.total} />
              <StatCard
                Icon={CheckCircle2}
                label={t('admin.users.stats.page')}
                value={t('admin.users.pagination.page', {
                  current: meta.current_page,
                  total: meta.last_page,
                })}
              />
            </div>
          )}
        </CardBody>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-3 font-semibold">{t('admin.users.table.user')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.users.table.role')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.users.table.status')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.users.table.joined')}</th>
                <th className="px-6 py-3 font-semibold text-right">{t('admin.users.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {isFetching && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('admin.users.loading')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isFetching && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Users className="w-6 h-6 text-slate-400" />
                      <span>{t('admin.users.empty')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {users.map((user) => {
                const userRoles = user.roles ?? [];
                const isSelf = String(user.id) === String(selfId);
                const isDeleted = Boolean(user.deleted_at);
                const canManage = currentIsSuperAdmin || !user.is_super_admin;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-500 dark:text-slate-300 font-semibold text-sm shrink-0">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {user.name}
                            {isSelf && (
                              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                                {t('admin.users.you')}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {user.is_super_admin && (
                          <Badge variant="violet" size="sm">
                            <ShieldCheck className="w-3 h-3" />
                            {t('admin.users.status.superAdmin')}
                          </Badge>
                        )}
                        {userRoles.map((roleName) => (
                          <Badge key={roleName} variant={getRoleVariant(roleName)} size="sm">
                            {roleName}
                          </Badge>
                        ))}
                        {!user.is_super_admin && userRoles.length === 0 && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">{renderStatus(user)}</td>

                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {isDeleted ? (
                          <RowAction
                            label={t('admin.users.actions.restore')}
                            onClick={() => void handleRestore(user)}
                            disabled={!canManage}
                            tone="accent"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </RowAction>
                        ) : (
                          <>
                            <RowAction
                              label={t('admin.users.actions.edit')}
                              onClick={() => openEdit(user)}
                              disabled={!canManage}
                              tone="accent"
                            >
                              <Pencil className="w-4 h-4" />
                            </RowAction>

                            <RowAction
                              label={t('admin.users.actions.resetPassword')}
                              onClick={() => {
                                setResetError(null);
                                setResetTarget(user);
                              }}
                              disabled={!canManage}
                            >
                              <KeyRound className="w-4 h-4" />
                            </RowAction>

                            {!user.email_verified_at && (
                              <RowAction
                                label={t('admin.users.actions.resendVerification')}
                                onClick={() => void handleResend(user)}
                              >
                                <Mail className="w-4 h-4" />
                              </RowAction>
                            )}

                            <RowAction
                              label={t('admin.users.actions.delete')}
                              onClick={() => setDeleteTarget(user)}
                              disabled={isSelf || !canManage}
                              tone="danger"
                            >
                              <Trash2 className="w-4 h-4" />
                            </RowAction>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination meta={meta} isFetching={isFetching} onPageChange={setPage} />
      </Card>

      {isFormOpen && (
        <UserFormModal
          user={formUser}
          selfId={selfId}
          isSubmitting={isSaving}
          error={formError}
          onSubmit={(values) => void handleFormSubmit(values)}
          onClose={closeForm}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          isSubmitting={resetState.isLoading}
          error={resetError}
          onSubmit={(values) => void handleResetPassword(values)}
          onClose={() => setResetTarget(null)}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={t('admin.users.deleteDialog.title')}
        description={t('admin.users.deleteDialog.description', {
          name: deleteTarget?.name ?? '',
        })}
        confirmLabel={t('admin.users.deleteDialog.confirm')}
        cancelLabel={t('admin.users.deleteDialog.cancel')}
        isLoading={deleteState.isLoading}
        variant="danger"
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />

      {isError && (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            {t('admin.users.errors.retry')}
          </Button>
        </div>
      )}
    </div>
  );
};
