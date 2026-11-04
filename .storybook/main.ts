import type { StorybookConfig } from '@storybook/react-vite';
import type { PluginOption } from 'vite';

// Plugins of vite.config.ts that only make sense for the package build: they would emit the .d.ts
// files, tailwind.css, fonts.css and the notices into storybook-static.
const LIBRARY_ONLY_PLUGINS = new Set([
  'unplugin-dts',
  'copy-tailwind-source',
  'publish-fonts',
  'third-party-notices',
]);

const withoutLibraryPlugins = (plugins: PluginOption[]): PluginOption[] =>
  plugins.flatMap((plugin) => {
    if (Array.isArray(plugin)) return withoutLibraryPlugins(plugin);
    return plugin && 'name' in plugin && LIBRARY_ONLY_PLUGINS.has(plugin.name) ? [] : [plugin];
  });

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react-vite',
  // Missing names are fine: the Vitest plugin also runs this, on a config without these plugins.
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: withoutLibraryPlugins(viteConfig.plugins ?? []),
  }),
};
export default config;
