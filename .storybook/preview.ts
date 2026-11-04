import type { Decorator, Preview } from '@storybook/react-vite';
import '../src/index.css';

// Whether the toolbar is the one that added .dark, so going back to light removes only that.
let darkFromToolbar = false;

// Light leaves .dark alone: the play functions of some stories add and remove it on
// documentElement to assert on the dark tokens. Docs pages stay light: their background comes from
// the Storybook docs theme, so transparent components would get light text on white.
const withTheme: Decorator = (Story, { globals, viewMode }) => {
  const root = document.documentElement;
  if (globals.theme === 'dark' && viewMode === 'story') {
    root.classList.add('dark');
    darkFromToolbar = true;
  } else if (darkFromToolbar) {
    root.classList.remove('dark');
    darkFromToolbar = false;
  }
  return Story();
};

const preview: Preview = {
  decorators: [withTheme],

  globalTypes: {
    theme: {
      description: 'Tema del design system',
      toolbar: {
        title: 'Tema',
        icon: 'sun',
        items: [
          { value: 'light', title: 'Claro', icon: 'sun' },
          { value: 'dark', title: 'Oscuro', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: 'light',
  },

  parameters: {
    options: {
      storySort: {
        order: ['Introducción', '*'],
      },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
