import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [tailwindcss()],
    publicDir: false,
    build: {
        outDir: 'resources/assets',
        emptyOutDir: false,
        rollupOptions: {
            input: {
                theme: 'resources/assets/css/app.css',
            },
            output: {
                assetFileNames: 'css/[name][extname]',
            },
        },
    },
});
