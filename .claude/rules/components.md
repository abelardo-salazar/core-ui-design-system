---
paths:
  - 'src/components/**'
  - 'src/utils/**'
---

# Reglas de componentes

Las decisiones detrás de estas reglas, con su razón, están en [ARCHITECTURE.md § Decisiones](../../ARCHITECTURE.md#decisiones).

## Estructura

- Crear cada componente en `src/components/Nombre/` con `Nombre.tsx`, `Nombre.stories.tsx`, `index.ts` y `nombreVariants.ts` si las variantes superan 15 líneas; exportarlo en el barrel que corresponda (`src/index.ts` o `src/charts.ts`).

## Server y client

- Declarar `'use client'` y registrar el archivo en `scripts/client-entry-points.mjs` si el componente usa hooks, construye handlers propios o depende de un paquete cliente; re-verificar al cambiar sus internos. [Decisión](../../ARCHITECTURE.md#componentes-server-y-client)

## Estilos

- Usar solo tokens semánticos para color, y `ring-primary` para el anillo de foco. [Decisión](../../ARCHITECTURE.md#solo-tokens-semánticos)
- No repetir el mismo grupo de utilidades en la base de cva y en una variante; no depender de tailwind-merge para resolver el conflicto.
- Desestructurar toda variante de cva y pasarla a la función de variantes en todas las ramas del componente; verificar que no llegue al DOM como atributo.

## Táctil

- Auditar todo control interactivo y todo botón de solo ícono contra el objetivo de 44px. [Decisión](../../ARCHITECTURE.md#objetivo-táctil-de-44px)
- Detectar touch con `pointer-coarse:`/`pointer-fine:`, no con `hover:none`.

## Tipos

- Cubrir los tipos que son contrato con un `*.test-d.tsx` con casos `@ts-expect-error`.
- Usar `type` en vez de `interface` para definiciones vacías o genéricas.

## Tests

- Todo componente nuevo o modificado lleva test (play functions) antes de mergear.
- En el proyecto `storybook` de vitest-browser no se aplican las utilidades de Tailwind: hacer aserciones sobre clases y DOM.
- Marcar con `tags: ['real-css']` la story que necesita el CSS aplicado (posición, z-index, `elementFromPoint`): corre solo en el proyecto `storybook-css`, que sí lo aplica. Antes de darla por buena, verificar que falla sin el cambio.
- Verificar lo demás (tamaños, animaciones) en Storybook con navegador real.
- Usar imágenes con data URI o asset local en stories y tests, nunca una URL externa.
