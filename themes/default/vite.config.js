import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            refresh: ['resources/views/**'],
            publicDirectory: '../../public',
            buildDirectory: 'build/default',
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': `${import.meta.dirname}/resources/js`,
        },
    },
    build: {
        emptyOutDir: true,
    },
});
