# Changelog

## [0.5.0] - 2026-10-04

### Added

- **`EmptyState`**, compuesto por `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription` y
  `EmptyStateActions`, todos server-safe. `size?: 'sm' | 'md'` (default `'md'`): `sm` para
  tablas y tarjetas, `md` para una página. `EmptyStateTitle` renderiza un `p` y acepta
  `as="h2"`…`"h6"` cuando el estado vacío encabeza una sección. El ícono es decorativo
  (`aria-hidden`). La raíz no tiene `role`: si el estado vacío aparece tras una acción (un
  filtro sin resultados), anunciarlo con `announce()`. El `className` de la raíz gana sobre el
  padding de `size`; en las partes, en cambio, los ajustes de `sm` ganan sobre el `className`
  (para cambiarlos, usar la misma variante: `group-data-[size=sm]/empty-state:…`).

- **`DataTable` gana `emptyState?: React.ReactNode`** para reemplazar el contenido de la fila
  vacía. Por defecto es un `EmptyState` `sm` con el título "No results." (ver Changed).

- **Textos por defecto configurables por prop**, todos opcionales y con el valor por defecto en
  inglés. Sin proveedor global: cada componente recibe sus textos, así los server-safe lo siguen
  siendo.
  - `SheetContent` y `DialogContent`: `closeLabel` (nombre accesible de la ✕, default `"Close"`).
  - `QuantityStepper`: `decrementLabel` / `incrementLabel` (default `"Decrease quantity"` /
    `"Increase quantity"`).
  - `DatePicker`: `dialogLabel` (nombre accesible del popover, default `"Choose date"`) y
    `locale` (`Locale` de `date-fns`), que se aplica a la fecha del disparador y al calendario
    (meses y días). Antes la fecha siempre salía en inglés. Con un locale de `date-fns`, las
    etiquetas de navegación del calendario ("Go to the Next Month") quedan en inglés; el locale
    de DayPicker (`import { es } from '@daypicker/react/locale/es'`) también las traduce y se
    acepta igual.
  - `DataTable`: `previousLabel` (default `"Previous"`), `nextLabel` (default `"Next"`) y
    `pageLabel: (page, total) => string` (default `Page X of Y`; `page` empieza en 1).
  - `SkipToContent`: usa `children` como texto si lo recibe (default `"Skip to content"`). Antes
    un `children` del consumidor se ignoraba.

- **`announce(message, { politeness?: 'polite' | 'assertive' })`**: anuncia un mensaje a los
  lectores de pantalla sin montar nada (default `'polite'`). La región no queda oculta con un
  `Dialog` o `Sheet` abierto; no se ha probado con un lector de pantalla real. No depende de
  que se haya importado el CSS del paquete. Repetir el mismo mensaje lo vuelve a anunciar, el
  texto se borra solo a los pocos segundos y en el servidor no hace nada. Pensado para
  confirmaciones ("Producto agregado") y resultados de acciones que no mueven el foco. Un
  `Alert` `info`/`success` que se monta dinámicamente no se anuncia: para eso, `announce()` o
  dejar el `Alert` montado y cambiar su contenido.

- **`VisuallyHidden`**: oculta contenido a la vista y lo deja disponible para los lectores de
  pantalla. Renderiza un `span`; `as` cambia el elemento (por ejemplo, `as="div"` para envolver
  un `SheetTitle` o `DialogTitle` que el diseño no muestra). Server-safe.

- **`SheetBody`: zona con scroll del `Sheet`.** Se coloca entre `SheetHeader` y `SheetFooter`:
  el contenido largo hace scroll dentro del body y header y footer quedan siempre visibles, en
  los cuatro lados. `top` y `bottom` ocupan como máximo el 85% del alto. Sin `SheetBody` el
  panel entero hace scroll y la ✕ se desplaza con el contenido; para migrar, envolver el bloque
  central en `<SheetBody>`. El panel y la ✕ respetan el safe area de los bordes que tocan el
  viewport si la app declara `viewportFit: 'cover'`, y el título de `SheetHeader` no queda
  debajo de la ✕ aunque haya muesca. La ✕ muestra el anillo de foco solo con teclado.

