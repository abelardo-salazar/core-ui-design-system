// Third entry point of the package, exposed as the `./locale` subpath (see package.json
// `exports`). Re-exports the DayPicker locales (the date-fns ones extended with translated
// `labels`) so the consumer doesn't have to import `@daypicker/react`, which is a dependency
// of the DS and not of the app (with pnpm it can't even be resolved from the app).
//
// Pure data: no 'use client', and it can be imported from a Server Component.
// It imports nothing from the root barrel; scripts/verify-client-directives.mjs --post-build
// checks this on dist/locale.js. @daypicker/react is not external, so with preserveModules
// each locale comes out in its own file under dist/node_modules/ and the consumer only
// bundles the ones it imports (requires `sideEffects` in package.json).
export * from '@daypicker/react/locale';
