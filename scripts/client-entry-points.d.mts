// Declaración de tipos para client-entry-points.mjs (plain ESM: lo ejecuta directamente
// scripts/verify-client-directives.mjs con `node`, sin pasar por tsc, así que el módulo en
// sí se mantiene JS puro). Este .d.ts es solo para que vite.config.ts lo importe tipado.
export declare const CLIENT_ENTRY_POINTS: string[];
