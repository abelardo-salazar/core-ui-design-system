// Shared by the packaging guardrails (verify-tailwind-consumer.mjs, verify-fonts.mjs): packs the
// real `npm pack` tarball and installs it by hand in a consumer fixture with Tailwind v4.
//
// No network: it installs nothing from any registry. The fixture lives in a temporary directory
// outside the repo (so module resolution doesn't climb up to the main node_modules): it extracts
// the tarball, copies `tailwindcss` (the consumer's own dependency) and, for each `@plugin` in the
// published tailwind.css, copies that package only if the packed manifest declares it in
// `dependencies`, which is what npm would install for the consumer. A plugin that is a
// devDependency fails here just as it would for the consumer ("Can't resolve ...").
import { execFileSync, execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ROOT_MODULES = join(ROOT, 'node_modules');
const CLI = join(ROOT_MODULES, '@tailwindcss/cli/dist/index.mjs');

// Runs `use(consumer)` (sync or async) on a fresh fixture and always deletes it afterwards.
// consumer: { fixture, installed, packed, compile(input, output) }
//   - fixture: directory of the consumer project;
//   - installed: directory of the package in the fixture's node_modules;
//   - packed: the packed package.json;
//   - compile: runs the Tailwind CLI in the fixture (--minify, same format as style.css).
export async function withPackedConsumer(prefix, use) {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const work = mkdtempSync(join(tmpdir(), prefix));
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
      cpSync(join(ROOT_MODULES, name), join(modules, name), {
        recursive: true,
        dereference: true,
      });

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

    const compile = (input, output) =>
      execFileSync(process.execPath, [CLI, '-i', input, '-o', output, '--minify'], {
        cwd: fixture,
        stdio: ['ignore', 'inherit', 'inherit'],
      });

    return await use({ fixture, installed, packed, compile });
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
