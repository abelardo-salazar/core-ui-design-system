#!/usr/bin/env node
// Packaging guardrail for the self-hosted font: runs after the build, on the real `npm pack`
// tarball (the same fixture as verify-tailwind-consumer.mjs, see scripts/packed-consumer.mjs).
//
// Why it exists: style.css used to load Ubuntu from Google Fonts, which sent the IP of every
// visitor of the consumer to Google. Now the woff2 files travel in the package (dist/fonts/) and
// both style.css and fonts.css point to them with relative url()s. A url() that points to a file
// left out of the tarball fails silently in the browser (fallback font, no error).
//
// Fails (exit 1) if:
//   - the package doesn't publish ./fonts.css or ./style.css;
//   - either of them has no font url() (fonts.css must declare the font, style.css includes it);
//   - a url() of either one doesn't resolve to a file present in the package;
//   - either of them mentions googleapis or gstatic;
//   - a consumer with Tailwind v4 that imports ./tailwind.css and ./fonts.css fails to compile, or
//     the font url()s of its output don't resolve, from the output file, to files of the package.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
// Transitive dependency of @tailwindcss/vite and @tailwindcss/cli: the compiler both use.
import { compile } from '@tailwindcss/node';
import { withPackedConsumer } from './packed-consumer.mjs';

// url() of a font file: the path (without query or fragment) of every url(... .woff2/.woff).
const FONT_URL_RE = /url\((['"]?)([^'")]+?\.woff2?)([?#][^'")]*)?\1\)/g;
const fontUrls = (css) => [...css.matchAll(FONT_URL_RE)].map((m) => m[2]);

const failures = [];
const checked = [];

// Every font url() of `file` resolves, relative to `file`, to an existing file. `label` names the
// sheet in the messages.
function checkSheet(label, file, root) {
  if (!existsSync(file)) {
    failures.push(`${label}: file not found`);
    return;
  }
  const css = readFileSync(file, 'utf8');
  for (const host of ['googleapis', 'gstatic']) {
    if (css.includes(host)) failures.push(`${label}: mentions ${host}`);
  }
  const urls = fontUrls(css);
  if (urls.length === 0) failures.push(`${label}: no font url()`);
  const missing = [...new Set(urls)].filter((url) => {
    const target = resolve(dirname(file), url);
    return !existsSync(target) || relative(root, target).startsWith('..');
  });
  for (const url of missing)
    failures.push(`${label}: url(${url}) doesn't resolve to a file in the package`);
  checked.push(`${label}: ${urls.length} url()`);
}

try {
  await withPackedConsumer('fonts-consumer-', async ({ fixture, installed, packed }) => {
    // 1. The published sheets, as they are in the tarball.
    for (const entry of ['./fonts.css', './style.css']) {
      const target = packed.exports?.[entry];
      if (typeof target !== 'string') {
        failures.push(
          `the package does not publish ${entry} (exports["${entry}"] = ${JSON.stringify(target)})`,
        );
        continue;
      }
      checkSheet(entry, join(installed, target), installed);
    }

    // 2. A consumer with Tailwind that imports ./tailwind.css and ./fonts.css. Tailwind inlines
    // fonts.css; its url()s must reach the files of the installed package from the output file,
    // which sits next to the input. It compiles with @tailwindcss/node and shouldRewriteUrls,
    // which is what @tailwindcss/vite and @tailwindcss/postcss (Next) do: they rebase the url()s
    // of an inlined file relative to the importing one. The standalone CLI doesn't rebase them,
    // so a consumer that compiles with it would get broken url()s (see the README).
    const from = join(fixture, 'input.css');
    const input = `@import 'tailwindcss';\n@import '${packed.name}/tailwind.css';\n@import '${packed.name}/fonts.css';\n`;
    writeFileSync(from, input);
    const compiler = await compile(input, {
      base: fixture,
      from,
      shouldRewriteUrls: true,
      onDependency: () => {},
    });
    writeFileSync(join(fixture, 'output.css'), compiler.build([]));
    checkSheet('consumer output.css', join(fixture, 'output.css'), installed);
  });
} catch (error) {
  failures.push(error.message);
}

if (failures.length > 0) {
  console.error('✗ verify-fonts:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`✓ verify-fonts: every font url() resolves inside the package (${checked.join('; ')})`);
