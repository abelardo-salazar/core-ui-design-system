import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import { CLIENT_ENTRY_POINTS as CLIENT_ENTRY_POINTS_RELATIVE } from './scripts/client-entry-points.mjs';
import { NOTICES_FILE, packageRoot, renderNotices } from './scripts/third-party-notices.mjs';
import { FONTS_DIR, fontSourceFiles, renderPublishedFonts } from './scripts/fonts.mjs';

// Source files that declare 'use client' because they use React hooks directly
// (Input, Textarea) or wrap Radix/Sonner primitives marked 'use client'.
// Rollup, even with output.preserveModules, does not keep the directives of non-entry
// modules (verified in this repo: a build with preserveModules:true + grep on dist/
// gave 0 occurrences of "use client", see the commit of this migration). This plugin
// re-injects the directive into the exact chunk that belongs to each file.
//
// The list itself lives in scripts/client-entry-points.mjs (single source of truth,
// shared with scripts/verify-client-directives.mjs); don't duplicate it here.
const CLIENT_ENTRY_POINTS = CLIENT_ENTRY_POINTS_RELATIVE.map((p) =>
  resolve(__dirname, p).replace(/\\/g, '/'),
);

// The `./charts` entry (src/charts.ts → dist/charts.js) is fully client-only: it doesn't need
// the per-component treatment of CLIENT_ENTRY_POINTS, it carries 'use client' at the top of
// the whole file. It is handled apart from that list on purpose: CLIENT_ENTRY_POINTS is
// specifically ".tsx components under src/components/", and scripts/verify-client-directives.mjs
// checks it with that meaning.
const CHARTS_ENTRY = resolve(__dirname, 'src/charts.ts').replace(/\\/g, '/');

function preserveUseClientDirective(): Plugin {
  return {
    name: 'preserve-use-client-directive',
    renderChunk(code, chunk) {
      const facadeModuleId = chunk.facadeModuleId?.replace(/\\/g, '/');
      const isClientModule =
        !!facadeModuleId &&
        (facadeModuleId === CHARTS_ENTRY || CLIENT_ENTRY_POINTS.includes(facadeModuleId));
      const alreadyHasDirective = /^['"]use client['"];?/.test(code);

      if (isClientModule && !alreadyHasDirective) {
        return { code: `'use client';\n${code}`, map: null };
      }
      return null;
    },
  };
}

// Publishes src/tailwind.css uncompiled as dist/tailwind.css (exports["./tailwind.css"])
// for consumers with Tailwind v4, who compile it with their own Tailwind. Verbatim copy:
// its @source and @plugin resolve relative to the file, already inside dist/.
function copyTailwindSource(): Plugin {
  const source = resolve(__dirname, 'src/tailwind.css');
  return {
    name: 'copy-tailwind-source',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'tailwind.css',
        source: readFileSync(source, 'utf8'),
      });
    },
  };
}

// Publishes src/fonts.css as dist/fonts.css (exports["./fonts.css"]) with its url()s rewritten
// to ./fonts/<file>: the same woff2 files that style.css uses, which Vite writes to dist/fonts/
// because style.css references them (see assetFileNames below), so nothing is duplicated.
function publishFonts(): Plugin {
  return {
    name: 'publish-fonts',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'fonts.css',
        source: renderPublishedFonts(__dirname),
      });
    },
  };
}

// Emits dist/THIRD-PARTY-NOTICES.txt with the license of every package whose modules end up in
// the bundle (preserveModules copies them into dist/node_modules without their LICENSE) and of
// the font packages whose files end up in dist/fonts/. Rendering lives in
// scripts/third-party-notices.mjs, shared with the guardrail scripts/verify-third-party-notices.mjs.
function thirdPartyNotices(): Plugin {
  return {
    name: 'third-party-notices',
    apply: 'build',
    generateBundle(_options, bundle) {
      const packageDirs = new Set<string>();
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;
        for (const id of Object.keys(output.modules)) {
          const dir = packageRoot(id);
          if (dir) packageDirs.add(dir);
        }
      }
      for (const file of fontSourceFiles(__dirname)) {
        const dir = packageRoot(file);
        if (dir) packageDirs.add(dir);
      }
      this.emitFile({
        type: 'asset',
        fileName: NOTICES_FILE,
        source: renderNotices([...packageDirs]),
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Soporte Tailwind v4
    copyTailwindSource(),
    publishFonts(),
    thirdPartyNotices(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.app.json', // Make sure this is the right tsconfig
      // By default, dts() takes include/exclude from tsconfig.app.json, which excludes
      // *.stories.tsx/*.test.tsx, so none of them ends up in dist/. *.test-d.tsx (a pure type
      // test, see Badge.types.test-d.tsx) uses that name precisely so that tsc -b DOES compile
      // it, which is why it needs its own explicit exclusion here: passing `exclude` replaces
      // the tsconfig one entirely instead of adding to it, so the other two patterns have to be
      // repeated to keep them.
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.test-d.tsx'],
    }),
  ],
  // Relative asset URLs: style.css points to its fonts as ./fonts/<file>, not /fonts/<file>
  // (the consumer serves the package from its own bundle, never from the site root).
  // Library mode inlines every asset as a data URI and ignores assetsInlineLimit; the url()s of
  // src/fonts.css carry ?no-inline so the fonts are emitted as files: style.css and
  // dist/fonts.css point to the same ones, and the browser only downloads the subsets it needs.
  base: './',
  build: {
    lib: {
      // Three entry points: the root barrel (`.`), `./charts` (Chart isolated so it doesn't
      // pull recharts into the barrel, see src/charts.ts) and `./locale` (DayPicker locales,
      // pure data, server-safe, see src/locale.ts). With preserveModules each one comes out as
      // dist/<name>.js (name = path relative to preserveModulesRoot: 'src').
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        charts: resolve(__dirname, 'src/charts.ts'),
        locale: resolve(__dirname, 'src/locale.ts'),
      },
      name: 'CoreUI',
      formats: ['es'], // ESM only: preserveModules requires one file per module,
      // incompatible with a single UMD bundle. See the decision recorded in the migration.
    },
    rollupOptions: {
      // ⚠️ CRITICAL: externalize the dependencies we don't want to bundle.
      // The Radix/Sonner packages are now peerDependencies: the consumer
      // resolves them from its own node_modules, where they keep their own
      // 'use client' directive intact.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-avatar',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-select',
        '@radix-ui/react-switch',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-popover',
        '@radix-ui/react-progress',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toggle-group',
        '@radix-ui/react-toggle',
        'sonner',
        '@tanstack/react-table',
        'cmdk',
      ],
      plugins: [preserveUseClientDirective()],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        // Fonts without a hash in dist/fonts/, where dist/fonts.css expects them.
        assetFileNames: (asset) =>
          asset.names.some((name) => /\.woff2?$/.test(name))
            ? `${FONTS_DIR}/[name][extname]`
            : '[name][extname]',
        exports: 'named',
      },
    },
  },
});
