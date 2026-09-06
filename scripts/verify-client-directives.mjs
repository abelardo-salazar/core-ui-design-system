#!/usr/bin/env node
// Guardrail de build: evita que un componente con 'use client' en su fuente se publique
// sin la directiva en dist/ (pasó con Popover, Progress, Calendar, DatePicker, Chip e Image
// — ver CHANGELOG.md). El bug no era el build en sí, era que CLIENT_ENTRY_POINTS es una
// lista mantenida a mano que nadie actualizaba al agregar un componente nuevo. Este script
// no reemplaza esa lista, solo la valida contra la realidad de src/components/ en cada build.
//
// Falla (exit 1) si:
//   - un .tsx de src/components/ tiene 'use client' en su primera línea y no está en
//     CLIENT_ENTRY_POINTS (el caso que rompió producción).
//   - una entrada de CLIENT_ENTRY_POINTS ya no existe, o su archivo ya no tiene la
//     directiva (lista desactualizada en el otro sentido — no rompe el build hoy, pero es
//     la misma clase de desalineamiento silencioso).
//
// Modo `--post-build` (corre DESPUÉS de `vite build`, ver package.json): valida el artefacto
// real. Falla si el barrel raíz publicado (dist/index.js) arrastra recharts — directa o
// transitivamente por cualquier import relativo alcanzable. recharts (ResponsiveContainer.js)
// llama createContext(...) a nivel de módulo, lo cual explota en el entorno react-server de
// Next.js; dist/index.js es el único archivo que un consumidor real importa, así que debe
// quedar 100% libre de recharts. Chart vive ahora en el subpath ./charts (dist/charts.js),
// que es client-only completo y sí puede traer recharts. Ver CHANGELOG.md [0.4.1].
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

// --- Modo post-build: dist/index.js debe quedar libre de recharts ------------------------

if (process.argv.includes('--post-build')) {
  const BARREL = join(ROOT, 'dist/index.js');

  if (!existsSync(BARREL)) {
    console.error(`✗ ${toPosix(relative(ROOT, BARREL))} no existe — ¿corriste este check antes de \`vite build\`?`);
    process.exit(1);
  }

  // Todo `import ... from '<spec>'` / `export ... from '<spec>'` (y `import '<spec>'`) del chunk.
  const FROM_RE = /(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g;
  const RECHARTS_RE = /(^|\/)recharts(\/|$)/;

  const visited = new Set();
  const queue = [BARREL];
  const offenders = []; // { file, spec }

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

      if (RECHARTS_RE.test(spec)) {
        offenders.push({ file: toPosix(relative(ROOT, abs)), spec });
        continue;
      }
      // Seguir solo imports relativos que sigan dentro de dist/ (los bare specifiers
      // externalizados —react, @radix-ui/*— no son recharts y no hace falta abrirlos).
      if (spec.startsWith('.')) {
        const target = resolve(dirname(abs), spec);
        for (const cand of [target, `${target}.js`, join(target, 'index.js')]) {
          if (existsSync(cand) && statSync(cand).isFile()) {
            queue.push(cand);
            break;
          }
        }
      }
    }
  }

  if (offenders.length > 0) {
    console.error('✗ El barrel raíz publicado (dist/index.js) arrastra recharts y NO es seguro para Server Components:\n');
    for (const { file, spec } of offenders) {
      console.error(`    ${file}  →  import '${spec}'`);
    }
    console.error('\n  recharts solo puede vivir bajo el subpath ./charts (src/charts.ts → dist/charts.js).');
    console.error('  Revisá que src/index.ts no reexporte nada de src/components/Chart/ (ni transitivamente).');
    process.exit(1);
  }

  console.log(`✓ dist/index.js está libre de recharts (${visited.size} módulos del barrel inspeccionados).`);
  process.exit(0);
}

// --- Modo por defecto (pre-build): CLIENT_ENTRY_POINTS sincronizado con src/components/ --

function firstLine(absPath) {
  const content = readFileSync(absPath, 'utf8');
  return content.slice(0, content.indexOf('\n') === -1 ? content.length : content.indexOf('\n')).trim();
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

const declared = new Set(CLIENT_ENTRY_POINTS.map(toPosix));
const missing = []; // tiene 'use client' pero no está declarado
const stale = []; // declarado pero no existe, o ya no tiene 'use client'

for (const absPath of findTsxFiles(COMPONENTS_DIR)) {
  const relPath = toPosix(relative(ROOT, absPath));
  const hasDirective = USE_CLIENT_RE.test(firstLine(absPath));

  if (hasDirective && !declared.has(relPath)) {
    missing.push(relPath);
  }
}

for (const relPath of declared) {
  const absPath = join(ROOT, relPath);
  if (!existsSync(absPath)) {
    stale.push(`${relPath} (el archivo ya no existe)`);
    continue;
  }
  if (!USE_CLIENT_RE.test(firstLine(absPath))) {
    stale.push(`${relPath} (ya no tiene 'use client' en la primera línea)`);
  }
}

if (missing.length > 0 || stale.length > 0) {
  console.error('✗ CLIENT_ENTRY_POINTS (scripts/client-entry-points.mjs) está desalineado con src/components/:\n');

  if (missing.length > 0) {
    console.error(
      `  Tienen 'use client' pero NO están en CLIENT_ENTRY_POINTS (dist/ va a perder la directiva):`,
    );
    for (const p of missing) console.error(`    - ${p}`);
    console.error('');
  }

  if (stale.length > 0) {
    console.error(`  Están en CLIENT_ENTRY_POINTS pero ya no corresponde:`);
    for (const p of stale) console.error(`    - ${p}`);
    console.error('');
  }

  console.error('  Agregá/quitá la entrada correspondiente en scripts/client-entry-points.mjs.');
  process.exit(1);
}

console.log(`✓ CLIENT_ENTRY_POINTS está sincronizado con src/components/ (${declared.size} componentes).`);
