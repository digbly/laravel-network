import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { BadgeCheck, KeyRound, Save, ShieldAlert } from 'lucide-react';
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfileProps {
    title: string;
    profile: {
        name: string;
        email: string;
        avatar: string | null;
        email_verified: boolean;
    };
}

export default function Profile({ title, profile }: ProfileProps) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState<string | null>(null);

    const infoForm = useForm({
        name: profile.name,
        avatar: null as File | null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitInfo = (event: FormEvent) => {
        event.preventDefault();

        infoForm.post('/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setPreview(null),
        });
    };

    const submitPassword = (event: FormEvent) => {
        event.preventDefault();

        passwordForm.put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        infoForm.setData('avatar', file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const avatar = preview ?? profile.avatar;

    return (
        <AdminLayout title={title}>
            <h1 className="mb-6 text-2xl font-bold">{title}</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {t('auth.profile.personal.title', 'Personal information')}
                    </h2>

                    <form onSubmit={submitInfo} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-bold text-slate-500 dark:bg-slate-800">
                                {avatar ? (
                                    <img src={avatar} alt={profile.name} className="h-full w-full object-cover" />
                                ) : (
                                    profile.name.charAt(0).toUpperCase()
                                )}
                            </span>
                            <label className="text-xs text-slate-500 dark:text-slate-400">
                                <span className="mb-1 block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    {t('auth.profile.personal.avatarLabel', 'Profile photo')}
                                </span>
                                <input type="file" accept="image/*" onChange={onAvatarChange} />
                            </label>
                        </div>

                        <Input
                            label={t('auth.profile.personal.nameLabel', 'Full name')}
                            value={infoForm.data.name}
                            onChange={(event) => infoForm.setData('name', event.target.value)}
                            error={infoForm.errors.name}
                        />

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                {t('auth.profile.personal.emailLabel', 'Email address')}
                            </label>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                                <span>{profile.email}</span>
                                {profile.email_verified ? (
                                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                                )}
                            </div>
                        </div>

                        <Button type="submit" isLoading={infoForm.processing} leftIcon={<Save className="h-4 w-4" />}>
                            {t('auth.profile.personal.submit', 'Save changes')}
                        </Button>
                    </form>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {t('auth.profile.password.title', 'Change password')}
                    </h2>

                    <form onSubmit={submitPassword} className="space-y-4">
                        <Input
                            label={t('auth.profile.password.currentLabel', 'Current password')}
                            type="password"
                            autoComplete="current-password"
                            value={passwordForm.data.current_password}
                            onChange={(event) => passwordForm.setData('current_password', event.target.value)}
                            error={passwordForm.errors.current_password}
                        />

                        <Input
                            label={t('auth.profile.password.newLabel', 'New password')}
                            type="password"
                            autoComplete="new-password"
                            value={passwordForm.data.password}
                            onChange={(event) => passwordForm.setData('password', event.target.value)}
                            error={passwordForm.errors.password}
                        />

                        <Input
                            label={t('auth.profile.password.confirmLabel', 'Confirm new password')}
                            type="password"
                            autoComplete="new-password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)}
                        />

                        <Button
                            type="submit"
                            isLoading={passwordForm.processing}
                            leftIcon={<KeyRound className="h-4 w-4" />}
                        >
                            {t('auth.profile.password.submit', 'Update password')}
                        </Button>
                    </form>
                </section>
            </div>
        </AdminLayout>
    );
}
