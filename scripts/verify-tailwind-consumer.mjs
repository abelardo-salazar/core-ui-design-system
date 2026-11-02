#!/usr/bin/env node
// Packaging guardrail: compiles the published package the way a consumer with Tailwind v4
// that imports `./tailwind.css` would (a single compilation, theirs). Runs after the build,
// on the real `npm pack` tarball.
//
// Why it exists: the precompiled style.css plus the consumer's Tailwind are two compilations
// that the bundler (Next) merges into the same layers. A base utility the consumer emits
// again ends up after the DS responsive one and overrides it (Container `px-4 md:px-8`), and
// token classes that only the consumer uses (`bg-primary/5`) are not generated.
//
// The tarball and the consumer fixture come from scripts/packed-consumer.mjs (no network).
//
// Fails (exit 1) if the compilation fails or if, in the resulting CSS:
//   - `md:px-8` does not come after `px-4` (broken layer order);
//   - `bg-primary/5`, a token class with opacity used only by the fixture, is not generated;
//   - there is more than one preflight;
//   - googleapis shows up (the consumer loads the font);
//   - `sm:text-left`, a class that only exists in the JS of dist/components, is not generated
//     (the package @source does not scan dist);
//   - it is larger than the published style.css without its @font-face rules (both minified).
//     style.css has the same plus the classes from stories and docs (it scans the whole repo);
//     with tailwindcss 4.3.3 the consumer comes out ~4.3 KB smaller. Scanning dist/node_modules
//     (dependencies bundled by preserveModules) adds ~94 junk utilities, ~13 KB minified, and
//     leaves it ~6.5 KB larger. Relative ceiling: it grows with the DS.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { withPackedConsumer } from './packed-consumer.mjs';

// Selector of a class in the compiled CSS: escapes ':' and '/' the way Tailwind does and
// doesn't match inside another selector (`.px-4` must not find `.md\:px-4`).
const selector = (className) =>
  new RegExp(`(?<![\\w\\\\:/-])\\.${className.replace(/[:/]/g, (c) => `\\\\\\${c}`)}(?=[\\s,{])`);

const failures = [];

try {
  await withPackedConsumer('tw-consumer-', ({ fixture, installed, packed, compile }) => {
    writeFileSync(
      join(fixture, 'input.css'),
      `@import 'tailwindcss';\n@import '${packed.name}/tailwind.css';\n`,
    );
    // px-4 without md:px-8: the consumer emits the base utility on its own, the case that, with
    // two compilations, overrode the DS responsive one.
    writeFileSync(
      join(fixture, 'page.html'),
      '<main class="px-4"><div class="bg-primary/5">consumidor</div></main>\n',
    );

    // A single compilation, the consumer's.
    // --minify: same format as style.css, to compare sizes.
    compile('input.css', 'output.css');
    const css = readFileSync(join(fixture, 'output.css'), 'utf8');

    // Assertions on the resulting CSS.
    const at = (className) => css.search(selector(className));
    const base = at('px-4');
    const responsive = at('md:px-8');
    if (base === -1 || responsive === -1 || responsive < base) {
      failures.push(`md:px-8 must come after px-4 (px-4 at ${base}, md:px-8 at ${responsive})`);
    }
    if (at('bg-primary/5') === -1) {
      failures.push('bg-primary/5 was not generated (token class used only by the consumer)');
    }
    const preflights =
      css.match(/::file-selector-button\s*\{\s*box-sizing:\s*border-box;/g)?.length ?? 0;
    if (preflights !== 1) failures.push(`expected 1 preflight, found ${preflights}`);
    if (css.includes('googleapis')) failures.push('the CSS imports Google Fonts');
    if (at('sm:text-left') === -1) {
      failures.push(
        'sm:text-left was not generated: the package @source does not scan dist/components',
      );
    }
    const bytes = Buffer.byteLength(css);
    // Without its @font-face rules (~16 KB): the fixture doesn't import fonts.css, and keeping
    // them would leave room for the junk utilities this check exists to catch.
    const styleBytes = Buffer.byteLength(
      readFileSync(join(installed, packed.exports['./style.css']), 'utf8').replace(
        /@font-face\s*\{[^}]*\}/g,
        '',
      ),
    );
    if (bytes > styleBytes) {
      failures.push(
        `the CSS weighs ${bytes} bytes, more than style.css without @font-face (${styleBytes}): ` +
          'does the @source scan dist/node_modules?',
      );
    }
    console.log(`Consumer CSS: ${bytes} bytes (style.css without @font-face: ${styleBytes})`);
  });
} catch (error) {
  failures.push(error.message);
}

if (failures.length > 0) {
  console.error('✗ verify-tailwind-consumer:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('✓ verify-tailwind-consumer: single compilation, layer order and classes are correct');
