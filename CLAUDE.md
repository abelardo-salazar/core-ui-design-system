# CLAUDE.md — core-ui-design-system

## Constraints

- No modificar la API pública de componentes ya en producción sin justificar el breaking change.
- No agregar dependencias externas sin verificar antes en el propio repo si ya existe algo que cubra el caso. Al agregar o actualizar un paquete de `dependencies`, comprobar en la versión del lockfile si trae `'use client'` o estado compartido y aplicar [el criterio de peer o dependency](./ARCHITECTURE.md#peer-o-dependency).
- Si una tarea contradice una decisión de ARCHITECTURE.md, detenerse y avisar en vez de implementarla.

## Documentación

- ARCHITECTURE.md guarda las decisiones y su porqué; no duplicarlas aquí.
- Las reglas de componentes están en .claude/rules/components.md y se cargan al trabajar en src/components/ y src/utils/.
- Idioma: comentarios de código y salida de los scripts en inglés; README, ARCHITECTURE, CHANGELOG y texto visible de las stories en español neutro, sin voseo.
- Todo componente o prop nuevo lleva su marca en el README en el mismo PR: "**Desde X.Y.**" al inicio de la sección "Uso y Props" de un componente nuevo, "_(desde X.Y)_" en una prop nueva. X.Y es la minor en la que se publicará: la siguiente a la de package.json.

## Flujo de trabajo (aplica a todas las tareas)

- El prefijo de la rama es el tipo del título del PR, de la lista cerrada `feat/`, `fix/`, `docs/`, `chore/` (convención).
- Excepción: las ramas `dependabot/` las crea Dependabot y no siguen la convención de prefijos. Antes de mergear un PR de Dependabot que toca `dependencies`, agregar en su rama la entrada del CHANGELOG y re-verificar el [criterio de peer o dependency](./ARCHITECTURE.md#peer-o-dependency). Si actualiza un paquete que también está en `peerDependencies`, evaluar subir el piso del peer; subirlo cambia algo para el consumidor: título `fix:` y entrada en el CHANGELOG.
- PR obligatorio con el check `verify`, también para admins; solo squash, con el título del PR como título del commit (lo fuerza GitHub). Nunca commits directos a main.
- Mergear un PR solo con autorización explícita del usuario en la conversación, que nombre ese PR; nunca para destrabar otra tarea.
- Crear o empujar un tag `v*` solo con autorización explícita del usuario en la conversación, que nombre esa versión: empujar el tag publica el paquete ([flujo de release](./ARCHITECTURE.md#tags)).
- Título del PR en Conventional Commits (convención, sin verificación automática).
- No publicar ni bumpear versión salvo que la tarea lo pida. Los cambios van siempre a una entrada `[Unreleased]` del CHANGELOG. Entre el merge del PR de release y su tag no entra nada a main; si algo entra, se rehace el PR de release ([flujo de release](./ARCHITECTURE.md#tags)).
- CHANGELOG: describir API, comportamiento y migración para el consumidor. Los detalles de implementación van en los comentarios del código. Los PR `docs:` y `chore:` no llevan entrada salvo que cambien algo para el consumidor.
- Comparaciones A/B: en un clon o worktree con su propio npm ci. Nunca junctions ni symlinks al node_modules principal.

## Estilo de respuesta (ahorro de créditos)

- Resumen final de máximo ~15 líneas: qué cambió, qué verificaste, desvíos o hallazgos. No re-narrar el diff.
- "Explicar decisiones" solo para decisiones de diseño no obvias, en una o dos líneas cada una, no paso a paso.
- Correr lint, tsc, build y test completos una sola vez, al final. La verificación en navegador solo si el cambio afecta layout o visuales.
- No pegar logs largos; resumir.
