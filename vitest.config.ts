import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Las stories corren en Chromium headless. El proyecto 'storybook' no aplica las utilidades de
// Tailwind (sin layout real): sus aserciones van sobre clases y DOM, y varias stories dependen
// de eso (pointer-events-none no bloquea userEvent, las animaciones de salida no retienen el
// contenido). Las stories con el tag 'real-css' corren solo en 'storybook-css', con
// tailwindcss(), para pruebas que necesitan el CSS aplicado (z-index, elementFromPoint).
// Una por proyecto: Vitest muta la config de cada uno (nombre de la instancia).
const browser = () => ({
  enabled: true,
  headless: true,
  provider: playwright({}),
  instances: [{ browser: 'chromium' as const }],
});
const REAL_CSS_TAG = 'real-css';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          react(),
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            tags: { exclude: [REAL_CSS_TAG] },
          }),
        ],
        test: {
          name: 'storybook',
          // Los dos proyectos de navegador corren uno después del otro: en paralelo, una
          // re-optimización de dependencias en plena corrida cerró la conexión con el navegador y
          // la suite quedó colgada.
          sequence: { groupOrder: 0 },
          browser: browser(),
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          react(),
          tailwindcss(),
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            tags: { include: [REAL_CSS_TAG] },
          }),
        ],
        test: {
          name: 'storybook-css',
          sequence: { groupOrder: 1 },
          browser: browser(),
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
