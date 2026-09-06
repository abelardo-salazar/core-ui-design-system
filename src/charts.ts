'use client';
// Segundo entry point del paquete, expuesto como subpath `./charts` (ver package.json
// `exports`). Existe para sacar `Chart` del barrel raíz (src/index.ts): `Chart` arrastra
// recharts, y recharts (ResponsiveContainer.js) llama `createContext(...)` a nivel de módulo,
// lo cual explota en el entorno react-server de Next.js. Al plegarse dentro de dist/index.js,
// eso volvía inseguro para Server Components al paquete entero — no solo a quien usa Chart.
// Ver CHANGELOG.md [0.4.1].
//
// A diferencia del barrel raíz (que necesita el tratamiento granular de 'use client' por
// componente, vía CLIENT_ENTRY_POINTS), este entry es client-only completo: TODO lo que
// exporta es cliente. La directiva 'use client' de arriba la reinyecta vite.config.ts en el
// chunk publicado (dist/charts.js) — Rollup no conserva directivas de módulo en el output.
//
// No importa './index.css': los consumidores ya importan la hoja de estilos una sola vez
// (ver README, "Setup Inicial") y Chart usa los mismos tokens del DS que el resto.
export * from './components/Chart';
