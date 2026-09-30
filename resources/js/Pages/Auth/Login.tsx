import type { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';

interface Provider {
    value: string;
    label: string;
}

interface LoginProps {
    title: string;
    redirect?: string | null;
    providers: Provider[];
}

export default function Login({ title, redirect, providers = [] }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
        redirect: redirect ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title={title}>
            <form onSubmit={submit} className="space-y-5" noValidate>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(event) => setData('remember', event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                    Remember me
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                    {processing ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            {providers.length > 0 && (
                <div className="mt-6">
                    <p className="mb-3 text-center text-xs uppercase tracking-wide text-slate-400">
                        Or continue with
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {providers.map((provider) => (
                            <a
                                key={provider.value}
                                href={`/auth/social/${provider.value}/redirect${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                                className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                {provider.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}
