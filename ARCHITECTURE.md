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

Los tokens semánticos viven en `base`. Las utilidades de color (`bg-primary`, `text-primary-content`, etc.) se generan en `@theme` apuntando a estos tokens vía `var(...)` (ver el bloque `@theme` de `src/tailwind.css`), y a su vez cada token semántico apunta a un token `--palette-*` (`--primary: var(--palette-navy)`). Esa indirección es implementación interna: **`--palette-*` no es la superficie pública de override** — ver [README § Theming](./README.md#-4-theming-custom-properties) para la lista de tokens que sí lo son.

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

Por eso el override sin capa es el único patrón que se documenta como soportado — ver el bloque copy-paste y la lista completa de tokens en [README § Theming](./README.md#-4-theming-custom-properties).

## Hojas de estilos: `style.css` y `tailwind.css`

Qué hoja importar según el proyecto está en [README § Setup Inicial](./README.md#️-3-setup-inicial). Aquí va el porqué.

### `src/tailwind.css`: fuente única de tokens y capas base

`src/tailwind.css` contiene, en este orden:

- `@source "./"` y `@source not "./node_modules"` (ver abajo).
- `@plugin "tailwindcss-animate"`.
- `@theme { ... }`: la fuente (`--font-sans`), los colores (`--color-*: var(--token)`) y los radios.
- `@layer base { ... }`: los tokens `--palette-*` y los semánticos, tema claro y oscuro.
- `@layer base { ... }`: `--tw-ring-offset-color` para todo el DS y los estilos de `html` y `body`.

No contiene `@import 'tailwindcss'` ni la fuente. La importan dos lugares:

- **`src/index.css`**: fuente de Google Fonts + `@import 'tailwindcss'` + `@import './tailwind.css'`. De ahí salen `style.css` (`vite build`) y los estilos de Storybook (`.storybook/preview.ts`).
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

**Por qué `./tailwind.css` no trae la fuente**: así el consumidor elige cómo cargarla (con `next/font` se autoaloja) y la guardia no depende de la red.

## Versiones y tags

### Versionado

Una versión sin publicar acumula todos los PRs en una sola entrada del CHANGELOG, sin bumps intermedios. Antes de publicar, la entrada se reescribe con el **delta neto** contra la última versión publicada: solo lo que cambia para quien actualiza desde ella. No se narran regresiones que aparecieron y se arreglaron dentro de la misma versión; "Fixed" lista solo bugs que existían en la versión publicada anterior, y los cambios incompatibles van en "Changed" con su migración. En 0.x: minor para funcionalidad o cambios visuales, patch para fixes.

### Tags

- **Formato:** tag **anotado** `vX.Y.Z` (`git tag -a vX.Y.Z -m "vX.Y.Z"`), sobre el commit de `main` desde el que se publicó (el `gitHead` que registra el paquete: `npm view @abelardo-salazar/core-ui-design-system@X.Y.Z gitHead`).
- **Si el `gitHead` no está en `main`:** pasa cuando la historia de `main` se reescribió después de publicar, por ejemplo para cambiar metadatos de autor. El commit original sigue existiendo en GitHub, pero ya no está en ninguna rama. No se le pone tag: lo volvería a hacer visible con los datos que la reescritura quitó. El tag va sobre el commit de `main` con el mismo árbol, que es el mismo contenido publicado. Para encontrarlo y comprobarlo:

  ```bash
  git fetch origin <gitHead>                   # trae el commit original por SHA
  git rev-parse <gitHead>^{tree}               # árbol publicado
  git rev-parse <commit-de-main>^{tree}        # debe ser idéntico
  git merge-base --is-ancestor <commit-de-main> origin/main && echo en-main
  ```

  El candidato es el commit de `main` con el mismo título que el `gitHead`. Antes de poner el tag, verificar también que su `package.json` tenga la versión `X.Y.Z`.

- **Cuándo:** después de publicar, no antes. Un tag sin versión publicada apuntaría a algo que no existe en el registro.
- **Versiones anteriores:** `v0.4.1` y `v0.4.2` existen como tags ligeros (no anotados), creados antes de esta convención, y se dejan así. Igual que `v0.4.3`, `v0.4.4` y `v0.5.0` (anotados, creados después de publicar), apuntan al commit de `main` con el mismo árbol que su `gitHead`, porque la historia se reescribió después de publicarlas. Las versiones anteriores a 0.4.1 no tienen tag.