- **`Input` gana un botón de limpiar: `clearable`, `onClear?: () => void` y `clearLabel?: string`**
  (`aria-label` del botón, default `"Clear"`). Vaciar el campo dispara el `onChange` del
  consumidor (modo controlado, no controlado y `register` de react-hook-form); después se llama a
  `onClear` y el foco vuelve al input. El botón solo se ve mientras el campo tiene valor, también
  tras `reset()`/`setValue()` de RHF, y no aparece con `disabled` ni `readOnly`. No limpia con
  Escape, para no interferir con el cierre de un `Dialog`/`Sheet`. `endIcon` no se admite junto
  con `clearable`, y `onClear`/`clearLabel` no se admiten sin él (ver Changed). Los contenedores
  de `startIcon`/`endIcon` ganan `aria-hidden="true"`.

- **`Chip` gana una escala de tamaños propia: `size?: 'sm' | 'md' | 'lg'`** (default `'sm'`,
  compatible hacia atrás). `md` = 32px de alto; `lg` = 44px de alto, el tamaño táctil.

- **`Badge` gana una escala de tamaños propia** (`size?: 'sm' | 'md' | 'lg' | 'icon'`, default
  `'sm'`): `sm` ≈ 22px de alto, `md` ≈ 26px, `lg` ≈ 30px, `icon` = 24px exactos (cuadrado, sin
  padding horizontal — para un ícono o un número corto). Alturas = borde + padding vertical +
  line-height del propio `text-*` de cada escalón, sin `h-*` fijas (salvo `icon`), medidas a
  mano en Storybook con un navegador real.

- **`Badge` gana `interactive?: boolean`** (default `false`). Con `interactive`, `Badge`
  renderiza un `<button type="button">` real (foco, Enter/Space y `disabled` nativos del
  navegador, sin que `Badge` sintetice ningún handler) en vez de un `<div>`; `cursor-pointer`,
  el anillo de foco (`focus-visible:ring-2 ring-primary ring-offset-2`) y el hover por color
  solo existen en ese caso — antes vivían siempre en la base, eran CSS muerto en un `<div>` sin
  `tabIndex` (nunca dispara `:focus-visible`). `badgeVariants` (ya exportado) acepta
  `interactive: true` para que un consumidor estilice su propio `<a>`/`Link` con el mismo look;
  `Badge` no agrega `asChild` ni `href`. Un `Badge` interactivo compacto (~22px) no cumple el
  objetivo táctil de 44px — es para usos incidentales (una etiqueta que abre algo), no para
  controles táctiles (filtros): para eso está `Chip`, que ya mide 44px en `lg`.

- **`Button` gana `shape?: 'default' | 'pill'`** (default `'default'`). Con `shape="pill"`,
  `rounded-full` en vez de `rounded-btn` — combinado con `size="icon"` da un círculo de 44x44;
  el anillo de foco sigue la forma sin ningún cambio de código, porque usa el mismo
  border-radius del elemento. `rounded-btn` deja de vivir en la base de `buttonVariants` y pasa
  a ser solo el valor de `shape: 'default'` (mismo motivo que el fix de `Badge.size`: la base y
  una variante no deben aplicar el mismo grupo de utilidades a la vez) — los consumidores que
  llaman `buttonVariants({...})` sin pasar `shape` (`Calendar`, `SkipToContent`, `DatePicker`)
  siguen resolviendo a `rounded-btn` vía `defaultVariants`, sin cambios.

### Changed

