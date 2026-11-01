#!/usr/bin/env node
// Docs guardrail: keeps the parts of README.md that mirror the package in sync with their
// source of truth. Runs in the CI `verify` job (`npm run verify:readme`); no network.
//
// Fails (exit 1) if:
//   - the Version badge or the "Última versión publicada" line doesn't match
//     package.json#version;
//   - the first version heading of CHANGELOG.md is neither [Unreleased] nor
//     [<package.json#version>];
//   - the version line mentions unreleased changes and CHANGELOG.md doesn't open with
//     [Unreleased], or the other way around;
//   - the Server Components table (README § Setup) doesn't match the exported components:
//     one row per source file that exports components, listing exactly those components, with
//     "No" when the file is in CLIENT_ENTRY_POINTS and "Sí" otherwise. The ./charts subpath is
//     client-only as a whole, so it has a single row whose value follows src/charts.ts.
//
// Components are the PascalCase value exports reachable from src/index.ts, read with the
// TypeScript parser (no type checking): re-exports are followed through the component
// index.ts files down to the .tsx file that declares them.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { CLIENT_ENTRY_POINTS } from './client-entry-points.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const toRepoPath = (file) => relative(ROOT, file).replace(/\\/g, '/');

const TABLE_HEADING = '### Server Components';
const VERSION_LINE_RE = /^\*\*Última versión publicada:\*\* `([^`]+)`(.*)$/m;
const BADGE_RE = /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-([^)]+?)-[a-z]+\.svg\)/;
const UNRELEASED_LINK = './CHANGELOG.md#unreleased';
const USE_CLIENT_RE = /^['"]use client['"];?$/;

const { version } = JSON.parse(read('package.json'));
const readme = read('README.md');
const changelog = read('CHANGELOG.md');
const problems = [];

// --- Version ---------------------------------------------------------------------------

const badge = readme.match(BADGE_RE);
if (!badge) {
  problems.push('README.md: Version badge not found.');
} else if (badge[1] !== version) {
  problems.push(`README.md: Version badge says ${badge[1]}, package.json says ${version}.`);
}

const firstHeading = changelog.match(/^## \[([^\]]+)\]/m)?.[1];
const opensUnreleased = firstHeading === 'Unreleased';
if (!opensUnreleased && firstHeading !== version) {
  problems.push(
    `CHANGELOG.md: first heading is [${firstHeading ?? 'none'}], expected [Unreleased] or [${version}].`,
  );
}

const versionLine = readme.match(VERSION_LINE_RE);
if (!versionLine) {
  problems.push('README.md: "**Última versión publicada:** `X.Y.Z`" line not found.');
} else {
  if (versionLine[1] !== version) {
    problems.push(`README.md: version line says ${versionLine[1]}, package.json says ${version}.`);
  }
  const mentionsUnreleased = versionLine[2].includes(UNRELEASED_LINK);
  if (opensUnreleased && !mentionsUnreleased) {
    problems.push(
      `README.md: CHANGELOG.md opens with [Unreleased], but the version line doesn't link ${UNRELEASED_LINK}.`,
    );
  }
  if (!opensUnreleased && mentionsUnreleased) {
    problems.push(
      'README.md: the version line mentions unreleased changes, but CHANGELOG.md has no [Unreleased] entry.',
    );
  }
}

// --- Exported components ---------------------------------------------------------------

function resolveModule(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null; // external package
  const base = resolve(dirname(fromFile), specifier);
  return (
    [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')].find((p) =>
      existsSync(p),
    ) ?? null
  );
}

const hasExportModifier = (node) =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

const exportCache = new Map();

// Value exports of a module: Map<exported name, absolute path of the declaring file>.
function valueExports(file) {
  if (exportCache.has(file)) return exportCache.get(file);
  const exports = new Map();
  exportCache.set(file, exports);
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest);

  for (const node of source.statements) {
    if (ts.isExportDeclaration(node)) {
      if (node.isTypeOnly) continue;
      const target = node.moduleSpecifier && resolveModule(file, node.moduleSpecifier.text);
      if (node.moduleSpecifier && !target) continue; // re-export from an external package
      if (!node.exportClause) {
        for (const [name, from] of valueExports(target)) exports.set(name, from);
        continue;
      }
      if (!ts.isNamedExports(node.exportClause)) continue;
      for (const spec of node.exportClause.elements) {
        if (spec.isTypeOnly) continue;
        const local = (spec.propertyName ?? spec.name).text;
        exports.set(spec.name.text, target ? valueExports(target).get(local) : file);
      }
    } else if (hasExportModifier(node)) {
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) exports.set(decl.name.text, file);
        }
      } else if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
        exports.set(node.name.text, file);
      }
    }
  }
  return exports;
}

