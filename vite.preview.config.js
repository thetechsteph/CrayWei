// Single-file build used only to share a quick preview. Not needed for normal dev.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: 'dist-preview', chunkSizeWarningLimit: 4000 },
});
