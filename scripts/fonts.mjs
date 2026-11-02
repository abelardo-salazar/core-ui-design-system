// Self-hosted font files: src/fonts.css points its url()s at the files of a font package in
// node_modules (so Vite and Storybook resolve them in development); the build copies them to
// dist/fonts/ and publishes dist/fonts.css with the url()s rewritten to ./fonts/<file>.
//
// Used by vite.config.ts (dist/fonts.css, third-party notices) and by
// scripts/verify-third-party-notices.mjs (which package each file of dist/fonts/ comes from).
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export const FONTS_SOURCE = 'src/fonts.css';
export const FONTS_DIR = 'fonts';

// url('<path>') with an optional ?query (src/fonts.css uses ?no-inline, see vite.config.ts).
const URL_RE = /url\((['"]?)([^'")?]+)(\?[^'")]*)?\1\)/g;
const LEADING_COMMENT_RE = /^\s*\/\*[\s\S]*?\*\/\s*/;

const PUBLISHED_HEADER = `/* Ubuntu, self-hosted: 300, 400, 500 and 700, normal and italic, split into subsets by
   unicode-range with font-display: swap. The browser only downloads the files whose
   unicode-range matches text that uses the font. The url()s are relative to this file and point
   to the woff2 files in ./fonts/. Licence: THIRD-PARTY-NOTICES.txt (Ubuntu Font Licence 1.0). */
`;

// Files referenced by src/fonts.css, as absolute paths. `root` is the repo root.
export function fontSourceFiles(root) {
  const css = readFileSync(join(root, FONTS_SOURCE), 'utf8');
  const base = dirname(join(root, FONTS_SOURCE));
  return [...new Set([...css.matchAll(URL_RE)].map((m) => join(base, m[2])))];
}

// Contents of dist/fonts.css: src/fonts.css with every url() pointing at ./fonts/<file>, without
// the query, and with a header for the published file instead of the source one.
export function renderPublishedFonts(root) {
  const css = readFileSync(join(root, FONTS_SOURCE), 'utf8');
  return (
    PUBLISHED_HEADER +
    '\n' +
    css
      .replace(LEADING_COMMENT_RE, '')
      .replace(
        URL_RE,
        (_match, quote, url) => `url(${quote}./${FONTS_DIR}/${basename(url)}${quote})`,
      )
  );
}
