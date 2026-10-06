# CLAUDE.md — core-ui-design-system

## Constraints activos (auditoría de robustez)

- No modificar la API pública de componentes ya en producción sin justificar el breaking change
- Todo componente nuevo o modificado requiere test antes de mergear
- No agregar dependencias externas sin verificar antes en el propio repo si ya existe algo que cubra el caso

## Flujo de trabajo (aplica a todas las tareas)

- Rama feat/ o fix/, PR, Squash & Merge. Nunca commits directos a main.
- No publicar ni bumpear versión salvo que la tarea lo pida. Mientras 0.5.0 esté sin publicar, los cambios se agregan a su entrada del CHANGELOG.
- No tocar DESIGN_SYSTEM.md (vive fuera del repo).
- Todo componente nuevo o modificado lleva test (play functions). El fixture headless de vitest-browser no aplica utilidades de Tailwind ni hace layout: aserciones sobre clases y DOM; medidas reales en Storybook con navegador real.
- Comparaciones A/B: en un clon o worktree con su propio npm ci. Nunca junctions ni symlinks al node_modules principal.
- Un componente es server-safe salvo que use hooks o construya handlers propios; los componentes cliente se registran en scripts/client-entry-points.mjs.
- Una variante nueva de cva debe desestructurarse y pasarse a la función de variantes en todas las ramas del componente; verificar que no llegue al DOM como atributo.

## Estilo de respuesta (ahorro de créditos)

- Resumen final de máximo ~15 líneas: qué cambió, qué verificaste, desvíos o hallazgos. No re-narrar el diff.
- "Explicar decisiones" solo para decisiones de diseño no obvias, en una o dos líneas cada una, no paso a paso.
- Correr lint, tsc, build y test completos una sola vez, al final. La verificación en navegador solo si el cambio afecta layout o visuales.
- No pegar logs largos; resumir.