// Expected rows: source file -> component names it exports.
const componentsByFile = new Map();
for (const [name, file] of valueExports(join(ROOT, 'src/index.ts'))) {
  if (!file || !/^[A-Z]/.test(name) || !file.endsWith('.tsx')) continue;
  const key = toRepoPath(file);
  if (!componentsByFile.has(key)) componentsByFile.set(key, new Set());
  componentsByFile.get(key).add(name);
}
const clientEntryPoints = new Set(CLIENT_ENTRY_POINTS);
const chartsIsClient = USE_CLIENT_RE.test(read('src/charts.ts').split(/\r?\n/, 1)[0].trim());

// --- Server Components table -------------------------------------------------------------

const lines = readme.split(/\r?\n/);
const start = lines.indexOf(TABLE_HEADING);
const rows = [];
if (start === -1) {
  problems.push(`README.md: "${TABLE_HEADING}" section not found.`);
} else {
  for (let i = start + 1; i < lines.length && !/^#{2,3} /.test(lines[i]); i++) {
    const cells = lines[i]
      .match(/^\|(.+)\|$/)?.[1]
      .split('|')
      .map((c) => c.trim());
    if (!cells || cells.length < 2 || /^:?-+/.test(cells[0]) || !cells[0].includes('`')) {
      continue;
    }
    rows.push({
      line: i + 1,
      charts: cells[0].includes('`/charts`'),
      names: [...cells[0].matchAll(/`([A-Za-z]\w*)`/g)].map((m) => m[1]),
      value: cells[1],
    });
  }
  if (rows.length === 0) problems.push(`README.md: no rows under "${TABLE_HEADING}".`);
}

const expectedValue = (isClient) => (isClient ? 'No' : 'Sí');
const rowByName = new Map();
for (const row of rows.filter((r) => !r.charts)) {
  for (const name of row.names) {
    if (rowByName.has(name)) {
      problems.push(`README.md:${row.line}: \`${name}\` is listed in more than one row.`);
    }
    rowByName.set(name, row);
  }
}

const exportedNames = new Set();
for (const [file, names] of componentsByFile) {
  const expected = expectedValue(clientEntryPoints.has(file));
  const label = [...names].map((n) => `\`${n}\``).join(', ');
  for (const name of names) exportedNames.add(name);
  const matched = new Set([...names].map((n) => rowByName.get(n)).filter(Boolean));
  if (matched.size === 0) {
    problems.push(`README.md: no Server Components row for ${label} (${file}).`);
    continue;
  }
  if (matched.size > 1) {
    problems.push(`README.md: ${label} (${file}) is split across rows; use one row per file.`);
    continue;
  }
  const [row] = matched;
  const missing = [...names].filter((n) => !row.names.includes(n));
  if (missing.length > 0) {
    problems.push(
      `README.md:${row.line}: row is missing ${missing.map((n) => `\`${n}\``).join(', ')} (${file}).`,
    );
  }
  if (row.value !== expected) {
    problems.push(
      `README.md:${row.line}: ${label} says "${row.value}", expected "${expected}" (${file} ${
        expected === 'No' ? 'is' : 'is not'
      } in CLIENT_ENTRY_POINTS).`,
    );
  }
}
for (const [name, row] of rowByName) {
  if (!exportedNames.has(name)) {
    problems.push(
      `README.md:${row.line}: \`${name}\` is not a component exported from src/index.ts.`,
    );
  }
}

const chartsRows = rows.filter((r) => r.charts);
if (chartsRows.length !== 1) {
  problems.push(
    `README.md: expected one Server Components row for \`/charts\`, found ${chartsRows.length}.`,
  );
} else if (chartsRows[0].value !== expectedValue(chartsIsClient)) {
  problems.push(
    `README.md:${chartsRows[0].line}: \`/charts\` says "${chartsRows[0].value}", expected "${expectedValue(chartsIsClient)}" (src/charts.ts ${
      chartsIsClient ? 'starts' : 'does not start'
    } with 'use client').`,
  );
}

if (problems.length > 0) {
  console.error(`✗ README.md out of sync:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}

console.log(
  `✓ README.md in sync: version ${version}, ${componentsByFile.size} component files and /charts in the Server Components table.`,
);
