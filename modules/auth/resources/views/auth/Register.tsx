import { useState, type FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';

const MIN_PASSWORD_LENGTH = 8;

interface RegisterProps {
    title: string;
}

export default function Register({ title }: RegisterProps) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title={title}>
            <form onSubmit={submit} className="space-y-4" noValidate>
                <Input
                    label={t('auth.register.nameLabel', 'Full name')}
                    type="text"
                    autoComplete="name"
                    leftIcon={<User className="h-4 w-4" />}
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    error={errors.name}
                />

                <Input
                    label={t('auth.register.emailLabel', 'Email address')}
                    type="email"
                    autoComplete="email"
                    leftIcon={<Mail className="h-4 w-4" />}
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    error={errors.email}
                />

                <Input
                    label={t('auth.register.passwordLabel', 'Password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    error={errors.password}
                    hint={t('auth.register.passwordPlaceholder', `Min. ${MIN_PASSWORD_LENGTH} characters`)}
                    rightIcon={
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((value) => !value)}
                            className="cursor-pointer transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    }
                />

                <Input
                    label={t('auth.register.confirmPasswordLabel', 'Confirm password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    value={data.password_confirmation}
                    onChange={(event) => setData('password_confirmation', event.target.value)}
                />

                <Button
                    type="submit"
                    className="mt-2 w-full"
                    isLoading={processing}
                    leftIcon={<UserPlus className="h-4 w-4" />}
                >
                    {t('auth.register.submit', 'Create account')}
                </Button>
            </form>

            <p className="pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                {t('auth.register.hasAccount', 'Already have an account?')}{' '}
                <Link href="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                    {t('auth.register.signIn', 'Sign in')}
                </Link>
            </p>
        </AuthLayout>
    );
}
