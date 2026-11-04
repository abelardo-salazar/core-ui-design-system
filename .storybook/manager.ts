import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Core UI Design System',
    brandUrl: 'https://github.com/abelardo-salazar/core-ui-design-system',
    // null shows brandTitle as text; undefined would show the Storybook logo instead.
    brandImage: null,
  }),
});
