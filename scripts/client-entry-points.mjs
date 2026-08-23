// Única fuente de verdad para qué componentes declaran 'use client' en su primera línea.
//
// Rollup, incluso con output.preserveModules, no conserva directivas de módulo en chunks
// no-entry (verificado en este repo: build con preserveModules:true + grep en dist/ dio 0
// ocurrencias de "use client"). vite.config.ts usa esta lista para reinyectar la directiva
// en el chunk exacto que le corresponde a cada archivo.
//
// scripts/verify-client-directives.mjs usa esta misma lista (no una copia) para confirmar
// que todo componente con 'use client' en su fuente está registrado acá. Si en vez de
// importar esta lista el script mantuviera su propia copia, podría desalinearse de la
// lista real igual que pasó con vite.config.ts (ver PR de este fix) — por eso una sola lista
// compartida, no dos.
//
// Rutas relativas a la raíz del repo. Al agregar un componente nuevo con 'use client' en su
// fuente, agregá su ruta acá; `npm run build` falla si te olvidás.
export const CLIENT_ENTRY_POINTS = [
  'src/components/Input/Input.tsx',
  'src/components/Textarea/Textarea.tsx',
  'src/components/Dialog/Dialog.tsx',
  'src/components/Sheet/Sheet.tsx',
  'src/components/Select/Select.tsx',
  'src/components/Checkbox/Checkbox.tsx',
  'src/components/Switch/Switch.tsx',
  'src/components/Avatar/Avatar.tsx',
  'src/components/Toast/Toast.tsx',
  'src/components/Tooltip/Tooltip.tsx',
  'src/components/Calendar/Calendar.tsx',
  'src/components/Chip/Chip.tsx',
  'src/components/DatePicker/DatePicker.tsx',
  'src/components/Image/Image.tsx',
  'src/components/Popover/Popover.tsx',
  'src/components/Progress/Progress.tsx',
  'src/components/DropdownMenu/DropdownMenu.tsx',
  'src/components/Tabs/Tabs.tsx',
  'src/components/DataTable/DataTable.tsx',
  'src/components/Chart/ChartContainer.tsx',
];
