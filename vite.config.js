import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    build: {
        outDir: 'build',
        rollupOptions: {
            external: ['moment'], // Treat moment as an external dependency
        },
    },
    plugins: [react()],
});
