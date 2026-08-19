# Changelog

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
