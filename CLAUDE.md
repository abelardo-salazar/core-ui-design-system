# CLAUDE.md — core-ui-design-system

## Constraints

- No modificar la API pública de componentes ya en producción sin justificar el breaking change.
- No agregar dependencias externas sin verificar antes en el propio repo si ya existe algo que cubra el caso. Si se agrega, va como peer o dependency según [el criterio](./ARCHITECTURE.md#peer-o-dependency).
- Si una tarea contradice una decisión de ARCHITECTURE.md, detenerse y avisar en vez de implementarla.

## Documentación

- ARCHITECTURE.md guarda las decisiones y su porqué; no duplicarlas aquí.
- Las reglas de componentes están en .claude/rules/components.md y se cargan al trabajar en src/components/ y src/utils/.
- Idioma: comentarios de código y salida de los scripts en inglés; README, ARCHITECTURE, CHANGELOG y texto visible de las stories en español neutro, sin voseo.

## Flujo de trabajo (aplica a todas las tareas)

- El prefijo de la rama es el tipo del título del PR, de la lista cerrada `feat/`, `fix/`, `docs/`, `chore/` (convención).
- PR obligatorio con el check `verify`, también para admins; solo squash, con el título del PR como título del commit (lo fuerza GitHub). Nunca commits directos a main.
- Título del PR en Conventional Commits (convención, sin verificación automática).
- No publicar ni bumpear versión salvo que la tarea lo pida. Si la versión de package.json todavía no está publicada (`npm view <paquete> versions`), los cambios se agregan a su entrada del CHANGELOG; si ya lo está, a una entrada `[Unreleased]`.
- CHANGELOG: describir API, comportamiento y migración para el consumidor. Los detalles de implementación van en los comentarios del código. Los PR `docs:` y `chore:` no llevan entrada salvo que cambien algo para el consumidor.
- Comparaciones A/B: en un clon o worktree con su propio npm ci. Nunca junctions ni symlinks al node_modules principal.

## Estilo de respuesta (ahorro de créditos)

- Resumen final de máximo ~15 líneas: qué cambió, qué verificaste, desvíos o hallazgos. No re-narrar el diff.
- "Explicar decisiones" solo para decisiones de diseño no obvias, en una o dos líneas cada una, no paso a paso.
- Correr lint, tsc, build y test completos una sola vez, al final. La verificación en navegador solo si el cambio afecta layout o visuales.
- No pegar logs largos; resumir.
