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
- Variante de escritorio con vuelta a la forma base por breakpoint: toda propiedad que la variante pise sobre la forma base lleva su restauración en cada breakpoint del mapa estático, y la story `real-css` de la vuelta se extiende para afirmarla. Si falta una, la propiedad de escritorio se filtra a la forma base sin ningún error. Caso: en NavigationBar, `horizontal`/`vertical` pisan la forma `bottom` del contenedor, la lista, el enlace, el ícono y el badge, y `bottomBelow` la restaura en `sm`, `md` y `lg` (`navigationBarVariants.ts`); la story es `BottomBelowLayout`.

## Táctil

- Auditar todo control interactivo y todo botón de solo ícono contra el objetivo de 44px. [Decisión](../../ARCHITECTURE.md#objetivo-táctil-de-44px)
- Detectar touch con `pointer-coarse:`/`pointer-fine:`, no con `hover:none`.
- Dar a todo `hover:X` de un elemento interactivo su `active:X` con el mismo token y sin `pointer-fine:`. Un deshabilitado no lo muestra: `enabled:active:` en un `<button>`, y `not-disabled:not-aria-disabled:active:` en `buttonVariants` y en lo que se arma sobre él. Si un estado encendido (`data-[state=on]`, `data-[state=active]`) gana al hover, excluirlo con `not-data-[state=…]:`. El mismo elemento lleva `[-webkit-tap-highlight-color:transparent]` en su clase, nunca en una regla global. Cubrirlo en `PressedState.stories.tsx`. [Decisión](../../ARCHITECTURE.md#estado-presionado-y-destello-de-toque)

## Tipos

- Cubrir los tipos que son contrato con un `*.test-d.tsx` con casos `@ts-expect-error`.
- Usar `type` en vez de `interface` para definiciones vacías o genéricas.

## Tests

- Todo componente nuevo o modificado lleva test (play functions) antes de mergear.
- En el proyecto `storybook` de vitest-browser no se aplican las utilidades de Tailwind: hacer aserciones sobre clases y DOM.
- Marcar con `tags: ['real-css']` la story que necesita el CSS aplicado (posición, z-index, `elementFromPoint`): corre solo en el proyecto `storybook-css`, que sí lo aplica. Antes de darla por buena, verificar que falla sin el cambio.
- En un `play` que compara valores de un token por tema, leerlos con `rootTokenIn` o `readInTheme` (`.storybook/rootTheme.ts`), sin tocar `.dark` a mano: la story debe pasar con cualquier tema del selector.
- Verificar lo demás (tamaños, animaciones) en Storybook con navegador real.
- Usar imágenes con data URI o asset local en stories y tests, nunca una URL externa.
