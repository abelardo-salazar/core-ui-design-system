# Design System — Notas de arquitectura

Este documento reúne decisiones y mecanismos internos del design system que no son parte de la guía de uso para consumidores (esa vive en [README.md](./README.md)). Es referencia para quienes mantienen el paquete, no para quienes solo lo consumen.

## Theming: tokens y CSS Cascade Layers

### Dónde viven los tokens

Los tokens semánticos de color y radio (`--primary`, `--base-100`, `--error-focus`, etc.) están definidos en `src/tailwind.css` (ver [más abajo](#srctailwindcss-fuente-única-de-tokens-y-capas-base)), dentro de:

- `@layer base { :root {...} }` — valores por defecto (tema claro).
- `@layer base { :root:has(.dark), .dark {...} }` — overrides de tema oscuro.

El orden real de capas en `style.css` compilado (Tailwind v4) es el siguiente; con `./tailwind.css` lo fija la compilación del consumidor:

```
components < properties < theme < base < utilities
```

Los tokens semánticos viven en `base`. Las utilidades de color (`bg-primary`, `text-primary-content`, etc.) se generan en `@theme` apuntando a estos tokens vía `var(...)` (ver el bloque `@theme` de `src/tailwind.css`), y a su vez cada token semántico apunta a un token `--palette-*` (`--primary: var(--palette-navy)`). Esa indirección es implementación interna: **`--palette-*` no es la superficie pública de override** — ver [README § Theming](./README.md#-3-theming-custom-properties) para la lista de tokens que sí lo son.

### Por qué el override recomendado es "CSS sin capa"

El mecanismo de override documentado para consumidores (CSS fuera de cualquier `@layer`, apuntando a `:root`/`.dark`) no es una convención arbitraria: es la única forma que, por especificación de CSS Cascade Layers, gana sobre cualquier `@layer` **sin importar el orden de import** entre la hoja de estilos del consumidor y la del paquete. Cualquier otra forma de override queda sujeta al orden de import entre ambas hojas.

Esto se verificó empíricamente (no solo por lectura de la spec) con Chromium real (Playwright) contra Storybook sirviendo el CSS compilado real del paquete, con `getComputedStyle` sobre un elemento con `background-color: var(--primary)`:

| Escenario                                                            | Resultado                                                |
| -------------------------------------------------------------------- | -------------------------------------------------------- |
| Override sin capa, insertado _antes_ del CSS del paquete en `<head>` | **Gana** (`#302b6e` → `#ff00ff`)                         |
| Override en `@layer base`, importado _después_ del CSS del paquete   | **Gana** (`#302b6e` → `#00ff00`)                         |
| Override en `@layer base`, importado _antes_ del CSS del paquete     | **No gana** — queda en `#302b6e`, el default del paquete |
| `:root {}` / `.dark {}` sin capa, alternando la clase `.dark`        | Cambia correctamente en ambos temas                      |

Los cuatro resultados coincidieron exactamente con lo que predice la teoría de CSS Cascade Layers (ninguna sorpresa que documentar como excepción). El riesgo del segundo/tercer escenario es real y concreto: si un consumidor que también usa Tailwind pone su override dentro de su propio `@layer base` (siguiendo la convención de customización de tema de Tailwind), la capa `base` termina compartida por nombre entre ambas hojas, y el desempate pasa a ser el orden normal de cascada (última declaración en el documento gana) — ya no aplica la prioridad especial de "sin capa". Un reorden de imports, o un bump de dependencia que cambia cuándo se inyecta su CSS, puede invertir silenciosamente cuál de las dos gana.

Por eso el override sin capa es el único patrón que se documenta como soportado — ver el bloque copy-paste y la lista completa de tokens en [README § Theming](./README.md#-3-theming-custom-properties).

## Hojas de estilos: `style.css` y `tailwind.css`

Qué hoja importar según el proyecto está en [README § Setup Inicial](./README.md#️-2-setup-inicial). Aquí va el porqué.

### `src/tailwind.css`: fuente única de tokens y capas base

`src/tailwind.css` contiene, en este orden:

- `@source "./"` y `@source not "./node_modules"` (ver abajo).
- `@plugin "tailwindcss-animate"`.
- `@theme { ... }`: la fuente (`--font-sans`), los colores (`--color-*: var(--token)`) y los radios.
- `@layer base { ... }`: los tokens `--palette-*` y los semánticos, tema claro y oscuro.
- `@layer base { ... }`: `--tw-ring-offset-color` para todo el DS y los estilos de `html` y `body`.

No contiene `@import 'tailwindcss'` ni la fuente. La importan dos lugares:

- **`src/index.css`**: `@import 'tailwindcss'` + `@import './fonts.css'` (Ubuntu autoalojada, ver [Fuente autoalojada](#fuente-autoalojada)) + `@import './tailwind.css'`. De ahí salen `style.css` (`vite build`) y los estilos de Storybook (`.storybook/preview.ts`).
- **El paquete publicado**: el plugin `copyTailwindSource` de `vite.config.ts` copia el archivo sin compilar a `dist/tailwind.css` (`exports["./tailwind.css"]`), y lo compila el Tailwind del consumidor.

**Los `@source`** son relativos al propio archivo, así que en `dist/` escanean el JS publicado. Hacen falta porque la detección automática de Tailwind ignora `node_modules`: sin ellos, el consumidor no generaría las clases que solo existen en el JS del paquete (por ejemplo `sm:text-left`, de `SheetHeader`).

**`@source not "./node_modules"`**: `dist/node_modules` contiene las dependencias que `preserveModules` empaqueta (`d3-*`, `@reduxjs`, `@radix-ui`…). No tienen clases del DS, y escanearlas mete unas 94 utilidades de sobra, unos 13 KB minificados. `@source not` existe desde Tailwind 4.1, y de ahí viene el peer `tailwindcss >=4.1`.

**`tailwindcss-animate` está en `dependencies`**: el `@plugin` se resuelve desde `dist/`, dentro del `node_modules` del consumidor. Como devDependency, el consumidor falla con `Can't resolve 'tailwindcss-animate'`.

**En el repo, los `@source` no agregan nada**: `vite build` ya escanea todo el repo salvo lo ignorado por git, docs y scripts incluidos. Por eso `style.css` también genera clases que solo aparecen en la documentación, como el `bg-primary/5` del CHANGELOG. Limitar el escaneo a `src/` quitaría de `style.css` reglas que hoy salen de esos archivos (`ring-offset-2`, `pl-10`, `mx-3`…). Si se quiere, es un cambio aparte; no es un efecto de `tailwind.css`.

### Orden de utilidades entre dos compilaciones

`style.css` sale ya compilado. Un consumidor con su propio Tailwind que además lo importa termina con dos compilaciones. Las dos declaran las mismas capas con nombre (`base`, `utilities`…), y el navegador fusiona las capas que tienen el mismo nombre aunque vengan de hojas distintas. El caso se observó en Next.

Dentro de una capa, con la misma especificidad, gana la última regla. Una utilidad responsive es una clase dentro de un `@media`, así que tiene la misma especificidad que la utilidad base. Ejemplo con `Container`, que usa `px-4 md:px-8`:

1. `style.css` emite `.px-4` y, después, `.md\:px-8`.
2. El consumidor usa `px-4` en su código, así que su compilación vuelve a emitir `.px-4`, más abajo en la capa `utilities`.
3. A partir de `md`, el `.px-4` del consumidor pisa al `.md\:px-8` del DS y el padding no crece.

Pasa lo mismo con `lg:text-5xl` de `Heading`, con `sm:text-left` de `SheetHeader` y con cualquier utilidad base que el consumidor también use. **Cambiar el orden de los imports solo traslada el problema**: con `style.css` al final, sus utilidades base pisan a las responsive del consumidor. Las variantes con pseudo-clase (`hover:`, `disabled:`) no se ven afectadas, porque `.hover\:bg-x:hover` tiene más especificidad que `.bg-x`.

Hay además un segundo síntoma: la compilación del DS no conoce las clases del consumidor, y la del consumidor no conoce los tokens del DS. Por eso clases como `bg-primary/5` no se generan en ninguna de las dos.

`./tailwind.css` lo resuelve con una sola compilación: el Tailwind del consumidor genera cada utilidad una vez, en el orden correcto, y conoce los tokens. `style.css` queda para consumidores sin Tailwind.

**La guardia** (`scripts/verify-tailwind-consumer.mjs`, paso `verify:tailwind-consumer` del CI) lo verifica contra el paquete real:

1. Hace `npm pack`.
2. Arma un consumidor sin red, en un directorio temporal fuera del repo: extrae el tarball y copia `tailwindcss` y cada paquete de `@plugin` que el manifiesto empaquetado declara en `dependencies`.
3. Compila con `@tailwindcss/cli` un `@import 'tailwindcss'` más el de `./tailwind.css`.

Falla si:

- `md:px-8` no queda después de `px-4`;
- no se genera `bg-primary/5`, que solo usa el fixture;
- no se genera `sm:text-left`, que solo existe en el JS de `dist/components`;
- hay más de un preflight;
- aparece `googleapis`;
- el CSS pesa más que `style.css`, la señal de que se escaneó `dist/node_modules`;
- un `@plugin` no está en `dependencies`.

**Por qué `./tailwind.css` no trae la fuente**: así el consumidor elige cómo cargarla (`./fonts.css`, `next/font` o la suya) y la guardia no depende de la red.

## Versiones y tags

### Versionado

Los cambios sin publicar se acumulan en una sola entrada `[Unreleased]` del CHANGELOG, sin bumps intermedios. El PR de release reescribe esa entrada con el **delta neto** contra la última versión publicada: solo lo que cambia para quien actualiza desde ella. No se narran regresiones que aparecieron y se arreglaron dentro de la misma versión; "Fixed" lista solo bugs que existían en la versión publicada anterior, y los cambios incompatibles van en "Changed" con su migración. En 0.x: minor para funcionalidad o cambios visuales, patch para fixes.

### Tags

Se publica empujando un tag. El flujo:

1. **PR de release:** sube `version` en `package.json` y `package-lock.json`, cierra la entrada del CHANGELOG (de `[Unreleased]` a `[X.Y.Z] - <fecha>`, con el delta neto) y actualiza el badge y la línea de versión del README. `verify:readme` comprueba que coincidan.
2. **Merge** del PR a `main`. Entre este merge y el tag no entra nada a `main`.
3. **Tag anotado** `vX.Y.Z` sobre el commit del merge: `git tag -a vX.Y.Z -m "vX.Y.Z" <commit>`.
4. **Push del tag:** `git push origin vX.Y.Z`.
5. **El workflow `release.yml` publica.** Falla sin publicar si el tag no es `v` + `package.json#version`, si su commit no está en `main`, si ese commit no cambia `package.json#version` respecto de su primer padre o si esa versión ya está en el registro. Si no falla, corre la misma verificación que `ci.yml`, salvo el dependency review y el build de Storybook (una falla de la documentación no debe bloquear la publicación), y publica en el registro público de npm con trusted publishing (OIDC) y provenance: no hay token de npm en el repo, y npmjs solo acepta la publicación desde `release.yml` de este repositorio. El chequeo de versión corre sin autenticación porque el paquete es público. Para ese chequeo de versión, un E404 de `npm view` cuenta como "no publicada" (el paquete todavía no existe en npm); cualquier otro error falla el job. Por qué npm: [Registro: npm público](#registro-npm-público). El mismo tag dispara también el deploy de Storybook: [Documentación publicada](#documentación-publicada).

Razón: el tag define lo que se publica. Antes se publicaba a mano con `npm publish` desde una máquina local y el tag se ponía después, reconstruyendo qué commit se había publicado. Ahora el paquete sale del commit con tag, verificado en CI, y no hay nada que reconstruir.

Si algo entra a `main` después del merge del PR de release, se rehace ese PR: lo revisado en él ya no es lo que se publicaría. Como `version` ya tiene el número nuevo, rehacerlo son dos PR: uno devuelve `version` a la última publicada y lleva la entrada del CHANGELOG a `[Unreleased]`, y luego un PR de release nuevo vuelve a subirla. Así el tag queda sobre un commit que cambia la versión.

Un tag que falló no se mueve para reintentar: se corrige en un PR, se sube la versión si el error ya estaba en el commit con tag y se empuja un tag nuevo. Si la falla fue externa (el registro, la red), se vuelve a correr el workflow.

**Nota histórica:** antes de este flujo, los tags se ubicaban con el `gitHead` del paquete publicado (`npm view …@X.Y.Z gitHead`). GitHub Packages no lo expone (devuelve vacío), así que los tags anteriores se ubicaron por la hora de publicación que registra el registro. Esto aplica a las versiones hasta 0.8.0, que están en GitHub Packages; npm sí guarda `gitHead`, pero desde este flujo el tag ya identifica el commit publicado. Está verificado para 0.6.0 y 0.7.0. `v0.4.1` y `v0.4.2` son tags ligeros (no anotados), creados antes de la convención de tags anotados, y se dejan así. Las versiones anteriores a 0.4.1 no tienen tag.

**Nota histórica:** `v0.10.0` está sobre `601b284` (#107), que no cambia la versión. El PR de release (#100) se mergeó antes que #101 a #107, y esos PR agregaron sus cambios a la entrada de la versión, todavía sin publicar. Lo publicado es correcto, porque el tag incluye todos esos cambios, pero el PR de release no los revisó. A raíz de esto, `release.yml` exige que el commit con tag cambie la versión. `v0.10.0` no se mueve ni se re-crea.

## Decisiones

Cada decisión con su razón. Las listas concretas (qué paquete es peer, qué componente es cliente) viven en `package.json` y `scripts/client-entry-points.mjs`; aquí va el criterio.

### Peer o dependency

Un paquete va en `peerDependencies` si trae `'use client'` propio o si puede duplicar instancias: contextos de React, primitivas de Radix con estado, Sonner, TanStack Table, cmdk. Va en `dependencies` si no trae directiva ni estado compartido. El criterio se aplica a la versión que se empaqueta, la del lockfile en el momento del build, y se re-verifica cada vez que esa versión cambia.

Razón: con `preserveModules`, Rollup pierde las directivas de los chunks que no son entry, así que un paquete cliente empaquetado en `dist/node_modules` llega al consumidor sin su `'use client'`. Y una instancia duplicada (la empaquetada más la del consumidor) rompe los contextos: el provider de una copia no lo ve el consumidor de la otra.

**El build hace cumplir la parte de la directiva.** `verify-client-directives --post-build` recorre los módulos empaquetados en `dist/node_modules`, ubica cada uno en su original del `node_modules` del repo y falla si alguno empieza con `'use client'`. El mensaje nombra el paquete, su versión y el archivo. Mira el original porque en `dist` la directiva ya no está. También falla si un módulo no tiene original reconocible, para no quedar ciego ante un cambio de layout. La parte del estado compartido no se puede detectar así y se sigue revisando a mano.

`tailwindcss-animate` está en `dependencies` por otro motivo: ver [`src/tailwind.css`](#srctailwindcss-fuente-única-de-tokens-y-capas-base).

### Separator y AspectRatio propios

`Separator` y `AspectRatio` son implementación propia, con la misma API, los mismos tipos y el mismo DOM que las primitivas de Radix que reemplazaron (`@radix-ui/react-separator` y `@radix-ui/react-aspect-ratio`). Eso incluye `asChild` y el atributo `data-radix-aspect-ratio-wrapper`. Las stories de los dos componentes fijan ese DOM; se escribieron contra Radix 1.1.15 antes del reemplazo.

**Por qué:** desde 1.2.0 esas primitivas traen `'use client'`. Por el [criterio de peer o dependency](#peer-o-dependency) habrían pasado a peers, y los dos componentes habrían dejado de ser server-safe. Son un `div` con atributos (y un `div` exterior con `padding-bottom`, en AspectRatio), sin hooks ni estado. Mantenerlos propios los deja server-safe por construcción. `asChild` usa `Slot` de `@radix-ui/react-slot`, que sigue en `dependencies` porque no trae directiva.

### Solo ESM

El paquete sale solo en ESM, sin UMD: `preserveModules` emite un archivo por módulo, incompatible con un bundle único.

### Subpaths `./charts` y `./locale`

Chart vive en `./charts`, no en el barrel raíz: un re-export puro se pliega al barrel raíz y arrastra recharts, cuyo `createContext` a nivel de módulo rompe en RSC. `./locale` son datos server-safe (locales de DayPicker); como entry propio, solo se empaqueta lo que el consumidor importa. El modo `--post-build` de `verify-client-directives.mjs` verifica los dos límites (ver [abajo](#componentes-server-y-client)).

### Componentes server y client

Un componente es server-safe por defecto. Si usa hooks, construye handlers propios o depende de un paquete cliente, declara `'use client'` y se registra en `scripts/client-entry-points.mjs`. Es la lista única que usan `vite.config.ts` (para reinyectar la directiva en el chunk de cada componente) y el verificador.

La server-safety se re-verifica cuando cambian los internos de un componente, aunque su API no cambie. Precedente: Button pasó a cliente en 0.4.3 por el guard de `asChild`, que arma un handler propio.

`scripts/verify-client-directives.mjs` corre antes y después de `vite build` (`npm run build`). Antes del build falla si:

- un `.tsx` de `src/components/` tiene `'use client'` en su primera línea y no está en la lista;
- una entrada de la lista ya no existe o su archivo perdió la directiva;
- un componente sin directiva declara una función local y la usa como handler JSX (`onClick={handleX}`), por heurística estática.

Con `--post-build` falla si:

- `dist/index.js` alcanza recharts, directa o transitivamente;
- `dist/locale.js` alcanza recharts o el barrel raíz.

### Solo tokens semánticos

Los componentes usan solo tokens semánticos para color. Son la superficie pública de theming (ver [Theming](#theming-tokens-y-css-cascade-layers)), y un color fijo no responde al override del consumidor. Precedente: `ring-ring` no tenía token detrás, y Checkbox y Switch quedaron sin foco visible hasta 0.4.4.

### Objetivo táctil de 44px

Todo control interactivo apunta a un objetivo táctil de 44px. Los tamaños compactos (`sm`) existen y se documentan como tales. Cuando el visual queda por debajo de 44px, la hit area se extiende con un `::after` que sigue la silueta del control (patrón de Chip).

La extensión se aplica en el componente que conoce su entorno (paginación de DataTable, flechas de Calendar), no en `Button` `sm` en general: un `::after` global superpondría las hit areas de botones `sm` vecinos en las barras de los consumidores.

`Toggle` `sm` sí la lleva siempre, aunque no conoce su entorno: suele ir suelto, y las barras compactas tienen `ToggleGroup`. Costo aceptado: dos `Toggle` `sm` de menos de 44px de ancho a menos de 12px de separación se pisan, y el README pide esa separación. Para acotarlo, el `::after` crece desde el centro solo hasta 44px, así que un `Toggle` más ancho no se extiende hacia los lados.

Excepción: las grillas contiguas no extienden su hit area, porque un `::after` pisaría la celda vecina. Caso: los días de Calendar, que quedan en 36px. 44px no cabe en 320px de ancho (7 × 44 + padding = 332px) y 40px cambiaría el aspecto sin llegar a 44. La excepción aplica al default: `size="md"` (44px) y `size="lg"` (56px) son opt-in para contenedores anchos.

Button, Input y Select comparten escala para alinear en una misma fila: `sm` 32px, `md` 44px, `lg` 48px. En Select, la escala es de `SelectTrigger` y `SelectField` la reenvía.

### Estado presionado y destello de toque

Todo `hover:X` de un elemento interactivo tiene su `active:X` con el mismo token, y ese elemento lleva `-webkit-tap-highlight-color: transparent` en su propia clase. Un deshabilitado no muestra `active:`.

**Por qué:** en Tailwind v4, `hover:` solo aplica dentro de `@media (hover: hover)`, así que en una pantalla táctil los interactivos no daban ninguna respuesta al presionarlos, salvo el destello gris del navegador. Con `active:` igual al hover, presionar se ve como el hover del escritorio. Quitar el destello sin estado presionado dejaría el toque sin respuesta, por eso van juntos.

**Por componente, no global:** una regla global (`* { -webkit-tap-highlight-color: transparent }`) en la hoja del DS alcanzaría también los elementos del consumidor, que pueden contar con el destello.

**La guarda de deshabilitado va en el CSS:** el navegador no aplica `:active` a un `<button disabled>`, pero `aria-disabled` no lo frena. Un `<button>` usa `enabled:active:`. Lo que se arma sobre `buttonVariants` usa `not-disabled:not-aria-disabled:active:`, porque Button puede ser un `<a>` con `asChild`, donde `enabled:` no aplica; los overrides sobre esa base repiten la misma cadena para que tailwind-merge reemplace la de la variante. Se usan variantes de Tailwind y no una propia (`@custom-variant`) porque `tailwind.css` lo compila el Tailwind del consumidor: una variante propia entraría en su espacio de nombres y quitarla después sería un breaking change.

**Estados que ganan al hover:** en el ítem encendido de `ToggleGroup` y la pestaña activa de `Tabs`, `data-[state=…]` gana al hover por orden. Un `active:` con guarda tiene más especificidad y le ganaría, así que se excluye ese estado (`not-data-[state=on]:`) para que presionar se siga viendo como el hover.

**Pendiente de verificar en un iPhone:** en iOS, Safari puede no aplicar `:active` si la página no registra un listener de `touchstart`. El DS no agrega JS por esto; si pasa, la app puede registrar `document.addEventListener('touchstart', () => {}, { passive: true })`.

**Inconsistencia conocida:** el botón para agregar de `ImageUploader` lleno (`aria-disabled`) muestra el hover con mouse pero no el `active:`. No se corrige aquí.

### Íconos internos

Los íconos internos usan `@radix-ui/react-icons`, por coherencia con la retícula de las primitivas Radix. Los consumidores pasan cualquier ícono por `startIcon`/`endIcon`. Costo aceptado: en la app del consumidor conviven dos familias de íconos.

### Sonner para toasts

Sonner, no Radix Toast: API más simple y estilizable con Tailwind.

### TanStack Table v9 con `useTable`

`useTable`, no `useLegacyTable`: el shim está deprecado e incluye todas las features.

### `@daypicker/react` v10

`@daypicker/react`, no `react-day-picker`: el paquete se renombró en v10 y el nombre viejo es solo un alias.

### `useId` para `aria-describedby`

Input y Textarea generan con `useId()` el id que enlaza `aria-describedby`, así la accesibilidad no depende de que el consumidor pase un `id`.

### Tooltip y touch

Tooltip no es apto para touch: Radix ignora los taps por diseño. Para contenido que tiene que llegar en touch, Popover. `pointer-coarse:hidden` en el contenido del Tooltip es una capa defensiva, no la solución.

### Badge `interactive`

`interactive` (el literal `true`) hace que Badge renderice un `button`: un `div` con hover, foco y `onClick` no es operable por teclado. Las sobrecargas de tipos lo hacen cumplir: `onClick` sin `interactive` no compila.

### `shape="pill"` en Button

La variante `shape` evita que cada consumidor arme el pill con un `className` ad hoc.

### Registro: npm público

Desde 0.9.0 el paquete se publica en el registro público de npm, bajo el scope `@abelardo-salazar`, que es del mantenedor en npmjs.com. GitHub Packages queda congelado: las versiones hasta 0.8.0 siguen ahí y no hay publicación dual. `publishConfig` declara el registro y `access: public`, porque un paquete con scope se publica privado por defecto. Decidido en [#68](https://github.com/abelardo-salazar/core-ui-design-system/issues/68).

**Por qué:** GitHub Packages exige un token para instalar incluso un paquete público, así que cada consumidor tenía que crear un PAT y mantener un `.npmrc` con él. En npm se instala sin configuración. Además, npm admite trusted publishing (OIDC): no hay un token de larga duración que guardar, rotar o que se pueda filtrar. También publica con provenance, una atestación firmada que liga cada versión con su commit y su corrida del workflow. La 0.9.0 salió con un token granular temporal; desde la siguiente versión se publica así.

**Dependency confusion:** antes el `.npmrc` del consumidor mapeaba el scope a GitHub Packages para que npm no lo resolviera contra npmjs. Ahora el paquete vive en npmjs y el scope pertenece al mantenedor, así que nadie más puede publicar bajo él.

### `onCreate` de Combobox devuelve `void`

`onCreate(text)` solo avisa que se pidió crear: no devuelve el valor de la opción nueva ni cambia la selección. El consumidor agrega la opción a `options` y la selecciona con `value`; por eso los tipos exigen `value` y `onValueChange` cuando hay `onCreate`. Reemplaza la del triage del 2026-11-03, en la que `onCreate` devolvía el `value` y el Combobox lo seleccionaba (no llegó a publicarse).

**Por qué:** crear es del dominio del consumidor, no del DS: puede validar, rechazar, normalizar el texto o persistir en un servidor, y puede ser asíncrono. Si `onCreate` devolviera el valor, el DS tendría que decidir qué hacer con una promesa pendiente o rechazada y con un valor que todavía no está en `options`. Con `void` y valor controlado, la fuente de verdad es una sola: las `options` y el `value` del consumidor.

### Variantes de NavigationBar

`NavigationBar` tiene tres formas: `bottom` (default), `horizontal` y `vertical`, y `bottomBelow` vuelve a `bottom` por debajo de un breakpoint. Cambia la decisión del triage del 2026-11-03, que la dejaba solo como barra inferior y sin orientación vertical.

**Por qué:** la misma navegación principal suele ser una barra inferior en el móvil y una fila o un lateral en pantallas anchas. Sin variantes, el consumidor tenía que mantener dos componentes con los mismos ítems y alternarlos con JS o con clases `hidden`. `bottom` sigue siendo el default con el mismo DOM, así que el cambio es aditivo.

**Sin Context:** `NavigationBarItem` necesita saber la forma, pero un Context lo volvería client component. El `<nav>` declara un grupo de Tailwind con nombre (`group/navigation-bar`) y atributos `data-variant`/`data-bottom-below`, y el ítem se estiliza con `group-data-[…]/navigation-bar:`. Por eso el ítem tiene que ser descendiente de un `NavigationBar`.

### Ítem activo a la vista en NavigationBar horizontal

En `variant="horizontal"`, el enlace con `aria-current="page"` lleva `scroll-initial-target: nearest`, para que la fila con desplazamiento arranque mostrándolo. Decisión del 2026-11-09 (opción A).

**Por qué:** es solo CSS, así que `NavigationBar` sigue siendo server-safe, sin JS ni `scrollIntoView`. Es mejora progresiva: Chrome y Edge 133+ la aplican, y Firefox y Safari la ignoran y se comportan como antes. No necesita scroll-snap en la lista, así que el desplazamiento se siente igual que antes. Como pisa la forma `'bottom'`, `bottomBelow` la restaura en cada breakpoint, aunque allí sea inerte.

**Límite:** solo actúa cuando el contenedor se renderiza por primera vez. Si el activo cambia con el `<nav>` ya montado (un layout persistente entre navegaciones), la fila no se desplaza.

**Alternativas evaluadas:**

- **B:** un componente cliente interno que observa `aria-current` con `MutationObserver` y desplaza al activo. Cubre todos los navegadores y el layout persistente, pero agrega JS y `'use client'` a un componente que hoy es server-safe.
- **C:** un componente opt-in exportado que el consumidor monta junto a la barra. Mismo costo que la B, más una API pública que mantener.

**Cuándo pasar a la B:** si aparece un problema real en Safari o Firefox, o con un layout persistente, que justifique el JS.

### Breakpoints por mapa estático de clases

Una prop que cambia el layout según el breakpoint (`bottomBelow` en NavigationBar, `responsive` en Table con `cardModeClasses`) se resuelve con un mapa de cadenas de clases literales, una entrada por breakpoint (`{ sm: 'max-sm:…', md: 'max-md:…', lg: 'max-lg:…' }`), sin JS ni `matchMedia`.

**Por qué:** Tailwind solo genera las clases que aparecen literalmente en el código. Una clase armada en tiempo de ejecución (`` `max-${bp}:flex-row` ``) no existe en el CSS. Además, resolverlo con CSS mantiene el componente server-safe y evita el salto de layout en la hidratación que causaría `matchMedia`.

**Cuando un subcomponente debe cambiar con el breakpoint**, la entrada del mapa va en el subcomponente, condicionada al atributo del padre (`group-data-[bottom-below=md]/navigation-bar:max-md:…`). Lleva las tres entradas siempre y solo aplica la que coincide. Las clases que restauran tienen la misma especificidad que las de la variante y Tailwind emite después las que llevan media query, así que ganan sin `!important`. Una story `real-css` lo verifica dentro de iframes de ancho fijo, porque las media queries siguen al viewport y no al contenedor.

### Campos de formulario a 16px

Todo control con aspecto de campo (`Input`, `Textarea`, `Combobox`, `SelectTrigger` y los disparadores de `DatePicker` y `DateRangePicker`) usa texto de 16px (`text-base`) en `sm`, `md` y `lg`, sin reglas por plataforma. Las alturas de la escala (32 / 44 / 48px) no cambian, y `Button` mantiene su texto más chico.

**Por qué:** Safari en iOS, y con él la WebView de Capacitor, hace zoom al enfocar un campo editable con texto menor a 16px. Un solo tamaño en todas las plataformas es lo más predecible: el formulario se ve igual en el escritorio y en el teléfono. Select y los pickers son `<button>` y no provocan zoom, pero entran para que todos los campos de un formulario se vean iguales.

**Alternativas descartadas:**

- **`pointer-coarse:text-base`:** limita el cambio a pantallas táctiles, pero el mismo formulario se vería distinto según el dispositivo, y la corrección dependería del puntero principal que informe cada uno, no del navegador que hace el zoom.
- **Por breakpoint (`max-sm:text-base`):** el zoom depende del navegador, no del ancho. Un iPad o un iPhone en horizontal superan el breakpoint y vuelven a hacer zoom, y un escritorio angosto cambia de tamaño sin motivo.

### Fuera del DS

Lo específico de un consumidor queda fuera del design system. Precedente: Kanban, que es un proyecto aparte.

### Fuente autoalojada

`style.css` incluye Ubuntu autoalojada: los archivos woff2 viajan en el paquete (`dist/fonts/`) y las reglas `@font-face` los cargan con rutas relativas. Las mismas reglas se publican solas como `./fonts.css`.

**Por qué:** antes `style.css` importaba Ubuntu de Google Fonts. Cada visita a un sitio del consumidor mandaba su IP a Google sin que el consumidor lo supiera, un riesgo de GDPR, y obligaba a abrir `fonts.googleapis.com` y `fonts.gstatic.com` en su CSP.

**Por qué un archivo aparte:** `./tailwind.css` sigue sin fuente, para que quien la carga con `next/font` no reciba `@font-face` que no usa. Quien sí quiere Ubuntu desde el paquete importa `./fonts.css`. `style.css` lo incluye en línea en vez de importarlo, así no suma una petición. Las dos hojas apuntan a los mismos archivos de `dist/fonts/`: no hay copias.

**Por qué las mismas ocho variantes:** pesos 300, 400, 500 y 700, normal e itálica, cada una partida en sus seis subconjuntos por `unicode-range`, con `font-display: swap`, como las servía Google. Los componentes del DS solo usan 400, 500 y 700, pero un consumidor puede usar el peso 300 o la itálica en su propio código, y con menos variantes vería un cambio de aspecto. Ubuntu no tiene 600: `font-semibold` se resuelve con 700, como hasta ahora. El navegador solo descarga los archivos de las variantes y subconjuntos que usa la página, así que el costo de traerlas todas es el tamaño del paquete (unos 1,25 MB de woff2), no lo que descarga cada visita. Solo woff2, sin el respaldo woff: es lo que Google sirve a los navegadores actuales.

**De dónde salen:** de `@fontsource/ubuntu`, en `devDependencies`. El build copia sus archivos dentro de `dist/`, así que el consumidor no necesita instalarlo, y no trae `'use client'` ni estado ([peer o dependency](#peer-o-dependency) no aplica). `src/fonts.css` se generó desde su CSS. Sus `unicode-range` coinciden con los de Google salvo el final de latin-ext (`U+20C0` en vez de `U+20C4`), cuatro símbolos de moneda recientes que Ubuntu no tiene.

**Cómo se empaqueta:** las `url()` de `src/fonts.css` apuntan a `node_modules/@fontsource/ubuntu/files/`, para que Vite y Storybook las resuelvan en desarrollo, y llevan `?no-inline`: en modo librería Vite incrusta todo asset como data URI e ignora `assetsInlineLimit`. `assetFileNames` los deja en `dist/fonts/` sin hash, `base: './'` hace relativas las rutas de `style.css`, y el plugin `publishFonts` emite `dist/fonts.css` con las rutas reescritas a `./fonts/` (`scripts/fonts.mjs`).

**Rutas en el consumidor con Tailwind:** al incluir `./fonts.css` con `@import`, `@tailwindcss/vite` y `@tailwindcss/postcss` reescriben sus rutas relativas a la hoja que lo importa. `@tailwindcss/cli` no lo hace, y las rutas quedan rotas; el README lo avisa.

**La guardia** (`scripts/verify-fonts.mjs`, paso `verify:fonts` del CI), sobre el tarball de `npm pack` y el mismo consumidor sin red que `verify:tailwind-consumer` (`scripts/packed-consumer.mjs`), falla si:

- una `url()` de fuente de `fonts.css` o de `style.css` publicados no apunta a un archivo del paquete;
- alguno de los dos menciona `googleapis` o `gstatic`;
- un consumidor que importa `./tailwind.css` y `./fonts.css`, compilado con `@tailwindcss/node` y la reescritura de rutas que usan `@tailwindcss/vite` y `@tailwindcss/postcss`, no compila o deja una ruta que no llega a un archivo del paquete.

Una ruta rota no da error en el navegador: cae en silencio a la fuente de respaldo. Por eso se verifica en el paquete y no en el navegador.

**Licencia:** Ubuntu Font Licence 1.0. Permite redistribuir los archivos si viaja la licencia, que va en `dist/THIRD-PARTY-NOTICES.txt` (ver la sección siguiente).

### Licencia MIT y avisos de terceros

El DS se publica bajo MIT. Razones: es la licencia del ecosistema del que forma parte (React, Radix, Tailwind y casi todas sus dependencias), los equipos legales de los clientes la aceptan sin revisión, y el DS sigue siendo propiedad del autor aunque se use en proyectos de terceros. El `LICENSE` vive en la raíz del repo; npm lo incluye en el paquete aunque `files` solo liste `dist`.

`preserveModules` copia en `dist/node_modules` el código de las dependencias empaquetadas, pero no sus archivos de licencia. MIT e ISC (y Apache-2.0) solo permiten redistribuir si el aviso de copyright y de permiso viaja con el código, así que el build genera `dist/THIRD-PARTY-NOTICES.txt` con el nombre, la versión, la licencia y el texto de los `LICENSE`/`NOTICE` de cada paquete.

- **Generación:** el plugin `third-party-notices` de `vite.config.ts` toma los paquetes de los módulos del bundle. No necesita una devDependency: el build ya sabe qué archivo de `node_modules` empaquetó.
- **Fuentes:** los archivos de `dist/fonts/` no vienen de módulos del bundle sino de `src/fonts.css`. El plugin suma el paquete al que apuntan sus `url()` (hoy `@fontsource/ubuntu`, Ubuntu Font Licence 1.0).
- **Guardrail:** `scripts/verify-third-party-notices.mjs` corre en `npm run build`. Toma la lista de lo que hay en disco en `dist/node_modules` y `dist/fonts`, no de `package.json`, y falla si un paquete no tiene entrada. Cada archivo de `dist/fonts` se rastrea por su nombre hasta la `url()` de `src/fonts.css` que lo trae, y de ahí a su paquete. Así, una dependencia transitiva nueva o un archivo de fuente sin origen no se cuelan sin aviso.
- Un paquete sin archivo de licencia queda con la licencia, el autor y el repositorio que declara su `package.json`, y una nota que lo dice. El aviso no se inventa.

### Detección de vulnerabilidades

La detección responde tres preguntas por separado, cada una con su mecanismo:

- **Qué introduce un PR:** `actions/dependency-review-action`, dentro del job `verify`, solo en `pull_request`. Compara las dependencias del PR contra las de `main` y falla desde severidad high. Bloquea, porque el riesgo lo trae el propio PR.
- **Qué se volvió vulnerable sin cambios:** `npm audit --audit-level=high` sobre `main`, en un workflow semanal (`.github/workflows/audit.yml`) que también se puede lanzar a mano. Avisa, no bloquea: un aviso publicado contra una dependencia que nadie tocó no es responsabilidad del PR que esté abierto.
- **Quién propone el arreglo:** Dependabot (`.github/dependabot.yml`), solo con actualizaciones de seguridad. Las familias que se versionan juntas van en un mismo grupo, para que el arreglo no rompa sus peers exactos.

Razón: el audit dentro del check obligatorio no es determinista. El mismo commit pasa un día y falla al siguiente por avisos nuevos, sin relación con lo que cambia el PR. Precedente: el 2026-11-01, un aviso de Storybook bloqueó el PR #69, que solo cambiaba Markdown.

### Documentación publicada

Storybook se publica en GitHub Pages con `.github/workflows/storybook.yml` (`actions/upload-pages-artifact` y `actions/deploy-pages`), bajo el subpath `/core-ui-design-system/`. Requiere dos ajustes del repositorio: source "GitHub Actions" en Pages, y `main` y la regla de tag `v*` en la environment `github-pages`.

**Por qué Pages:** vive en el mismo repositorio y se despliega con OIDC, sin la cuenta ni el token de un servicio externo. Chromatic queda fuera de este flujo.

**Invariante: el sitio documenta solo la API publicada.** Quien lo lee debe poder usar lo que ve con `npm install`. Lo sostienen dos garantías, una por cada disparador, comprobadas en un job `check` que no instala nada:

- **El tag:** un push de `v*.*.*` construye ese tag, no el estado actual de `main`, y solo después de que esa versión esté en npm publicada desde ese commit (`gitHead`). `release.yml` corre sobre el mismo tag y puede seguir publicando, así que `check` consulta el registro hasta 40 minutos, más que el límite de 30 de `release.yml`. Falla sin esperar si el tag no coincide con `package.json#version` o si la versión ya está publicada desde otro commit. Si el tag falla al publicar, el sitio no cambia.
- **La guardia sobre `[Unreleased]`:** el disparo manual construye `main` y falla antes de instalar nada si el primer encabezado de versión del CHANGELOG es `[Unreleased]`, porque todo cambio para el consumidor deja ahí su entrada. También falla si la versión de `package.json` no está en npm, porque tras el merge de un PR de release el CHANGELOG ya abre con esa versión, aún sin publicar. Y falla si se lanza desde otro ref, porque la guardia solo tiene sentido sobre `main`. Sirve para corregir stories sin publicar una versión.

Cualquier error al consultar el registro cuenta como "no publicada": sin poder comprobarlo, no se despliega. Si el registro falló y la versión sí se publicó, se vuelve a correr el workflow.

**Por qué un workflow separado de `release.yml`:** una falla de la documentación no debe bloquear la publicación del paquete ni dejarla a medias. Además, los permisos de Pages no deben convivir con el trusted publishing de npm, y el sitio se puede volver a desplegar sin publicar nada. La dependencia va en un solo sentido: este workflow lee lo que `release.yml` publicó en el registro, y `release.yml` no sabe que existe. Dentro del workflow, solo el job `deploy` tiene `pages: write` e `id-token: write`: el job `build` ejecuta código de terceros (`npm ci`, el build de Storybook) solo con `contents: read`.

**Por qué el build de Storybook se verifica en `ci.yml` y no en `release.yml`:** en `ci.yml`, un PR que rompe la documentación falla antes de llegar a `main`, así que no se descubre recién al desplegar. En `release.yml` no corre por la misma razón por la que el workflow está separado: la documentación no bloquea la publicación.
