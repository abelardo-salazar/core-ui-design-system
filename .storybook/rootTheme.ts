type Theme = 'light' | 'dark';

// Reads a value as it is in `theme`, whatever the toolbar has selected, for play functions that
// assert on theme tokens. Synchronous, so nothing paints in between: the story never leaves the
// selected theme, not even when a later assertion fails.
export function readInTheme<T>(theme: Theme, read: () => T): T {
  const root = document.documentElement;
  const wasDark = root.classList.contains('dark');
  root.classList.toggle('dark', theme === 'dark');
  try {
    return read();
  } finally {
    root.classList.toggle('dark', wasDark);
  }
}

// Raw value of a custom property of :root in `theme`.
export function rootTokenIn(theme: Theme, name: string): string {
  return readInTheme(theme, () =>
    getComputedStyle(document.documentElement).getPropertyValue(name),
  );
}