- **Los textos por defecto de `DataTable` pasan a inglés.** `searchPlaceholder` (también nombre
  accesible de la búsqueda) pasa de `"Buscar..."` a `"Search..."`; el estado vacío, de
  "Sin resultados." a "No results."; la paginación, de "Anterior" / "Siguiente" /
  "Página X de Y" a "Previous" / "Next" / "Page X of Y". Para conservar los textos en
  español: `searchPlaceholder="Buscar..."`, `previousLabel="Anterior"`, `nextLabel="Siguiente"`,
  ``pageLabel={(page, total) => `Página ${page} de ${total}`}`` y un `emptyState` propio. Los
  tests que buscaban esos textos deben actualizarse.

- **El estado vacío por defecto de `DataTable` cambia de aspecto.** El texto ahora se
  ve como título (semibold, color de texto base) en vez de texto gris, y la fila es algo más
  alta. Para conservar el aspecto anterior, pasar un `emptyState` propio, por ejemplo
  `<span className="text-base-content/65">No results.</span>`.

- **`SheetContent` ahora separa sus hijos con 16px.** El `gap-4` de la base estaba desde antes,
  pero no hacía nada porque el panel no era flex; al pasar a `flex flex-col` se activa y afecta a
  los Sheets existentes. Quien compensaba la separación a mano (por ejemplo, con `py-4` en el
  bloque central) verá el espacio duplicado y debería quitar ese padding.

- **Rompe: `InputProps` pasa de `interface` a unión discriminada por `clearable`.** El uso de
  `<Input>` no cambia (`endIcon` sin `clearable` compila igual), pero hay dos casos que sí:
  - `interface X extends InputProps` deja de compilar (una interface no puede extender una
    unión). Migrar a `interface X extends InputBaseProps` (exportada).
  - `Omit<InputProps, K>` sigue compilando, pero en silencio pierde la exclusión
    `clearable`/`endIcon`: `Omit` no reparte sobre uniones. Migrar a un Omit por rama,
    `type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never`,
    o a `Omit<InputBaseProps, K>` si no hacen falta `clearable`/`endIcon`.

- **Rompe: el alto por defecto de `Badge` pasa de 32px a ~22px.** Era un efecto colateral del
  fix de abajo (`size` no hacía nada, así que el único resultado posible era 32px) — ahora que
  `size` es funcional, el default (`sm`) usa la escala propia y compacta de `Badge`, pensada
  para una etiqueta de estado, no copiada de `Button`. Para recuperar el aspecto anterior en un
  `Badge` puntual: `<Badge className="h-8 px-3">`.

- **Rompe: `<Badge onClick={fn}>` sin `interactive` ya no compila.** Antes compilaba y el click
  funcionaba, pero sobre un `<div>` sin foco por teclado ni semántica de botón (un bug de
  accesibilidad real, silencioso). `BadgeProps` es una unión discriminada por `interactive`,
  pero `Badge` también necesita dos firmas sobrecargadas (una por rama) para que esto se
  cumpla de verdad: con un único parámetro de tipo unión, el chequeo de propiedades sobrantes
  de JSX se relaja a "¿existe esta prop en ALGÚN miembro de la unión?", así que `onClick`/
  `disabled`/`type` (presentes en la rama de botón) igual colaban sin `interactive` — regresión
  real dentro de esta misma versión sin publicar, cubierta ahora con un test de tipos
  (`Badge.types.test-d.tsx`, compilado por `tsc -b`). Migrar a `<Badge interactive onClick={fn}>`,
  que renderiza un `<button>` real con foco/teclado/`disabled` correctos de fábrica.

- **Rompe: el hover y el anillo de foco de `Badge` ya no están presentes sin `interactive`.**
  Si algún consumidor dependía de esas clases en un `<div>` no-interactivo (poco probable, eran
  CSS muerto: nunca se veían al navegar por teclado), hay que agregar `interactive` o
  replicarlas a mano vía `className`.

