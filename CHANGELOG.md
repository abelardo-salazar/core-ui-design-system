# Changelog

## [0.4.1] - 2026-09-06

### Fixed

- **El barrel raíz publicado (`dist/index.js`) arrastraba `recharts` y dejaba de ser seguro
  para React Server Components.**
  `recharts` (`ResponsiveContainer.js`) llama `createContext(...)` a nivel de módulo, y
  `createContext` no existe en el entorno `react-server` de Next.js. Cualquier consumidor del
  App Router que importara **cualquier cosa** del paquete desde un Server Component —
  `Container`, `Badge`, `Card`, lo que sea, sin tocar `Chart` para nada — se topaba con
  `TypeError: (0 , f.createContext) is not a function` al hacer `next build` ("Failed to
  collect page data"). No era un problema de `Chart`: era el paquete entero roto para RSC.

  **Mecanismo (nuevo, distinto al de `0.3.15`):** `src/components/Chart/ChartPrimitives.ts`
  era el único archivo de todo `src/components/` que es 100 % re-export sin código propio
  (`export { BarChart, ... } from 'recharts'`). Rollup, en vez de darle su propio chunk
  preservado bajo `dist/components/Chart/`, lo **plegó dentro de `dist/index.js`** — metiendo
  16 imports directos a submódulos de `recharts` (ninguno con `'use client'`) en el archivo
  que todo consumidor importa. El guardrail de `'use client'` de `0.3.15` nunca lo detectó:
  solo escanea `src/components/*.tsx` contra su `dist/` correspondiente, jamás miró
  `dist/index.js`. Cada componente de `Chart` por separado (`ChartContainer.js`, etc.) tenía
  su directiva correcta — el archivo inseguro era el barrel.

  **Fix:** `Chart` sale del barrel raíz y pasa a un segundo entry point de build, expuesto
  como el subpath `./charts`:

  ```tsx
  // antes (0.4.0) — rompía el paquete entero para RSC
  import { ChartContainer, BarChart } from '@abelardo-salazar/core-ui-design-system';

  // ahora (0.4.1+)
  import { ChartContainer, BarChart } from '@abelardo-salazar/core-ui-design-system/charts';
  ```

  `dist/index.js` queda 100 % libre de `recharts` (verificado: `head -1` ya no es un import
  de `recharts`, y `grep recharts dist/index.js` da 0). `dist/charts.js` lleva `'use client'`
  en su cabecera — es client-only completo, no necesita el tratamiento granular por
  componente del barrel. **No se tocó el comportamiento de ningún componente de `Chart`**: es
  exclusivamente una reestructuración de build/exports.

  **Versiones publicadas afectadas: `0.4.0` únicamente.** `Chart` no existía en ninguna
  versión publicada anterior, así que `0.3.x` y previas no están afectadas por este bug.

### Chore

- El guardrail `scripts/verify-client-directives.mjs` gana un modo `--post-build` (corre
  después de `vite build`, dentro de `npm run build`): recorre el grafo de imports relativos
  alcanzables desde `dist/index.js` y falla si alguno importa `recharts`. El check de
  `0.3.15` validaba `src/components/*.tsx` → su `dist/`; este valida el barrel raíz, que es
  el archivo que un consumidor real importa y el que estaba roto.

### Docs

- `README.md`: documentado el nuevo patrón de import — `Chart` desde
  `@abelardo-salazar/core-ui-design-system/charts`, separado del import principal.

### Acción recomendada

Si instalaste `@abelardo-salazar/core-ui-design-system@0.4.0` y lo consumís desde Next.js App
Router (o cualquier entorno RSC), actualizá a `0.4.1`. Si usás `Chart`, además cambiá el
import a `@abelardo-salazar/core-ui-design-system/charts`.

## [0.4.0] - 2026-08-31

### Added

- **`Alert`** — aviso inline persistente (no-modal), variantes `info`/`success`/`warning`/`error`, subcomponentes `<AlertTitle>` y `<AlertDescription>`.
- **`DropdownMenu`** — menú de acciones sobre Radix: items normales, checkbox, radio group, label y separador.
- **`Tabs`** — navegación por pestañas sobre Radix (`<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`).
- **`Table`** — 8 primitivos HTML de tabla estilizados (`<Table>`, `<TableHeader>`, `<TableBody>`, `<TableFooter>`, `<TableRow>`, `<TableHead>`, `<TableCell>`, `<TableCaption>`).
- **`DataTable`** — tabla con sorting, filtro global y paginación sobre `@tanstack/react-table` v9.
- **`Chart`** — charts Bar/Line/Area/Pie/Ring sobre `recharts` (bundleado, no peerDependency); `ChartContainer`, `ChartTooltipContent`, `ChartLegendContent` + re-exports de recharts.
- **`QuantityStepper`** — control numérico +/- compuesto sobre `Button` e `Input`.

### Fixed

- **Áreas táctiles mínimas** en el cierre de `Dialog`/`Sheet`, el botón de quitar de `Chip` y los `Button` de solo icono.
- **`Tooltip` en táctil** — `TooltipContent` ya no se muestra en punteros gruesos (coarse-pointer), donde no hay hover y se disparaba de forma inconsistente.
- **`DataTable` — header de ordenamiento** ahora expone focus ring visible y color de icono `primary` al foco de teclado.
- **`Table` / `DataTable` — modo responsive** que colapsa la tabla a tarjetas por fila en viewports angostos, integrado en `DataTable`.

### Chore

- Resueltas las 26 vulnerabilidades de `npm audit` (todas en `devDependencies`; árbol publicado sin cambios).
- Agregado workflow de CI (GitHub Actions): lint, typecheck, build (con guardrail de `'use client'`), tests y `npm audit` en cada pull request y push a `main`.

### Docs

- Reescritura completa del `README.md`: contenido desactualizado corregido y componentes + `peerDependencies` faltantes documentados.

## [0.3.15] - Sin publicar

### Fixed

- **`'use client'` faltante en `dist/` para `Popover`, `Calendar`, `DatePicker` y `Progress`.**
  Estos cuatro componentes declaran `'use client'` en su código fuente, pero el build
  (`preserveModules` + reinyección manual vía `CLIENT_ENTRY_POINTS` en `vite.config.ts`) no
  los tenía registrados, así que la directiva se perdía en el `dist/` publicado. Cualquier
  consumidor de Next.js App Router que use alguno de estos componentes desde un Server
  Component se topa con el error estándar de RSC ("no se puede usar un hook / componente de
  cliente sin `'use client'`").

  **Versiones publicadas afectadas: `0.3.13` y `0.3.14`** (verificado extrayendo los tarballs
  reales del registro, no solo el historial de git). `0.3.12` y anteriores no están afectadas
  porque ninguno de estos cuatro componentes existía todavía en esa versión.

  `Chip` e `Image` tienen el mismo problema en el código fuente actual de `main`, pero
  **nunca llegaron a publicarse** (se agregaron después del último publish, `0.3.14`) — no
  hay ninguna versión en producción con `Chip`/`Image` rotos; salen arreglados desde su
  primer publish.

- **`@radix-ui/react-popover` y `@radix-ui/react-progress` vendorizados como copia privada
  dentro de `dist/node_modules/` en vez de resolverse como `peerDependency`.** Estaban en
  `peerDependencies` de `package.json` pero faltaban en `rollupOptions.external` de
  `vite.config.ts`, así que Rollup los empaquetaba dentro del propio `dist/` en vez de
  dejarlos como import externo. Esas copias vendorizadas, al pasar por el mismo pipeline de
  build, también perdían su `'use client'` original — mismo síntoma final (error de RSC),
  causa distinta. Afecta a las mismas versiones publicadas (`0.3.13`, `0.3.14`).

### Chore

- Agregado `scripts/verify-client-directives.mjs`, que corre como parte de `npm run build` y
  falla si algún componente con `'use client'` en su fuente no está registrado en
  `CLIENT_ENTRY_POINTS` — para que este bug no se repita silenciosamente en un futuro
  componente.

### Acción recomendada

Si instalaste `@abelardo-salazar/core-ui-design-system@0.3.13` o `@0.3.14` y usás `Popover`,
`Calendar`, `DatePicker` o `Progress` desde un Server Component, actualizá a `0.3.15` o
posterior.
