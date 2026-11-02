// Third-party notices for the packages that preserveModules copies into dist/node_modules and for
// the font packages whose files the build copies into dist/fonts/ (see scripts/fonts.mjs).
//
// MIT, ISC, Apache-2.0 and the Ubuntu Font Licence only allow redistribution if the copyright and
// licence notice travel with the files. Bundled files are copied without their LICENSE, so the build emits
// dist/THIRD-PARTY-NOTICES.txt with each package's name, version, declared license and the
// verbatim contents of its LICENSE/LICENCE/COPYING/NOTICE files.
//
// Used by the `third-party-notices` plugin in vite.config.ts (generation, from the bundle's
// module ids and src/fonts.css) and by scripts/verify-third-party-notices.mjs (guardrail, from the
// files actually on disk in dist/node_modules and dist/fonts). Both share packageRoot() so they agree on what a
// package is, but they take the package list from different sources.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const NOTICES_FILE = 'THIRD-PARTY-NOTICES.txt';

const LICENSE_FILE_RE = /^(licen[cs]e|copying|notice)(\.[a-z]+)?$/i;
const RULE = '='.repeat(80);
const THIN_RULE = '-'.repeat(80);

// Directory of the package that owns `file`, up to its last node_modules/<name> (or
// node_modules/@scope/<name>) segment, so nested node_modules resolve to the inner package.
// Accepts Rollup module ids: strips the \0 prefix and the ?query of virtual modules.
// Returns null for files outside node_modules.
export function packageRoot(file) {
  const path = file.replace(/^\0/, '').replace(/\?.*$/, '').replace(/\\/g, '/');
  const matches = [...path.matchAll(/node_modules\/(?:@[^/]+\/)?[^/]+/g)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  return path.slice(0, last.index + last[0].length);
}

function readPackage(dir) {
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const licenseFiles = readdirSync(dir)
    .filter((name) => LICENSE_FILE_RE.test(name))
    .sort();
  return { dir, manifest, licenseFiles };
}

function personName(person) {
  return typeof person === 'string' ? person : person?.name;
}

function repositoryUrl(repository) {
  return typeof repository === 'string' ? repository : repository?.url;
}

function renderPackage({ dir, manifest, licenseFiles }) {
  const lines = [
    RULE,
    `Package: ${manifest.name}@${manifest.version}`,
    `License: ${manifest.license ?? 'not declared'}`,
  ];
  const author = personName(manifest.author);
  if (author) lines.push(`Author: ${author}`);
  const repository = repositoryUrl(manifest.repository);
  if (repository) lines.push(`Repository: ${repository}`);
  lines.push(THIN_RULE);

  if (licenseFiles.length === 0) {
    lines.push(
      'The package ships no license file. License, author and repository above are the ones',
      'declared in its package.json.',
    );
  }
  for (const name of licenseFiles) {
    if (licenseFiles.length > 1) lines.push(`[${name}]`);
    lines.push(readFileSync(join(dir, name), 'utf8').trim(), '');
  }
  return lines.join('\n').trimEnd();
}

// Renders the notices file for the given package directories (absolute paths).
export function renderNotices(packageDirs) {
  const packages = [...new Set(packageDirs)]
    .filter((dir) => existsSync(join(dir, 'package.json')))
    .map(readPackage)
    .sort((a, b) =>
      `${a.manifest.name}@${a.manifest.version}`.localeCompare(
        `${b.manifest.name}@${b.manifest.version}`,
        'en',
      ),
    );

  const header = [
    'Third-party notices',
    '',
    'This package redistributes, under dist/node_modules, code from third-party packages and,',
    'under dist/fonts, font files from third-party packages. They are listed below. Each entry',
    'reproduces the license and copyright notice of that package.',
  ].join('\n');

  return [header, ...packages.map(renderPackage), RULE, ''].join('\n\n');
}
