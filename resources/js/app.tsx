import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePage } from './lib/inertia-pages';
import './lib/route';

createInertiaApp({
    resolve: resolvePage,
    progress: {
        delay: 150,
        color: '#6366f1',
        includeCSS: true,
        showSpinner: true,
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