- **Rompe: `Button` `size="md"`, `Input` `size="md"` y el trigger de `Select` pasan de 40px a
  44px de alto.** Los tres comparten la misma escala de alturas (son la misma familia de
  controles de formulario) y antes medían 40px — una fila con un botón `size="icon"` (ya 44px
  desde el fix de touch target) quedaba desalineada 4px contra su propio `Button` `md` al lado.
  Mover los tres a la vez mantiene la fila alineada en vez de romperla de un lado. `sm` (32px)
  y `lg` (48px) no cambian en `Button` ni en `Input`. Para recuperar el aspecto anterior en un
  uso puntual: `className="h-10"` (gana sobre la variante vía `twMerge`, igual que cualquier
  otro ajuste de tamaño por `className`).

### Fixed

- **`Image` podía quedarse invisible para siempre si la imagen fallaba o cargaba muy rápido.**
  Con la imagen en caché y el navegador ocupado, el resultado de la carga podía perderse: la
  imagen no se mostraba, el `fallback` tampoco y quedaba el `Skeleton`. Ahora el resultado se
  conserva siempre. Cambiar `src` sigue reiniciando el ciclo de carga.

- **`DatePicker` abre el calendario en el mes de la fecha elegida.** Antes abría siempre en el mes
  actual, aunque `date` estuviera en otro mes. Sin `date`, sigue abriendo en el mes actual.

- **El área táctil real del `Chip` era solo el texto**, sin importar el tamaño: el padding que
  da forma a la píldora vivía en el `<span>` raíz, que nunca es interactivo (evita anidar
  `<button>` dentro de `<button>`), mientras que el `Toggle`/botón de cierre de adentro no tenía
  padding propio. Tocar la píldora, fuera del texto mismo, no hacía nada. El padding ahora vive
  en el cuerpo (`Toggle`/`span`) y el botón de cierre pasa a tamaño explícito en `md`/`lg`
  (antes derivado del padding) — ambos cubren ahora el alto completo de la píldora y llegan a
  su borde exterior, en los tres tamaños. **`sm` es pixel-idéntico al aspecto histórico en todos
  los casos**, también con botón de cierre (`Removable`/`ToggleableAndRemovable`): la raíz
  reintroduce ahí, y solo ahí, el padding que necesitaba para no perder su tamaño, y el botón de
  cierre reclama esa zona como área de respuesta vía un `::after` invisible — sin agrandar su
  caja visual, así que el anillo de foco del botón de cierre también queda idéntico (círculo de
  24x24 en la misma posición). Verificado con bounding boxes A/B contra el commit previo a esta
  escala (`1be50ab`) en navegador real, con tres largos de texto distintos, y con
  `elementFromPoint` sobre la zona antes muerta.

- **El área de respuesta extendida no seguía la silueta de la píldora.** El `::after` del botón
  de cierre era un rectángulo: sus esquinas exteriores quedaban fuera de la curva redondeada de
  la píldora, así que un toque justo afuera del contorno visible, cerca de la esquina, disparaba
  `onRemove` igual (confirmado con `elementFromPoint` + geometría: un punto a distancia 18.8px
  del centro de la curva, con radio 14.6px, devolvía el botón). Ahora ese `::after` lleva
  `rounded-r-full`, que redondea solo sus dos esquinas derechas con el mismo radio que la raíz.

- **`sm` con Toggle y botón de cierre a la vez dejaba ~2px sin respuesta arriba/abajo del
  Toggle**, mientras que el botón de cierre sí los reclamaba: el Toggle solo se estira al alto
  de la fila (24px), no al interior completo de la raíz (que la raíz agranda con su `py-0.5`
  reintroducido). El Toggle gana ahora su propio `::after` (solo vertical, con `rounded-l-full`
  por el mismo motivo de silueta, del lado opuesto) para alcanzar la misma franja que el botón
  de cierre ya cubría.

