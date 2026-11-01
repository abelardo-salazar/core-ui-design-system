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
// No network: it installs nothing from any registry. It builds the consumer by hand in a
// temporary directory outside the repo (so module resolution doesn't climb up to the main
// node_modules): extracts the tarball, copies `tailwindcss` (the consumer's own dependency)
// and, for each `@plugin` in the published tailwind.css, copies that package only if the
// packed manifest declares it in `dependencies`, which is what npm would install for the
// consumer. A plugin that is a devDependency fails here just as it would for the consumer
// ("Can't resolve ...").
//
// Fails (exit 1) if the compilation fails or if, in the resulting CSS:
//   - `md:px-8` does not come after `px-4` (broken layer order);
//   - `bg-primary/5`, a token class with opacity used only by the fixture, is not generated;
//   - there is more than one preflight;
//   - googleapis shows up (the consumer loads the font);
//   - `sm:text-left`, a class that only exists in the JS of dist/components, is not generated
//     (the package @source does not scan dist);
//   - it is larger than the published style.css (both minified). style.css has the same plus
//     the classes from stories and docs (it scans the whole repo) and the font @import; with
//     tailwindcss 4.3.3 the consumer comes out ~6.8 KB smaller. Scanning dist/node_modules
//     (dependencies bundled by preserveModules) adds ~94 junk utilities, ~13 KB minified, and
//     leaves it ~6.5 KB larger. Relative ceiling: it grows with the DS.
import { execFileSync, execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ROOT_MODULES = join(ROOT, 'node_modules');
const CLI = join(ROOT_MODULES, '@tailwindcss/cli/dist/index.mjs');
// Selector of a class in the compiled CSS: escapes ':' and '/' the way Tailwind does and
// doesn't match inside another selector (`.px-4` must not find `.md\:px-4`).
const selector = (className) =>
  new RegExp(`(?<![\\w\\\\:/-])\\.${className.replace(/[:/]/g, (c) => `\\\\\\${c}`)}(?=[\\s,{])`);

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'tw-consumer-'));
const failures = [];

try {
  // 1. Real tarball, with the same `files` and `exports` that get published.
  const [{ filename }] = JSON.parse(
    execSync(`npm pack --json --ignore-scripts --pack-destination "${work}"`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    }),
  );

  // 2. Consumer fixture. tar with relative paths (cwd = work): GNU tar reads the "C:" of an
  // absolute Windows path as a remote host.
  const fixture = join(work, 'consumer');
  const modules = join(fixture, 'node_modules');
  const installed = join(modules, pkg.name);
  mkdirSync(installed, { recursive: true });
  execFileSync(
    'tar',
    ['-xzf', filename, '-C', `consumer/node_modules/${pkg.name}`, '--strip-components=1'],
    { cwd: work, stdio: 'inherit' },
  );
  const packed = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'));

  const copyPackage = (name) =>
    cpSync(join(ROOT_MODULES, name), join(modules, name), { recursive: true, dereference: true });

  copyPackage('tailwindcss');

  const exported = packed.exports?.['./tailwind.css'];
  const exportedFile = exported && join(installed, exported);
  if (!exportedFile || !existsSync(exportedFile)) {
    throw new Error(
      `the package does not publish ./tailwind.css (exports["./tailwind.css"] = ${JSON.stringify(exported)})`,
    );
  }
  for (const [, name] of readFileSync(exportedFile, 'utf8').matchAll(
    /@plugin\s+["']([^"']+)["']/g,
  )) {
    if (!packed.dependencies?.[name]) {
      throw new Error(
        `tailwind.css uses @plugin "${name}", but it is not in dependencies: the consumer would not have it installed`,
      );
    }
    copyPackage(name);
  }

  writeFileSync(
    join(fixture, 'input.css'),
    `@import 'tailwindcss';\n@import '${pkg.name}/tailwind.css';\n`,
  );
  // px-4 without md:px-8: the consumer emits the base utility on its own, the case that, with
  // two compilations, overrode the DS responsive one.
  writeFileSync(
    join(fixture, 'page.html'),
    '<main class="px-4"><div class="bg-primary/5">consumidor</div></main>\n',
  );

  // 3. A single compilation, the consumer's.
  const output = join(fixture, 'output.css');
  // --minify: same format as style.css, to compare sizes.
  execFileSync(process.execPath, [CLI, '-i', 'input.css', '-o', 'output.css', '--minify'], {
    cwd: fixture,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  const css = readFileSync(output, 'utf8');

  // 4. Assertions on the resulting CSS.
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
  const styleBytes = Buffer.byteLength(
    readFileSync(join(installed, packed.exports['./style.css']), 'utf8'),
  );
  if (bytes > styleBytes) {
    failures.push(
      `the CSS weighs ${bytes} bytes, more than style.css (${styleBytes}): ` +
        'does the @source scan dist/node_modules?',
    );
  }
  console.log(`Consumer CSS: ${bytes} bytes (style.css: ${styleBytes})`);
} catch (error) {
  failures.push(error.message);
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error('✗ verify-tailwind-consumer:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('✓ verify-tailwind-consumer: single compilation, layer order and classes are correct');
