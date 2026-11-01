#!/usr/bin/env node
// Build guardrail: keeps a component with 'use client' in its source from being published
// without the directive in dist/ (it happened with Popover, Progress, Calendar, DatePicker, Chip
// and Image; see CHANGELOG.md). The bug was not the build itself but that CLIENT_ENTRY_POINTS
// is a hand-maintained list nobody updated when adding a new component. This script does not
// replace that list; it only checks it against the actual src/components/ on every build.
//
// Fails (exit 1) if:
//   - a .tsx in src/components/ has 'use client' on its first line and is not in
//     CLIENT_ENTRY_POINTS (the case that broke production).
//   - a CLIENT_ENTRY_POINTS entry no longer exists, or its file no longer has the
//     directive (list out of date the other way: it doesn't break the build today, but it's
//     the same kind of silent drift).
//
// `--post-build` mode (runs AFTER `vite build`, see package.json): checks the real artifact.
// Fails if the published root barrel (dist/index.js) pulls in recharts, directly or
// transitively through any reachable relative import. recharts (ResponsiveContainer.js)
// calls createContext(...) at module level, which blows up in the Next.js react-server
// environment; dist/index.js is the only file a real consumer imports, so it must stay 100%
// free of recharts. Chart now lives in the ./charts subpath (dist/charts.js), which is fully
// client-only and may bring recharts. See CHANGELOG.md [0.4.1]. It also checks dist/locale.js
// (./locale subpath): it can reach neither the barrel nor recharts.
//
// Extra check in the default mode (static heuristic, see below): detects a component without
// 'use client' that declares a function locally and uses it as a JSX handler
// (onClick={handleX}), the pattern that broke Button (handleClick is always built inside the
// asChild branch and attached as onClick={handleClick} to Slot; no combination of props
// avoids it). See CHANGELOG.md [0.4.3].
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIENT_ENTRY_POINTS } from './client-entry-points.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const COMPONENTS_DIR = join(ROOT, 'src/components');
const USE_CLIENT_RE = /^['"]use client['"];?$/;

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

// --- Post-build mode: what each published entry can reach ---------------------------------
//
// dist/index.js cannot reach recharts (see header). dist/locale.js (./locale subpath,
// src/locale.ts) is pure data and server-safe: it cannot reach recharts or the root barrel;
// if it did, importing a locale would pull in the whole DS and its 'use client' boundary.

if (process.argv.includes('--post-build')) {
  // Every `import ... from '<spec>'` / `export ... from '<spec>'` (and `import '<spec>'`) in the chunk.
  const FROM_RE = /(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g;
  const RECHARTS_RE = /(^|\/)recharts(\/|$)/;
  const BARREL = join(ROOT, 'dist/index.js');

  // Walks the graph of relative imports from `entry` (externalized bare specifiers, such as
  // react and @radix-ui/*, are not opened). Returns the visited files and the imports that
  // break a rule: `{ file, spec, reason }`.
  function inspect(entry, { forbidBarrel }) {
    const visited = new Set();
    const queue = [entry];
    const offenders = [];

    while (queue.length > 0) {
      const abs = queue.shift();
      if (visited.has(abs)) continue;
      visited.add(abs);

      let code;
      try {
        code = readFileSync(abs, 'utf8');
      } catch {
        continue;
      }

      for (const m of code.matchAll(FROM_RE)) {
        const spec = m[1] ?? m[2];
        if (!spec) continue;
        const file = toPosix(relative(ROOT, abs));

        if (RECHARTS_RE.test(spec)) {
          offenders.push({ file, spec, reason: 'recharts' });
          continue;
        }
        if (spec.startsWith('.')) {
          const target = resolve(dirname(abs), spec);
          for (const cand of [target, `${target}.js`, join(target, 'index.js')]) {
            if (existsSync(cand) && statSync(cand).isFile()) {
              if (forbidBarrel && cand === BARREL) {
                offenders.push({ file, spec, reason: 'root barrel (dist/index.js)' });
              } else {
                queue.push(cand);
              }
              break;
            }
          }
        }
      }
    }
    return { visited, offenders };
  }

  const CHECKS = [
    {
      entry: 'dist/index.js',
      forbidBarrel: false,
      ok: 'is free of recharts',
      fail: 'The published root barrel (dist/index.js) pulls in recharts and is NOT safe for Server Components',
      hint:
        '  recharts can only live under the ./charts subpath (src/charts.ts → dist/charts.js).\n' +
        '  Check that src/index.ts re-exports nothing from src/components/Chart/ (not even transitively).',
    },
    {
      entry: 'dist/locale.js',
      forbidBarrel: true,
      ok: 'reaches neither the root barrel nor recharts',
      fail: 'The ./locale subpath (dist/locale.js) reaches modules it must not reach',
      hint: '  src/locale.ts can only re-export DayPicker locales: nothing from the barrel or components/.',
    },
  ];

  let failed = false;
  for (const { entry, forbidBarrel, ok, fail, hint } of CHECKS) {
    const abs = join(ROOT, entry);
    if (!existsSync(abs)) {
      console.error(`✗ ${entry} does not exist. Did you run this check before \`vite build\`?`);
      failed = true;
      continue;
    }
    const { visited, offenders } = inspect(abs, { forbidBarrel });
    if (offenders.length > 0) {
      console.error(`✗ ${fail}:\n`);
      for (const { file, spec, reason } of offenders) {
        console.error(`    ${file}  →  import '${spec}'  (${reason})`);
      }
      console.error(`\n${hint}`);
      failed = true;
      continue;
    }
    console.log(`✓ ${entry} ${ok} (${visited.size} modules inspected).`);
  }

  // The DS `sideEffects` vs. the dependencies bundled in dist/node_modules/. For the
  // consumer's bundler, those copies are DS files: the DS field replaces each dependency's
  // field. If a dependency declares a JS module with side effects (d3-format, d3-time-format:
  // src/defaultLocale.js) and it is in dist, its path must be listed in the DS `sideEffects`;
  // and every declared JS path must exist (preserveModules can change the layout of
  // dist/node_modules/).
  const declared = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).sideEffects ?? [];
  const isCss = (pattern) => /\.css$/.test(pattern);

  // dist/node_modules/<pkg> mirrors the repo's node_modules/<pkg> (nested ones too).
  function bundledPackages(rel = 'node_modules') {
    const distDir = join(ROOT, 'dist', rel);
    if (!existsSync(distDir)) return [];
    const result = [];
    for (const name of readdirSync(distDir)) {
      const names = name.startsWith('@')
        ? readdirSync(join(distDir, name)).map((s) => `${name}/${s}`)
        : [name];
      for (const pkg of names) {
        const pkgRel = `${rel}/${pkg}`;
        const manifest = join(ROOT, pkgRel, 'package.json');
        if (existsSync(manifest)) {
          result.push({
            pkgRel,
            sideEffects: JSON.parse(readFileSync(manifest, 'utf8')).sideEffects,
          });
        }
        result.push(...bundledPackages(`${pkgRel}/node_modules`));
      }
    }
    return result;
  }

  const missingDecl = [];
  const unmappable = [];
  for (const { pkgRel, sideEffects } of bundledPackages()) {
    if (!Array.isArray(sideEffects)) continue;
    for (const pattern of sideEffects.filter((p) => !isCss(p))) {
      if (/[*?{[]/.test(pattern)) {
        unmappable.push(`${pkgRel}: '${pattern}'`);
        continue;
      }
      const distPath = `./dist/${pkgRel}/${pattern.replace(/^\.\//, '')}`;
      if (existsSync(join(ROOT, distPath)) && !declared.includes(distPath)) {
        missingDecl.push(distPath);
      }
    }
  }
  const staleDecl = declared.filter((p) => !isCss(p) && !existsSync(join(ROOT, p)));

  if (missingDecl.length > 0 || unmappable.length > 0 || staleDecl.length > 0) {
    console.error('✗ package.json `sideEffects` does not match the bundled dependencies:\n');
    for (const p of missingDecl) console.error(`    not declared: "${p}"`);
    for (const p of unmappable) console.error(`    JS glob not mapped (check by hand): ${p}`);
    for (const p of staleDecl) console.error(`    declared but missing from dist/: "${p}"`);
    failed = true;
  } else {
    console.log('✓ `sideEffects` includes the side-effect modules of the bundled dependencies.');
  }

  process.exit(failed ? 1 : 0);
}

// --- Default mode (pre-build): CLIENT_ENTRY_POINTS in sync with src/components/ ------------

function firstLine(absPath) {
  const content = readFileSync(absPath, 'utf8');
  return content
    .slice(0, content.indexOf('\n') === -1 ? content.length : content.indexOf('\n'))
    .trim();
}

function findTsxFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      results.push(...findTsxFiles(abs));
    } else if (entry.endsWith('.tsx')) {
      results.push(abs);
    }
  }
  return results;
}

