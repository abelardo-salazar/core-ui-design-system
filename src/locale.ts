// Tercer entry point del paquete, expuesto como subpath `./locale` (ver package.json
// `exports`). Reexporta los locales de DayPicker (los de date-fns extendidos con `labels`
// traducidos) para que el consumidor no tenga que importar `@daypicker/react`, que es
// dependencia del DS y no suya (con pnpm ni siquiera es resoluble desde la app).
//
// Son datos puros: no lleva 'use client' y se puede importar desde un Server Component.
// No importa nada del barrel raíz — scripts/verify-client-directives.mjs --post-build lo
// verifica sobre dist/locale.js. @daypicker/react no es external, así que con
// preserveModules cada locale sale en su propio archivo bajo dist/node_modules/ y el
// consumidor solo empaqueta los que importa (requiere `sideEffects` en package.json).
export * from '@daypicker/react/locale';
