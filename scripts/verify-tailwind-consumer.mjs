#!/usr/bin/env node
// Guardrail de empaquetado: compila el paquete publicado como lo haría un consumidor con
// Tailwind v4 que importa `./tailwind.css` (una sola compilación, la suya). Corre después del
// build, sobre el tarball real de `npm pack`.
//
// Por qué existe: style.css ya compilado + el Tailwind del consumidor son dos compilaciones que
// el bundler (Next) fusiona en las mismas capas. Una utilidad base que el consumidor vuelve a
// emitir queda después de la responsive del DS y la pisa (Container `px-4 md:px-8`), y las
// clases de tokens que solo usa el consumidor (`bg-primary/5`) no se generan.
//
// Sin red: no instala desde ningún registro. Arma el consumidor a mano en un directorio
// temporal fuera del repo (para que la resolución de módulos no suba al node_modules
// principal): extrae el tarball, copia `tailwindcss` (dependencia propia del consumidor) y,
// por cada `@plugin` del tailwind.css publicado, copia ese paquete solo si el manifiesto
// empaquetado lo declara en `dependencies` — lo que npm le instalaría al consumidor. Un plugin
// que sea devDependency falla acá igual que en el consumidor ("Can't resolve ...").
//
// Falla (exit 1) si la compilación falla o si en el CSS resultante:
//   - `md:px-8` no queda después de `px-4` (orden de capas roto);
//   - no se genera `bg-primary/5`, clase de token con opacidad que solo usa el fixture;
//   - hay más de un preflight;
//   - aparece googleapis (la fuente la carga el consumidor);
//   - no se genera `sm:text-left`, clase que solo existe en el JS de dist/components (el
//     @source del paquete no escanea dist);
//   - pesa más que el style.css publicado (los dos minificados). style.css trae lo mismo más
//     las clases de stories y docs (escanea el repo entero) y el @import de la fuente; con
//     tailwindcss 4.3.3 el consumidor queda ~6,8 KB por debajo. Escanear dist/node_modules
//     (dependencias empaquetadas por preserveModules) mete ~94 utilidades basura, ~13 KB
//     minificadas, y lo deja ~6,5 KB por encima. Techo relativo: crece con el DS.
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
// Selector de una clase en el CSS compilado: escapa ':' y '/' como lo hace Tailwind y no
// matchea dentro de otro selector (`.px-4` no debe encontrar `.md\:px-4`).
const selector = (className) =>
  new RegExp(`(?<![\\w\\\\:/-])\\.${className.replace(/[:/]/g, (c) => `\\\\\\${c}`)}(?=[\\s,{])`);

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'tw-consumer-'));
const failures = [];

try {
  // 1. Tarball real, con los mismos `files` y `exports` que se publican.
  const [{ filename }] = JSON.parse(
    execSync(`npm pack --json --ignore-scripts --pack-destination "${work}"`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    }),
  );

  // 2. Consumidor fixture. tar con rutas relativas (cwd = work): GNU tar interpreta "C:" de
  // una ruta absoluta de Windows como host remoto.
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
      `el paquete no publica ./tailwind.css (exports["./tailwind.css"] = ${JSON.stringify(exported)})`,
    );
  }
  for (const [, name] of readFileSync(exportedFile, 'utf8').matchAll(
    /@plugin\s+["']([^"']+)["']/g,
  )) {
    if (!packed.dependencies?.[name]) {
      throw new Error(
        `tailwind.css usa @plugin "${name}", pero no está en dependencies: el consumidor no lo tendría instalado`,
      );
    }
    copyPackage(name);
  }

  writeFileSync(
    join(fixture, 'input.css'),
    `@import 'tailwindcss';\n@import '${pkg.name}/tailwind.css';\n`,
  );
  // px-4 sin md:px-8: el consumidor emite la utilidad base por su cuenta, el caso que en dos
  // compilaciones pisaba a la responsive del DS.
  writeFileSync(
    join(fixture, 'page.html'),
    '<main class="px-4"><div class="bg-primary/5">consumidor</div></main>\n',
  );

  // 3. Una sola compilación, la del consumidor.
  const output = join(fixture, 'output.css');
  // --minify: mismo formato que style.css, para comparar tamaños.
  execFileSync(process.execPath, [CLI, '-i', 'input.css', '-o', 'output.css', '--minify'], {
    cwd: fixture,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  const css = readFileSync(output, 'utf8');

  // 4. Aserciones sobre el CSS resultante.
  const at = (className) => css.search(selector(className));
  const base = at('px-4');
  const responsive = at('md:px-8');
  if (base === -1 || responsive === -1 || responsive < base) {
    failures.push(
      `md:px-8 debe quedar después de px-4 (px-4 en ${base}, md:px-8 en ${responsive})`,
    );
  }
  if (at('bg-primary/5') === -1) {
    failures.push('no se generó bg-primary/5 (clase de token usada solo por el consumidor)');
  }
  const preflights =
    css.match(/::file-selector-button\s*\{\s*box-sizing:\s*border-box;/g)?.length ?? 0;
  if (preflights !== 1) failures.push(`se esperaba 1 preflight, hay ${preflights}`);
  if (css.includes('googleapis')) failures.push('el CSS importa Google Fonts');
  if (at('sm:text-left') === -1) {
    failures.push('no se generó sm:text-left: el @source del paquete no escanea dist/components');
  }
  const bytes = Buffer.byteLength(css);
  const styleBytes = Buffer.byteLength(
    readFileSync(join(installed, packed.exports['./style.css']), 'utf8'),
  );
  if (bytes > styleBytes) {
    failures.push(
      `el CSS pesa ${bytes} bytes, más que style.css (${styleBytes}): ` +
        '¿el @source escanea dist/node_modules?',
    );
  }
  console.log(`CSS del consumidor: ${bytes} bytes (style.css: ${styleBytes})`);
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
console.log('✓ verify-tailwind-consumer: una sola compilación, orden de capas y clases correctos');