- **`md`/`lg` con botón de cierre: el botón desbordaba el borde inferior de la raíz por ~1px y
  su ícono quedaba ~1px descentrado** — medido con `getBoundingClientRect` antes de corregir,
  no asumido: su altura explícita (`h-8`/`h-11`) no respondía a `items-stretch`, así que no se
  centraba con el Toggle (que sí se estira correctamente). Fix: se le quita la altura explícita
  (queda solo `w-8`/`w-11`), así se estira igual que el Toggle/body y queda centrado. Además,
  tanto el Toggle como el botón de cierre ganan en `md`/`lg` un `::after` que cubre el propio
  borde de 1px de la raíz (a diferencia de `sm`, donde ese borde queda deliberadamente fuera):
  en `lg`, el área de respuesta real de ambos alcanza así los 44px completos, el objetivo táctil
  de esta escala — no solo su caja visual, que por construcción mide ~1px menos que la raíz.
  `md`/`lg` no están publicados: este ajuste de ±1px en su reposo es una corrección, documentada
  acá, no un cambio de API.

- **La prop `size` de `Badge` era un no-op.** `Badge.tsx` desestructuraba `size` de las props
  pero nunca lo pasaba a `badgeVariants()` — `<Badge>`, `<Badge size="lg">` y
  `<Badge size="icon">` producían exactamente las mismas clases (el default de `cva`, una
  escala copiada 1:1 de `Button`, con la que además convivía sin resolver el padding propio de
  la base de `badgeVariants`). Confirmado renderizando el `Badge` real del `dist` publicado, no
  solo leyendo el código. `size` ahora llega a `cva` y usa la escala propia de `Badge` (ver
  Added) — el padding/alto/texto de cada tamaño ahora vive SOLO en la variante `size`, nunca
  también en la base, para no depender de que algo resuelva un conflicto entre ambos.

## [0.4.4] - 2026-10-04

### Fixed

- **`Checkbox`, `Switch` y `Badge` usaban `ring-ring`, una clase que no resuelve a ningún
  color** — `--ring`/`--color-ring` no están definidos en el sistema de tokens de este DS (es
  un resabio de la plantilla original de shadcn/ui, nunca traducido). En la práctica, `Checkbox`
  y `Switch` no mostraban ningún anillo de foco visible al navegar por teclado (falla de WCAG
  2.4.7 en dos controles de formulario centrales). Ahora usan `ring-primary`, la convención ya
  dominante en el resto del DS (`Button`, `Input`, `Select`, `Tabs`, `Dialog`, `DataTable`, etc.).

## [0.4.3] - 2026-09-12

### Fixed

- **`Button` sin `'use client'` rompía `next build` en el uso más inocente posible de `asChild`.**
  El hallazgo vino de un consumidor externo real: reprodujo `<Button asChild><a href="/">Ir</a></Button>`
  — **sin** `onClick`, **sin** `disabled`, **sin** `isLoading` — contra un Server Component real y
  `next build` falló con `Error: Event handlers cannot be passed to Client Component props`,
  apuntando puntualmente a `onClick: function onClick`.

  **Mecanismo (nuevo, distinto al de `0.3.15`/`0.4.1`):** dentro del branch `asChild` de
  `Button.tsx`, `handleClick` se construye **incondicionalmente** y se cuelga siempre de
  `onClick={handleClick}` sobre `Comp` (`Slot`) — ninguna combinación de props lo evita. Es la
  misma función que bloquea la interacción cuando el botón está `disabled`/`isLoading` (fix de
  una auditoría anterior sobre `asChild`); esa lógica es inherentemente de cliente, así que
  `Button` no podía seguir siendo server-safe tal como estaba diseñado. La rama nativa (sin
  `asChild`) es segura hoy sin `onClick` propio — `onClick={onClick}` reenvía `undefined` si el
  consumidor no pasa nada, y `undefined` sí es serializable —, pero al vivir en el mismo
  archivo hereda la directiva igual.

  **Fix:** `'use client'` en `src/components/Button/Button.tsx`, registrado en
  `scripts/client-entry-points.mjs`. No se tocó la lógica interna de `Button` (el guard de
  `disabled`/`isLoading`, `Slottable`, etc.) — es exclusivamente la directiva.

  **`Badge` quedó evaluado y descartado de este fix**, con el mismo método (reproducido sin
  `onClick` contra un Server Component real: compila limpio). Es pura passthrough de props —
  nunca construye una función propia —, mismo perfil de riesgo que `Card`/`Alert`/`Typography`
  (solo romperían si el consumidor les pasa un handler propio desde un Server Component, lo
  cual es un error del consumidor, no del componente). Queda para una tarea futura junto con
  esos otros, no agrupado con este fix.

  **Versiones publicadas afectadas: todas las que incluyen `Button` con `asChild`** (desde su
  introducción). Si consumís `Button` con `asChild` desde un Server Component de Next.js App
  Router, actualizá a `0.4.3`.