// Detects `const NAME = (...) => {...}` / `const NAME = function(...) {...}` and
// `function NAME(...) {...}` declared anywhere in the file (it doesn't matter whether they are
// inside the component body, only that the identifier is declared with `const`/`function`
// rather than destructured from props). It deliberately does NOT cover wrappers such as
// `useCallback(...)`/`useMemo(...)`: the heuristic is what the task asked for, no more (see the
// header comment). False negatives there are left to human judgment.
const LOCAL_FN_DECL_RE =
  /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?\(|\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g;

// `onClick={handleClick}`, `onKeyDown={onKeyDown}`, etc. Only plain identifiers inside
// braces: `onClick={() => ...}` or `onClick={props.onClick}` don't match, on purpose. The case
// we care about is an identifier that also shows up in LOCAL_FN_DECL_RE.
const HANDLER_PROP_USE_RE = /\b(on[A-Z]\w*)\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g;

// *.stories.tsx files are never published in dist/ (they are Storybook/vitest-browser
// fixtures) and freely use `const x = () => {...}` inside their play(), unrelated to RSC;
// they are excluded so they don't add noise unrelated to the purpose of the check.
const STORY_FILE_RE = /\.stories\.tsx$/;

function findImplicitClientHandlers(absPath, relPath) {
  if (STORY_FILE_RE.test(relPath)) return null;
  if (USE_CLIENT_RE.test(firstLine(absPath))) return null; // already declared, not applicable

  const content = readFileSync(absPath, 'utf8');

  const localFns = new Set();
  for (const m of content.matchAll(LOCAL_FN_DECL_RE)) {
    localFns.add(m[1] ?? m[2]);
  }
  if (localFns.size === 0) return null;

  const offenses = [];
  for (const m of content.matchAll(HANDLER_PROP_USE_RE)) {
    const [, propName, ident] = m;
    if (localFns.has(ident)) {
      offenses.push(`${propName}={${ident}}`);
    }
  }
  return offenses.length > 0 ? { relPath, offenses: [...new Set(offenses)] } : null;
}

const declared = new Set(CLIENT_ENTRY_POINTS.map(toPosix));
const missing = []; // has 'use client' but is not declared
const stale = []; // declared but missing, or no longer has 'use client'
const implicitClient = []; // no 'use client', but builds a handler locally and uses it in JSX

for (const absPath of findTsxFiles(COMPONENTS_DIR)) {
  const relPath = toPosix(relative(ROOT, absPath));
  const hasDirective = USE_CLIENT_RE.test(firstLine(absPath));

  if (hasDirective && !declared.has(relPath)) {
    missing.push(relPath);
  }

  const implicit = findImplicitClientHandlers(absPath, relPath);
  if (implicit) implicitClient.push(implicit);
}

for (const relPath of declared) {
  const absPath = join(ROOT, relPath);
  if (!existsSync(absPath)) {
    stale.push(`${relPath} (the file no longer exists)`);
    continue;
  }
  if (!USE_CLIENT_RE.test(firstLine(absPath))) {
    stale.push(`${relPath} (no longer has 'use client' on its first line)`);
  }
}

if (missing.length > 0 || stale.length > 0) {
  console.error(
    '✗ CLIENT_ENTRY_POINTS (scripts/client-entry-points.mjs) is out of sync with src/components/:\n',
  );

  if (missing.length > 0) {
    console.error(
      `  Have 'use client' but are NOT in CLIENT_ENTRY_POINTS (dist/ will lose the directive):`,
    );
    for (const p of missing) console.error(`    - ${p}`);
    console.error('');
  }

  if (stale.length > 0) {
    console.error(`  Are in CLIENT_ENTRY_POINTS but no longer belong there:`);
    for (const p of stale) console.error(`    - ${p}`);
    console.error('');
  }

  console.error('  Add or remove the matching entry in scripts/client-entry-points.mjs.');
  process.exit(1);
}

if (implicitClient.length > 0) {
  console.error(
    "✗ Component(s) without 'use client' that build a handler locally and pass it as a JSX prop (the pattern that broke Button, see CHANGELOG.md [0.4.3]):\n",
  );
  for (const { relPath, offenses } of implicitClient) {
    console.error(`    - ${relPath}  →  ${offenses.join(', ')}`);
  }
  console.error(
    '\n  Static heuristic, not perfect: it may be a genuine false positive (check by hand) or a\n' +
      "  component that really needs 'use client'. If the latter, add the directive and register\n" +
      '  it in scripts/client-entry-points.mjs; if it is a false positive, explain why in the PR\n' +
      '  instead of silencing it here.',
  );
  process.exit(1);
}

console.log(`✓ CLIENT_ENTRY_POINTS is in sync with src/components/ (${declared.size} components).`);
console.log(
  `✓ No server-safe component builds a local handler and passes it as a JSX prop (implicit handler heuristic).`,
);
