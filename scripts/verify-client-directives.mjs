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
// que es client-only completo y sí puede traer recharts. Ver CHANGELOG.md [0.4.1]. También
// valida dist/locale.js (subpath ./locale): no puede alcanzar ni el barrel ni recharts.
//
// Chequeo adicional del modo por defecto (heurística estática, ver más abajo): detecta un
// componente sin 'use client' que declara una función localmente y la usa como handler JSX
// (onClick={handleX}) — el patrón que rompió Button (handleClick se arma siempre dentro del
// branch asChild y se cuelga de onClick={handleClick} sobre Slot; ninguna combinación de
// props lo evita). Ver CHANGELOG.md [0.4.3].
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

// --- Modo post-build: lo que cada entry publicado puede alcanzar --------------------------
//
// dist/index.js no puede alcanzar recharts (ver cabecera). dist/locale.js (subpath ./locale,
// src/locale.ts) es datos puros y server-safe: no puede alcanzar recharts ni el barrel raíz —
// si lo hiciera, importar un locale arrastraría el DS entero y su frontera 'use client'.

if (process.argv.includes('--post-build')) {
  // Todo `import ... from '<spec>'` / `export ... from '<spec>'` (y `import '<spec>'`) del chunk.
  const FROM_RE = /(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]/g;
  const RECHARTS_RE = /(^|\/)recharts(\/|$)/;
  const BARREL = join(ROOT, 'dist/index.js');

  // Recorre el grafo de imports relativos desde `entry` (los bare specifiers externalizados
  // —react, @radix-ui/*— no se abren). Devuelve los archivos visitados y los imports que
  // violan alguna regla: `{ file, spec, reason }`.
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
                offenders.push({ file, spec, reason: 'barrel raíz (dist/index.js)' });
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
      ok: 'está libre de recharts',
      fail: 'El barrel raíz publicado (dist/index.js) arrastra recharts y NO es seguro para Server Components',
      hint:
        '  recharts solo puede vivir bajo el subpath ./charts (src/charts.ts → dist/charts.js).\n' +
        '  Revisa que src/index.ts no reexporte nada de src/components/Chart/ (ni transitivamente).',
    },
    {
      entry: 'dist/locale.js',
      forbidBarrel: true,
      ok: 'no alcanza ni el barrel raíz ni recharts',
      fail: 'El subpath ./locale (dist/locale.js) alcanza módulos que no le corresponden',
      hint: '  src/locale.ts solo puede reexportar locales de DayPicker: nada del barrel ni de components/.',
    },
  ];

  let failed = false;
  for (const { entry, forbidBarrel, ok, fail, hint } of CHECKS) {
    const abs = join(ROOT, entry);
    if (!existsSync(abs)) {
      console.error(`✗ ${entry} no existe — ¿corriste este check antes de \`vite build\`?`);
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
    console.log(`✓ ${entry} ${ok} (${visited.size} módulos inspeccionados).`);
  }
  process.exit(failed ? 1 : 0);
}

// --- Modo por defecto (pre-build): CLIENT_ENTRY_POINTS sincronizado con src/components/ --

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

// Detecta `const NOMBRE = (...) => {...}` / `const NOMBRE = function(...) {...}` y
// `function NOMBRE(...) {...}` declarados a nivel de archivo (no importa si están dentro del
// cuerpo del componente, solo que el identificador se declare con `const`/`function`, no que
// venga desdestructurado de props). Deliberadamente NO cubre wrappers como
// `useCallback(...)`/`useMemo(...)` — la heurística es la que pide la tarea, no más: ver
// comentario de cabecera. Falsos negativos ahí quedan para juicio humano.
const LOCAL_FN_DECL_RE =
  /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?\(|\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g;

// `onClick={handleClick}`, `onKeyDown={onKeyDown}`, etc. Solo identificadores simples entre
// llaves — `onClick={() => ...}` o `onClick={props.onClick}` no matchean, a propósito: el
// caso que nos interesa es un identificador que además aparece en LOCAL_FN_DECL_RE.
const HANDLER_PROP_USE_RE = /\b(on[A-Z]\w*)\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g;

// Los .stories.tsx nunca se publican en dist/ (son fixtures de Storybook/vitest-browser) y
// usan libremente `const x = () => {...}` dentro de sus play(), sin relación con RSC — se
// excluyen para no generar ruido ajeno al propósito del check.
const STORY_FILE_RE = /\.stories\.tsx$/;

function findImplicitClientHandlers(absPath, relPath) {
  if (STORY_FILE_RE.test(relPath)) return null;
  if (USE_CLIENT_RE.test(firstLine(absPath))) return null; // ya declarado, no aplica

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
const missing = []; // tiene 'use client' pero no está declarado
const stale = []; // declarado pero no existe, o ya no tiene 'use client'
const implicitClient = []; // sin 'use client', pero arma un handler localmente y lo usa en JSX

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
    stale.push(`${relPath} (el archivo ya no existe)`);
    continue;
  }
  if (!USE_CLIENT_RE.test(firstLine(absPath))) {
    stale.push(`${relPath} (ya no tiene 'use client' en la primera línea)`);
  }
}

if (missing.length > 0 || stale.length > 0) {
  console.error(
    '✗ CLIENT_ENTRY_POINTS (scripts/client-entry-points.mjs) está desalineado con src/components/:\n',
  );

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

if (implicitClient.length > 0) {
  console.error(
    "✗ Componente(s) sin 'use client' que arman un handler localmente y lo usan como prop JSX (patrón que rompió Button — ver CHANGELOG.md [0.4.3]):\n",
  );
  for (const { relPath, offenses } of implicitClient) {
    console.error(`    - ${relPath}  →  ${offenses.join(', ')}`);
  }
  console.error(
    '\n  Heurística estática, no perfecta: puede ser un falso positivo legítimo (revisar a mano) o un\n' +
      "  componente que de verdad necesita 'use client'. Si es lo segundo, agregá la directiva y\n" +
      '  registralo en scripts/client-entry-points.mjs; si es un falso positivo, dejá constancia de\n' +
      '  por qué en el PR en vez de silenciarlo acá.',
  );
  process.exit(1);
}

console.log(
  `✓ CLIENT_ENTRY_POINTS está sincronizado con src/components/ (${declared.size} componentes).`,
);
console.log(
  `✓ Ningún componente server-safe arma un handler local y lo usa como prop JSX (heurística de handlers implícitos).`,
);