### Chore

- El guardrail `scripts/verify-client-directives.mjs` gana un nuevo chequeo en su modo por
  defecto (mismo criterio de severidad: falla el build, no es solo un warning): detecta un
  archivo `.tsx` de `src/components/` sin `'use client'` que (a) declara una función
  localmente (`const nombre = (...) => {...}` o `function nombre(...) {...}`) y (b) usa ese
  mismo identificador como valor de un prop con forma de handler (`/^on[A-Z]/`) en algún punto
  del archivo — el patrón exacto que tenía `Button` (`handleClick` definido y después usado en
  `onClick={handleClick}`), a diferencia de un passthrough seguro como `onClick={onClick}`
  (ahí el identificador es un prop desestructurado, no una función declarada en el archivo).
  Heurística estática, no perfecta (no cubre `useCallback`/wrappers, y puede requerir juicio
  humano en falsos positivos) — corrida como regresión contra los componentes existentes: no
  generó falsos positivos y, restaurada al estado pre-fix, sí detectó `Button`. El check de
  `0.3.15` solo validaba que `CLIENT_ENTRY_POINTS` estuviera sincronizado con quién _ya_
  declara `'use client'`; este cubre el caso de un componente que _debería_ declararlo pero no
  lo hace.

### Acción recomendada

Si usás `Button` con `asChild` desde un Server Component (Next.js App Router u otro entorno
RSC), actualizá a `0.4.3`.

## [0.4.2] - 2026-09-06

### Fixed

- **`@tanstack/react-table` estaba pineado a la versión exacta `9.1.2` en
  `peerDependencies`**, así que cualquier consumidor con una versión más nueva instalada
  (el registro ya publicó `9.2.4`) fallaba el `npm install` con `ERESOLVE`. Ahora es `^9.1.2`
  — mismo estilo caret que el resto de los peers. El pin exacto había sido cautela por lo
  nueva que era la v9 al integrarla; verificado que `9.2.4` pasa la suite completa (test,
  build, tsc, lint) sin cambios en `DataTable`, la API que usa (`useTable`, `tableFeatures`,
  `table.state`, `row.getAllCells`, `columnFilteringFeature`/`globalFilteringFeature`) no
  cambió entre `9.1.2` y `9.2.4`.

### Chore

- `package-lock.json`: sincronizada la versión raíz (había quedado en `0.3.15`; los releases
  `0.4.0`/`0.4.1` no la actualizaron).

## [0.4.1] - 2026-09-06

### Fixed

