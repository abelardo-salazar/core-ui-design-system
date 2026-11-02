#!/usr/bin/env node
// Build guardrail: every package that preserveModules copied into dist/node_modules, and every
// package whose font files the build copied into dist/fonts, must appear in
// dist/THIRD-PARTY-NOTICES.txt. Runs after `vite build` (see package.json).
//
// The package list comes from the files actually on disk in dist/node_modules, not from
// package.json nor from the bundle the plugin saw: a package that lands in dist/ by any route
// (a new transitive dependency, a change in Rollup's output) is caught here. dist/node_modules
// mirrors the repo's node_modules paths, so each package's version is read from there. The
// files of dist/fonts don't keep their path: each one is traced back, by file name, to the
// url() of src/fonts.css that points at it, and from there to its package in node_modules.
//
// Fails (exit 1) if:
//   - dist/THIRD-PARTY-NOTICES.txt doesn't exist;
//   - a package of dist/node_modules has no matching package.json in node_modules;
//   - a package of dist/node_modules has no `Package: <name>@<version>` entry;
//   - a file of dist/fonts isn't referenced by src/fonts.css or doesn't come from a package;
//   - the package of a file of dist/fonts has no `Package: <name>@<version>` entry.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FONTS_DIR, fontSourceFiles } from './fonts.mjs';
import { NOTICES_FILE, packageRoot } from './third-party-notices.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const DIST_NODE_MODULES = join(DIST, 'node_modules');
const DIST_FONTS = join(DIST, FONTS_DIR);
const NOTICES_PATH = join(DIST, NOTICES_FILE);

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

if (!existsSync(NOTICES_PATH)) {
  console.error(`✗ dist/${NOTICES_FILE} is missing. Did the third-party-notices plugin run?`);
  process.exit(1);
}

// Package paths relative to dist/ (node_modules/<name>, node_modules/@scope/<name>, nested).
const packagePaths = existsSync(DIST_NODE_MODULES)
  ? [
      ...new Set(
        listFiles(DIST_NODE_MODULES).map((file) =>
          packageRoot(relative(DIST, file).replace(/\\/g, '/')),
        ),
      ),
    ].sort()
  : [];

const listed = new Set(
  [...readFileSync(NOTICES_PATH, 'utf8').matchAll(/^Package: (.+)$/gm)].map((m) => m[1]),
);

const problems = [];

// Font files: dist/fonts/<file> -> the url() of src/fonts.css with that file name -> its package,
// as a path relative to the repo root (node_modules/<name>), the same shape as packagePaths.
const fontSources = new Map(fontSourceFiles(ROOT).map((file) => [basename(file), file]));
const fontFiles = existsSync(DIST_FONTS) ? listFiles(DIST_FONTS) : [];
const fontPackagePaths = new Set();
for (const file of fontFiles) {
  const name = relative(DIST, file).replace(/\\/g, '/');
  const source = fontSources.get(basename(file));
  const dir = source && packageRoot(relative(ROOT, source));
  if (!source) problems.push(`${name}: not referenced by src/fonts.css`);
  else if (!dir) problems.push(`${name}: ${relative(ROOT, source)} doesn't come from a package`);
  else fontPackagePaths.add(dir);
}

for (const packagePath of [...packagePaths, ...[...fontPackagePaths].sort()]) {
  const manifestPath = join(ROOT, packagePath, 'package.json');
  if (!existsSync(manifestPath)) {
    problems.push(`${packagePath}: no package.json at ${packagePath}/package.json`);
    continue;
  }
  const { name, version } = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!listed.has(`${name}@${version}`)) {
    problems.push(`${packagePath}: ${name}@${version} is not in dist/${NOTICES_FILE}`);
  }
}

if (problems.length > 0) {
  console.error(`✗ Third-party notices incomplete:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}

console.log(
  `✓ dist/${NOTICES_FILE} covers the ${packagePaths.length} packages in dist/node_modules ` +
    `and the ${fontPackagePaths.size} font packages of the ${fontFiles.length} files in dist/fonts.`,
);
