import type { ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';

interface AuthLayoutProps {
    title?: string;
    children: ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const messages = Object.values(errors ?? {}).filter(Boolean);

    return (
        <div className="min-h-screen flex flex-col justify-center bg-slate-50 px-4 py-12 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <Head title={title} />

            <div className="mx-auto w-full max-w-md">
                {title && (
                    <h1 className="mb-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
                        {title}
                    </h1>
                )}

                <div className="rounded-lg bg-white p-8 shadow dark:bg-slate-900">
                    {messages.length > 0 && (
                        <ul className="mb-4 list-inside list-disc space-y-1 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                            {messages.map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
