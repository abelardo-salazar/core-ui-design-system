# Design System — Notas de arquitectura

Este documento reúne decisiones y mecanismos internos del design system que no son parte de la guía de uso para consumidores (esa vive en [README.md](./README.md)). Es referencia para quienes mantienen el paquete, no para quienes solo lo consumen.

## Theming: tokens y CSS Cascade Layers

### Dónde viven los tokens

Los tokens semánticos de color y radio (`--primary`, `--base-100`, `--error-focus`, etc.) están definidos en `src/index.css`, dentro de:

- `@layer base { :root {...} }` — valores por defecto (tema claro).
- `@layer base { :root:has(.dark), .dark {...} }` — overrides de tema oscuro.

El orden real de capas en el CSS compilado (Tailwind v4) es:

```
components < properties < theme < base < utilities
```

Los tokens semánticos viven en `base`. Las utilidades de color (`bg-primary`, `text-primary-content`, etc.) se generan en `@theme` apuntando a estos tokens vía `var(...)` (ver el bloque `@theme` al inicio de `src/index.css`), y a su vez cada token semántico apunta a un token `--palette-*` (`--primary: var(--palette-navy)`). Esa indirección es implementación interna: **`--palette-*` no es la superficie pública de override** — ver [README § Theming](./README.md#-4-theming-custom-properties) para la lista de tokens que sí lo son.

### Por qué el override recomendado es "CSS sin capa"

El mecanismo de override documentado para consumidores (CSS fuera de cualquier `@layer`, apuntando a `:root`/`.dark`) no es una convención arbitraria: es la única forma que, por especificación de CSS Cascade Layers, gana sobre cualquier `@layer` **sin importar el orden de import** entre la hoja de estilos del consumidor y la del paquete. Cualquier otra forma de override queda sujeta al orden de import entre ambas hojas.

Esto se verificó empíricamente (no solo por lectura de la spec) con Chromium real (Playwright) contra Storybook sirviendo el CSS compilado real del paquete, con `getComputedStyle` sobre un elemento con `background-color: var(--primary)`:

| Escenario | Resultado |
| --- | --- |
| Override sin capa, insertado *antes* del CSS del paquete en `<head>` | **Gana** (`#302b6e` → `#ff00ff`) |
| Override en `@layer base`, importado *después* del CSS del paquete | **Gana** (`#302b6e` → `#00ff00`) |
| Override en `@layer base`, importado *antes* del CSS del paquete | **No gana** — queda en `#302b6e`, el default del paquete |
| `:root {}` / `.dark {}` sin capa, alternando la clase `.dark` | Cambia correctamente en ambos temas |

Los cuatro resultados coincidieron exactamente con lo que predice la teoría de CSS Cascade Layers (ninguna sorpresa que documentar como excepción). El riesgo del segundo/tercer escenario es real y concreto: si un consumidor que también usa Tailwind pone su override dentro de su propio `@layer base` (siguiendo la convención de customización de tema de Tailwind), la capa `base` termina compartida por nombre entre ambas hojas, y el desempate pasa a ser el orden normal de cascada (última declaración en el documento gana) — ya no aplica la prioridad especial de "sin capa". Un reorden de imports, o un bump de dependencia que cambia cuándo se inyecta su CSS, puede invertir silenciosamente cuál de las dos gana.

Por eso el override sin capa es el único patrón que se documenta como soportado — ver el bloque copy-paste y la lista completa de tokens en [README § Theming](./README.md#-4-theming-custom-properties).

### `src/index.css` no cambia

Esta arquitectura ya funciona tal cual está; no requirió (ni requiere) cambios en `src/index.css`. El trabajo de esta sección fue documentar y verificar el mecanismo existente, no modificarlo.
