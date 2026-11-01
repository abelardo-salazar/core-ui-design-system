import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Stories run in headless Chromium. The 'storybook' project doesn't apply Tailwind's
// utilities (no real layout): its assertions are on classes and DOM, and several stories rely
// on that (pointer-events-none doesn't block userEvent, exit animations don't hold on to the
// content). Stories tagged 'real-css' run only in 'storybook-css', with tailwindcss(), for
// tests that need the CSS applied (z-index, elementFromPoint).
// One per project: Vitest mutates each project's config (the instance name).
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
          // The two browser projects run one after the other: in parallel, a dependency
          // re-optimization in the middle of a run closed the connection to the browser and
          // the suite hung.
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
