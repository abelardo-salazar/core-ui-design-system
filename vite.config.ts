import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Soporte Tailwind v4
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.app.json', // Asegúrate que este sea tu tsconfig correcto
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CoreUI',
      fileName: (format) => `core-ui.${format}.js`,
      formats: ['es', 'umd'], // ES Modules (Moderno) + UMD (Compatibilidad)
    },
    rollupOptions: {
      // ⚠️ CRÍTICO: Externalizar dependencias que no queremos empaquetar
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
