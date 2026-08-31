# Changelog

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
