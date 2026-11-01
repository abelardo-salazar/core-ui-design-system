# Design System — Notas de arquitectura

Este documento reúne decisiones y mecanismos internos del design system que no son parte de la guía de uso para consumidores (esa vive en [README.md](./README.md)). Es referencia para quienes mantienen el paquete, no para quienes solo lo consumen.

## Theming: tokens y CSS Cascade Layers

### Dónde viven los tokens

Los tokens semánticos de color y radio (`--primary`, `--base-100`, `--error-focus`, etc.) están definidos en `src/tailwind.css` (ver [más abajo](#srctailwindcss-fuente-única-de-tokens-y-capas-base)), dentro de:

- `@layer base { :root {...} }` — valores por defecto (tema claro).
- `@layer base { :root:has(.dark), .dark {...} }` — overrides de tema oscuro.

El orden real de capas en `style.css` compilado (Tailwind v4) es el siguiente; con `./tailwind.css` lo fija la compilación del consumidor:

```
components < properties < theme < base < utilities
```

Los tokens semánticos viven en `base`. Las utilidades de color (`bg-primary`, `text-primary-content`, etc.) se generan en `@theme` apuntando a estos tokens vía `var(...)` (ver el bloque `@theme` de `src/tailwind.css`), y a su vez cada token semántico apunta a un token `--palette-*` (`--primary: var(--palette-navy)`). Esa indirección es implementación interna: **`--palette-*` no es la superficie pública de override** — ver [README § Theming](./README.md#-4-theming-custom-properties) para la lista de tokens que sí lo son.

### Por qué el override recomendado es "CSS sin capa"

El mecanismo de override documentado para consumidores (CSS fuera de cualquier `@layer`, apuntando a `:root`/`.dark`) no es una convención arbitraria: es la única forma que, por especificación de CSS Cascade Layers, gana sobre cualquier `@layer` **sin importar el orden de import** entre la hoja de estilos del consumidor y la del paquete. Cualquier otra forma de override queda sujeta al orden de import entre ambas hojas.

Esto se verificó empíricamente (no solo por lectura de la spec) con Chromium real (Playwright) contra Storybook sirviendo el CSS compilado real del paquete, con `getComputedStyle` sobre un elemento con `background-color: var(--primary)`:

| Escenario                                                            | Resultado                                                |
| -------------------------------------------------------------------- | -------------------------------------------------------- |
| Override sin capa, insertado _antes_ del CSS del paquete en `<head>` | **Gana** (`#302b6e` → `#ff00ff`)                         |
| Override en `@layer base`, importado _después_ del CSS del paquete   | **Gana** (`#302b6e` → `#00ff00`)                         |
| Override en `@layer base`, importado _antes_ del CSS del paquete     | **No gana** — queda en `#302b6e`, el default del paquete |
| `:root {}` / `.dark {}` sin capa, alternando la clase `.dark`        | Cambia correctamente en ambos temas                      |

Los cuatro resultados coincidieron exactamente con lo que predice la teoría de CSS Cascade Layers (ninguna sorpresa que documentar como excepción). El riesgo del segundo/tercer escenario es real y concreto: si un consumidor que también usa Tailwind pone su override dentro de su propio `@layer base` (siguiendo la convención de customización de tema de Tailwind), la capa `base` termina compartida por nombre entre ambas hojas, y el desempate pasa a ser el orden normal de cascada (última declaración en el documento gana) — ya no aplica la prioridad especial de "sin capa". Un reorden de imports, o un bump de dependencia que cambia cuándo se inyecta su CSS, puede invertir silenciosamente cuál de las dos gana.

Por eso el override sin capa es el único patrón que se documenta como soportado — ver el bloque copy-paste y la lista completa de tokens en [README § Theming](./README.md#-4-theming-custom-properties).

## Hojas de estilos: `style.css` y `tailwind.css`

Qué hoja importar según el proyecto está en [README § Setup Inicial](./README.md#️-3-setup-inicial). Aquí va el porqué.

### `src/tailwind.css`: fuente única de tokens y capas base

`src/tailwind.css` contiene, en este orden:

- `@source "./"` y `@source not "./node_modules"` (ver abajo).
- `@plugin "tailwindcss-animate"`.
- `@theme { ... }`: la fuente (`--font-sans`), los colores (`--color-*: var(--token)`) y los radios.
- `@layer base { ... }`: los tokens `--palette-*` y los semánticos, tema claro y oscuro.
- `@layer base { ... }`: `--tw-ring-offset-color` para todo el DS y los estilos de `html` y `body`.

No contiene `@import 'tailwindcss'` ni la fuente. La importan dos lugares:

- **`src/index.css`**: fuente de Google Fonts + `@import 'tailwindcss'` + `@import './tailwind.css'`. De ahí salen `style.css` (`vite build`) y los estilos de Storybook (`.storybook/preview.ts`).
- **El paquete publicado**: el plugin `copyTailwindSource` de `vite.config.ts` copia el archivo sin compilar a `dist/tailwind.css` (`exports["./tailwind.css"]`), y lo compila el Tailwind del consumidor.

**Los `@source`** son relativos al propio archivo, así que en `dist/` escanean el JS publicado. Hacen falta porque la detección automática de Tailwind ignora `node_modules`: sin ellos, el consumidor no generaría las clases que solo existen en el JS del paquete (por ejemplo `sm:text-left`, de `SheetHeader`).

**`@source not "./node_modules"`**: `dist/node_modules` contiene las dependencias que `preserveModules` empaqueta (`d3-*`, `@reduxjs`, `@radix-ui`…). No tienen clases del DS, y escanearlas mete unas 94 utilidades de sobra, unos 13 KB minificados. `@source not` existe desde Tailwind 4.1, y de ahí viene el peer `tailwindcss >=4.1`.

**`tailwindcss-animate` está en `dependencies`**: el `@plugin` se resuelve desde `dist/`, dentro del `node_modules` del consumidor. Como devDependency, el consumidor falla con `Can't resolve 'tailwindcss-animate'`.

**En el repo, los `@source` no agregan nada**: `vite build` ya escanea todo el repo salvo lo ignorado por git, docs y scripts incluidos. Por eso `style.css` también genera clases que solo aparecen en la documentación, como el `bg-primary/5` del CHANGELOG. Limitar el escaneo a `src/` quitaría de `style.css` reglas que hoy salen de esos archivos (`ring-offset-2`, `pl-10`, `mx-3`…). Si se quiere, es un cambio aparte; no es un efecto de `tailwind.css`.

### Orden de utilidades entre dos compilaciones

`style.css` sale ya compilado. Un consumidor con su propio Tailwind que además lo importa termina con dos compilaciones. Las dos declaran las mismas capas con nombre (`base`, `utilities`…), y el navegador fusiona las capas que tienen el mismo nombre aunque vengan de hojas distintas. El caso se observó en Next.

Dentro de una capa, con la misma especificidad, gana la última regla. Una utilidad responsive es una clase dentro de un `@media`, así que tiene la misma especificidad que la utilidad base. Ejemplo con `Container`, que usa `px-4 md:px-8`:

1. `style.css` emite `.px-4` y, después, `.md\:px-8`.
2. El consumidor usa `px-4` en su código, así que su compilación vuelve a emitir `.px-4`, más abajo en la capa `utilities`.
3. A partir de `md`, el `.px-4` del consumidor pisa al `.md\:px-8` del DS y el padding no crece.

Pasa lo mismo con `lg:text-5xl` de `Heading`, con `sm:text-left` de `SheetHeader` y con cualquier utilidad base que el consumidor también use. **Cambiar el orden de los imports solo traslada el problema**: con `style.css` al final, sus utilidades base pisan a las responsive del consumidor. Las variantes con pseudo-clase (`hover:`, `disabled:`) no se ven afectadas, porque `.hover\:bg-x:hover` tiene más especificidad que `.bg-x`.

Hay además un segundo síntoma: la compilación del DS no conoce las clases del consumidor, y la del consumidor no conoce los tokens del DS. Por eso clases como `bg-primary/5` no se generan en ninguna de las dos.

`./tailwind.css` lo resuelve con una sola compilación: el Tailwind del consumidor genera cada utilidad una vez, en el orden correcto, y conoce los tokens. `style.css` queda para consumidores sin Tailwind.

**La guardia** (`scripts/verify-tailwind-consumer.mjs`, paso `verify:tailwind-consumer` del CI) lo verifica contra el paquete real:

1. Hace `npm pack`.
2. Arma un consumidor sin red, en un directorio temporal fuera del repo: extrae el tarball y copia `tailwindcss` y cada paquete de `@plugin` que el manifiesto empaquetado declara en `dependencies`.
3. Compila con `@tailwindcss/cli` un `@import 'tailwindcss'` más el de `./tailwind.css`.

Falla si:

- `md:px-8` no queda después de `px-4`;
- no se genera `bg-primary/5`, que solo usa el fixture;
- no se genera `sm:text-left`, que solo existe en el JS de `dist/components`;
- hay más de un preflight;
- aparece `googleapis`;
- el CSS pesa más que `style.css`, la señal de que se escaneó `dist/node_modules`;
- un `@plugin` no está en `dependencies`.

**Por qué `./tailwind.css` no trae la fuente**: así el consumidor elige cómo cargarla (con `next/font` se autoaloja) y la guardia no depende de la red.

## Versiones y tags

### Versionado

Una versión sin publicar acumula todos los PRs en una sola entrada del CHANGELOG, sin bumps intermedios. Antes de publicar, la entrada se reescribe con el **delta neto** contra la última versión publicada: solo lo que cambia para quien actualiza desde ella. No se narran regresiones que aparecieron y se arreglaron dentro de la misma versión; "Fixed" lista solo bugs que existían en la versión publicada anterior, y los cambios incompatibles van en "Changed" con su migración. En 0.x: minor para funcionalidad o cambios visuales, patch para fixes.

### Tags

Se publica empujando un tag. El flujo:

1. **PR de release:** sube `version` en `package.json` y `package-lock.json`, cierra la entrada del CHANGELOG (de `[Unreleased]` a `[X.Y.Z] - <fecha>`, con el delta neto) y actualiza el badge y la línea de versión del README. `verify:readme` comprueba que coincidan.
2. **Merge** del PR a `main`.
3. **Tag anotado** `vX.Y.Z` sobre el commit del merge: `git tag -a vX.Y.Z -m "vX.Y.Z" <commit>`.
4. **Push del tag:** `git push origin vX.Y.Z`.
5. **El workflow `release.yml` publica.** Falla sin publicar si el tag no es `v` + `package.json#version`, si su commit no está en `main` o si esa versión ya está en el registro. Si no falla, corre la misma verificación que `ci.yml` y publica en GitHub Packages con `GITHUB_TOKEN`.

Razón: el tag define lo que se publica. Antes se publicaba a mano con `npm publish` desde una máquina local y el tag se ponía después, reconstruyendo qué commit se había publicado. Ahora el paquete sale del commit con tag, verificado en CI, y no hay nada que reconstruir.

Un tag que falló no se mueve para reintentar: se corrige en un PR, se sube la versión si el error ya estaba en el commit con tag y se empuja un tag nuevo. Si la falla fue externa (el registro, la red), se vuelve a correr el workflow.

**Nota histórica:** antes de este flujo, los tags se ubicaban con el `gitHead` del paquete publicado (`npm view …@X.Y.Z gitHead`). GitHub Packages no lo expone (devuelve vacío), así que los tags anteriores se ubicaron por la hora de publicación que registra el registro. Está verificado para 0.6.0 y 0.7.0. `v0.4.1` y `v0.4.2` son tags ligeros (no anotados), creados antes de la convención de tags anotados, y se dejan así. Las versiones anteriores a 0.4.1 no tienen tag.

## Decisiones

Cada decisión con su razón. Las listas concretas (qué paquete es peer, qué componente es cliente) viven en `package.json` y `scripts/client-entry-points.mjs`; aquí va el criterio.

### Peer o dependency

Un paquete va en `peerDependencies` si trae `'use client'` propio o si puede duplicar instancias: contextos de React, primitivas de Radix con estado, Sonner, TanStack Table, cmdk. Va en `dependencies` si no trae directiva ni estado compartido. El criterio se aplica a la versión que se empaqueta, la del lockfile en el momento del build, y se re-verifica cada vez que esa versión cambia.

Razón: con `preserveModules`, Rollup pierde las directivas de los chunks que no son entry, así que un paquete cliente empaquetado en `dist/node_modules` llega al consumidor sin su `'use client'`. Y una instancia duplicada (la empaquetada más la del consumidor) rompe los contextos: el provider de una copia no lo ve el consumidor de la otra.

`tailwindcss-animate` está en `dependencies` por otro motivo: ver [`src/tailwind.css`](#srctailwindcss-fuente-única-de-tokens-y-capas-base).

### Solo ESM

El paquete sale solo en ESM, sin UMD: `preserveModules` emite un archivo por módulo, incompatible con un bundle único.

### Subpaths `./charts` y `./locale`

Chart vive en `./charts`, no en el barrel raíz: un re-export puro se pliega al barrel raíz y arrastra recharts, cuyo `createContext` a nivel de módulo rompe en RSC. `./locale` son datos server-safe (locales de DayPicker); como entry propio, solo se empaqueta lo que el consumidor importa. El modo `--post-build` de `verify-client-directives.mjs` verifica los dos límites (ver [abajo](#componentes-server-y-client)).

### Componentes server y client

Un componente es server-safe por defecto. Si usa hooks, construye handlers propios o depende de un paquete cliente, declara `'use client'` y se registra en `scripts/client-entry-points.mjs`. Es la lista única que usan `vite.config.ts` (para reinyectar la directiva en el chunk de cada componente) y el verificador.

La server-safety se re-verifica cuando cambian los internos de un componente, aunque su API no cambie. Precedente: Button pasó a cliente en 0.4.3 por el guard de `asChild`, que arma un handler propio.

`scripts/verify-client-directives.mjs` corre antes y después de `vite build` (`npm run build`). Antes del build falla si:

- un `.tsx` de `src/components/` tiene `'use client'` en su primera línea y no está en la lista;
- una entrada de la lista ya no existe o su archivo perdió la directiva;
- un componente sin directiva declara una función local y la usa como handler JSX (`onClick={handleX}`), por heurística estática.

Con `--post-build` falla si:

- `dist/index.js` alcanza recharts, directa o transitivamente;
- `dist/locale.js` alcanza recharts o el barrel raíz.

### Solo tokens semánticos

Los componentes usan solo tokens semánticos para color. Son la superficie pública de theming (ver [Theming](#theming-tokens-y-css-cascade-layers)), y un color fijo no responde al override del consumidor. Precedente: `ring-ring` no tenía token detrás, y Checkbox y Switch quedaron sin foco visible hasta 0.4.4.

### Objetivo táctil de 44px

Todo control interactivo apunta a un objetivo táctil de 44px. Los tamaños compactos (`sm`) existen y se documentan como tales. Cuando el visual queda por debajo de 44px, la hit area se extiende con un `::after` que sigue la silueta del control (patrón de Chip).

Button, Input y Select comparten escala para alinear en una misma fila: `sm` 32px, `md` 44px, `lg` 48px.

### Íconos internos

Los íconos internos usan `@radix-ui/react-icons`, por coherencia con la retícula de las primitivas Radix. Los consumidores pasan cualquier ícono por `startIcon`/`endIcon`. Costo aceptado: en la app del consumidor conviven dos familias de íconos.

### Sonner para toasts

Sonner, no Radix Toast: API más simple y estilizable con Tailwind.

### TanStack Table v9 con `useTable`

`useTable`, no `useLegacyTable`: el shim está deprecado e incluye todas las features.

### `@daypicker/react` v10

`@daypicker/react`, no `react-day-picker`: el paquete se renombró en v10 y el nombre viejo es solo un alias.

### `useId` para `aria-describedby`

Input y Textarea generan con `useId()` el id que enlaza `aria-describedby`, así la accesibilidad no depende de que el consumidor pase un `id`.

### Tooltip y touch

Tooltip no es apto para touch: Radix ignora los taps por diseño. Para contenido que tiene que llegar en touch, Popover. `pointer-coarse:hidden` en el contenido del Tooltip es una capa defensiva, no la solución.

### Badge `interactive`

`interactive` (el literal `true`) hace que Badge renderice un `button`: un `div` con hover, foco y `onClick` no es operable por teclado. Las sobrecargas de tipos lo hacen cumplir: `onClick` sin `interactive` no compila.

### `shape="pill"` en Button

La variante `shape` evita que cada consumidor arme el pill con un `className` ad hoc.

### Distribución por GitHub Packages

El paquete se distribuye por GitHub Packages. El `.npmrc` del consumidor (ver [README § 1](./README.md#-1-configuración-de-autenticación-requerido)) mapea el scope `@abelardo-salazar` a ese registro, así que npm no resuelve el paquete contra npmjs: eso protege contra dependency confusion. El repo es público.

**En revisión:** la distribución para proyectos de terceros se evalúa en [#68](https://github.com/abelardo-salazar/core-ui-design-system/issues/68).

### Fuera del DS

Lo específico de un consumidor queda fuera del design system. Precedente: Kanban, que es un proyecto aparte.

### Licencia MIT y avisos de terceros

El DS se publica bajo MIT. Razones: es la licencia del ecosistema del que forma parte (React, Radix, Tailwind y casi todas sus dependencias), los equipos legales de los clientes la aceptan sin revisión, y el DS sigue siendo propiedad del autor aunque se use en proyectos de terceros. El `LICENSE` vive en la raíz del repo; npm lo incluye en el paquete aunque `files` solo liste `dist`.

`preserveModules` copia en `dist/node_modules` el código de las dependencias empaquetadas, pero no sus archivos de licencia. MIT e ISC (y Apache-2.0) solo permiten redistribuir si el aviso de copyright y de permiso viaja con el código, así que el build genera `dist/THIRD-PARTY-NOTICES.txt` con el nombre, la versión, la licencia y el texto de los `LICENSE`/`NOTICE` de cada paquete.

- **Generación:** el plugin `third-party-notices` de `vite.config.ts` toma los paquetes de los módulos del bundle. No necesita una devDependency: el build ya sabe qué archivo de `node_modules` empaquetó.
- **Guardrail:** `scripts/verify-third-party-notices.mjs` corre en `npm run build`. Toma la lista de lo que hay en disco en `dist/node_modules`, no de `package.json`, y falla si un paquete no tiene entrada. Así, una dependencia transitiva nueva no se cuela sin aviso.
- Un paquete sin archivo de licencia queda con la licencia, el autor y el repositorio que declara su `package.json`, y una nota que lo dice. El aviso no se inventa.

### Detección de vulnerabilidades

La detección responde tres preguntas por separado, cada una con su mecanismo:

- **Qué introduce un PR:** `actions/dependency-review-action`, dentro del job `verify`, solo en `pull_request`. Compara las dependencias del PR contra las de `main` y falla desde severidad high. Bloquea, porque el riesgo lo trae el propio PR.
- **Qué se volvió vulnerable sin cambios:** `npm audit --audit-level=high` sobre `main`, en un workflow semanal (`.github/workflows/audit.yml`) que también se puede lanzar a mano. Avisa, no bloquea: un aviso publicado contra una dependencia que nadie tocó no es responsabilidad del PR que esté abierto.
- **Quién propone el arreglo:** Dependabot (`.github/dependabot.yml`), solo con actualizaciones de seguridad. Las familias que se versionan juntas van en un mismo grupo, para que el arreglo no rompa sus peers exactos.

Razón: el audit dentro del check obligatorio no es determinista. El mismo commit pasa un día y falla al siguiente por avisos nuevos, sin relación con lo que cambia el PR. Precedente: el 2026-11-01, un aviso de Storybook bloqueó el PR #69, que solo cambiaba Markdown.