- **El barrel raíz publicado (`dist/index.js`) arrastraba `recharts` y dejaba de ser seguro
  para React Server Components.**
  `recharts` (`ResponsiveContainer.js`) llama `createContext(...)` a nivel de módulo, y
  `createContext` no existe en el entorno `react-server` de Next.js. Cualquier consumidor del
  App Router que importara **cualquier cosa** del paquete desde un Server Component —
  `Container`, `Badge`, `Card`, lo que sea, sin tocar `Chart` para nada — se topaba con
  `TypeError: (0 , f.createContext) is not a function` al hacer `next build` ("Failed to
  collect page data"). No era un problema de `Chart`: era el paquete entero roto para RSC.

  **Mecanismo (nuevo, distinto al de `0.3.15`):** `src/components/Chart/ChartPrimitives.ts`
  era el único archivo de todo `src/components/` que es 100 % re-export sin código propio
  (`export { BarChart, ... } from 'recharts'`). Rollup, en vez de darle su propio chunk
  preservado bajo `dist/components/Chart/`, lo **plegó dentro de `dist/index.js`** — metiendo
  16 imports directos a submódulos de `recharts` (ninguno con `'use client'`) en el archivo
  que todo consumidor importa. El guardrail de `'use client'` de `0.3.15` nunca lo detectó:
  solo escanea `src/components/*.tsx` contra su `dist/` correspondiente, jamás miró
  `dist/index.js`. Cada componente de `Chart` por separado (`ChartContainer.js`, etc.) tenía
  su directiva correcta — el archivo inseguro era el barrel.

  **Fix:** `Chart` sale del barrel raíz y pasa a un segundo entry point de build, expuesto
  como el subpath `./charts`:

  ```tsx
  // antes (0.4.0) — rompía el paquete entero para RSC
  import { ChartContainer, BarChart } from '@abelardo-salazar/core-ui-design-system';

  // ahora (0.4.1+)
  import { ChartContainer, BarChart } from '@abelardo-salazar/core-ui-design-system/charts';
  ```

  `dist/index.js` queda 100 % libre de `recharts` (verificado: `head -1` ya no es un import
  de `recharts`, y `grep recharts dist/index.js` da 0). `dist/charts.js` lleva `'use client'`
  en su cabecera — es client-only completo, no necesita el tratamiento granular por
  componente del barrel. **No se tocó el comportamiento de ningún componente de `Chart`**: es
  exclusivamente una reestructuración de build/exports.

  **Versiones publicadas afectadas: `0.4.0` únicamente.** `Chart` no existía en ninguna
  versión publicada anterior, así que `0.3.x` y previas no están afectadas por este bug.

### Chore

- El guardrail `scripts/verify-client-directives.mjs` gana un modo `--post-build` (corre
  después de `vite build`, dentro de `npm run build`): recorre el grafo de imports relativos
  alcanzables desde `dist/index.js` y falla si alguno importa `recharts`. El check de
  `0.3.15` validaba `src/components/*.tsx` → su `dist/`; este valida el barrel raíz, que es
  el archivo que un consumidor real importa y el que estaba roto.

### Docs

- `README.md`: documentado el nuevo patrón de import — `Chart` desde
  `@abelardo-salazar/core-ui-design-system/charts`, separado del import principal.

### Acción recomendada

Si instalaste `@abelardo-salazar/core-ui-design-system@0.4.0` y lo consumís desde Next.js App
Router (o cualquier entorno RSC), actualizá a `0.4.1`. Si usás `Chart`, además cambiá el
import a `@abelardo-salazar/core-ui-design-system/charts`.

## [0.4.0] - 2026-08-31

### Added

- **`Alert`** — aviso inline persistente (no-modal), variantes `info`/`success`/`warning`/`error`, subcomponentes `<AlertTitle>` y `<AlertDescription>`.
- **`DropdownMenu`** — menú de acciones sobre Radix: items normales, checkbox, radio group, label y separador.
- **`Tabs`** — navegación por pestañas sobre Radix (`<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`).
- **`Table`** — 8 primitivos HTML de tabla estilizados (`<Table>`, `<TableHeader>`, `<TableBody>`, `<TableFooter>`, `<TableRow>`, `<TableHead>`, `<TableCell>`, `<TableCaption>`).
- **`DataTable`** — tabla con sorting, filtro global y paginación sobre `@tanstack/react-table` v9.
- **`Chart`** — charts Bar/Line/Area/Pie/Ring sobre `recharts` (bundleado, no peerDependency); `ChartContainer`, `ChartTooltipContent`, `ChartLegendContent` + re-exports de recharts.
- **`QuantityStepper`** — control numérico +/- compuesto sobre `Button` e `Input`.

### Fixed

- **Áreas táctiles mínimas** en el cierre de `Dialog`/`Sheet`, el botón de quitar de `Chip` y los `Button` de solo icono.
- **`Tooltip` en táctil** — `TooltipContent` ya no se muestra en punteros gruesos (coarse-pointer), donde no hay hover y se disparaba de forma inconsistente.
- **`DataTable` — header de ordenamiento** ahora expone focus ring visible y color de icono `primary` al foco de teclado.
- **`Table` / `DataTable` — modo responsive** que colapsa la tabla a tarjetas por fila en viewports angostos, integrado en `DataTable`.

### Chore

- Resueltas las 26 vulnerabilidades de `npm audit` (todas en `devDependencies`; árbol publicado sin cambios).
- Agregado workflow de CI (GitHub Actions): lint, typecheck, build (con guardrail de `'use client'`), tests y `npm audit` en cada pull request y push a `main`.

### Docs

- Reescritura completa del `README.md`: contenido desactualizado corregido y componentes + `peerDependencies` faltantes documentados.

## [0.3.15] - Sin publicar

### Fixed

- **`'use client'` faltante en `dist/` para `Popover`, `Calendar`, `DatePicker` y `Progress`.**
  Estos cuatro componentes declaran `'use client'` en su código fuente, pero el build
  (`preserveModules` + reinyección manual vía `CLIENT_ENTRY_POINTS` en `vite.config.ts`) no
  los tenía registrados, así que la directiva se perdía en el `dist/` publicado. Cualquier
  consumidor de Next.js App Router que use alguno de estos componentes desde un Server
  Component se topa con el error estándar de RSC ("no se puede usar un hook / componente de
  cliente sin `'use client'`").

  **Versiones publicadas afectadas: `0.3.13` y `0.3.14`** (verificado extrayendo los tarballs
  reales del registro, no solo el historial de git). `0.3.12` y anteriores no están afectadas
  porque ninguno de estos cuatro componentes existía todavía en esa versión.

  `Chip` e `Image` tienen el mismo problema en el código fuente actual de `main`, pero
  **nunca llegaron a publicarse** (se agregaron después del último publish, `0.3.14`) — no
  hay ninguna versión en producción con `Chip`/`Image` rotos; salen arreglados desde su
  primer publish.

- **`@radix-ui/react-popover` y `@radix-ui/react-progress` vendorizados como copia privada
  dentro de `dist/node_modules/` en vez de resolverse como `peerDependency`.** Estaban en
  `peerDependencies` de `package.json` pero faltaban en `rollupOptions.external` de
  `vite.config.ts`, así que Rollup los empaquetaba dentro del propio `dist/` en vez de
  dejarlos como import externo. Esas copias vendorizadas, al pasar por el mismo pipeline de
  build, también perdían su `'use client'` original — mismo síntoma final (error de RSC),
  causa distinta. Afecta a las mismas versiones publicadas (`0.3.13`, `0.3.14`).

### Chore

- Agregado `scripts/verify-client-directives.mjs`, que corre como parte de `npm run build` y
  falla si algún componente con `'use client'` en su fuente no está registrado en
  `CLIENT_ENTRY_POINTS` — para que este bug no se repita silenciosamente en un futuro
  componente.

### Acción recomendada

Si instalaste `@abelardo-salazar/core-ui-design-system@0.3.13` o `@0.3.14` y usás `Popover`,
`Calendar`, `DatePicker` o `Progress` desde un Server Component, actualizá a `0.3.15` o
posterior.
