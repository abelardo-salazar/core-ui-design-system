import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

// Archivos fuente que declaran 'use client' porque usan hooks de React directamente
// (Input, Textarea) o envuelven primitivas de Radix/Sonner marcadas 'use client'.
// Rollup, incluso con output.preserveModules, no conserva directivas de módulos
// no-entry (verificado en este repo: build con preserveModules:true + grep en dist/
// dio 0 ocurrencias de "use client", ver commit de esta migración). Este plugin
// reinyecta la directiva en el chunk exacto que le corresponde a cada archivo.
const CLIENT_ENTRY_POINTS = [
  'src/components/Input/Input.tsx',
  'src/components/Textarea/Textarea.tsx',
  'src/components/Dialog/Dialog.tsx',
  'src/components/Sheet/Sheet.tsx',
  'src/components/Select/Select.tsx',
  'src/components/Checkbox/Checkbox.tsx',
  'src/components/Switch/Switch.tsx',
  'src/components/Avatar/Avatar.tsx',
  'src/components/Toast/Toast.tsx',
].map((p) => resolve(__dirname, p).replace(/\\/g, '/'));

function preserveUseClientDirective(): Plugin {
  return {
    name: 'preserve-use-client-directive',
    renderChunk(code, chunk) {
      const facadeModuleId = chunk.facadeModuleId?.replace(/\\/g, '/');
      const isClientModule = !!facadeModuleId && CLIENT_ENTRY_POINTS.includes(facadeModuleId);
      const alreadyHasDirective = /^['"]use client['"];?/.test(code);

      if (isClientModule && !alreadyHasDirective) {
        return { code: `'use client';\n${code}`, map: null };
      }
      return null;
    },
  };
}

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
      formats: ['es'], // Solo ESM: preserveModules requiere un archivo por módulo,
      // incompatible con un bundle único UMD. Ver decisión registrada en la migración.
    },
    rollupOptions: {
      // ⚠️ CRÍTICO: Externalizar dependencias que no queremos empaquetar.
      // Los paquetes de Radix/Sonner ahora son peerDependencies: el consumidor
      // los resuelve desde su propio node_modules, donde ya traen su propia
      // directiva 'use client' intacta.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@radix-ui/react-dialog',
        '@radix-ui/react-avatar',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-select',
        '@radix-ui/react-switch',
        'sonner',
      ],
      plugins: [preserveUseClientDirective()],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        exports: 'named',
      },
    },
  },
});
