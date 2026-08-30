# Core UI Design System

<!-- El badge de versión se actualiza a mano en cada bump (ver "version" en package.json) —
     no hay automatización que lo sincronice. Si tocás package.json#version, actualizá esta
     línea en el mismo commit. -->
![Version](https://img.shields.io/badge/version-0.3.15-blue.svg)
![React](https://img.shields.io/badge/react-19.0.0+-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9+-3178C6.svg)
![Private](https://img.shields.io/badge/registry-private-red.svg)

**Core UI** es la biblioteca de componentes oficial para nuestros productos digitales. Construida sobre **React 19**, **Radix UI** y **Tailwind CSS v4**, ofrece componentes accesibles (A11y), ligeros y listos para producción.

---

## 🔒 1. Configuración de Autenticación (Requerido)

Este paquete está alojado en el **GitHub Package Registry (Privado)**. Para instalarlo, debes configurar tu entorno local.

### Paso A: Generar Token

Necesitas un **GitHub Personal Access Token (Classic)** con permisos de `read:packages`.

### Paso B: Configurar Proyecto

Crea un archivo `.npmrc` en la raíz de tu proyecto (junto al `package.json`) y agrega las siguientes líneas:

```ini
@abelardo-salazar:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=TU_GITHUB_TOKEN_AQUI
```

> ⚠️ **IMPORTANTE:** Asegúrate de agregar `.npmrc` a tu `.gitignore` para no exponer tu token.

---

## 📦 2. Instalación

Una vez configurado el `.npmrc`, instala la librería como cualquier dependencia:

```bash
npm install @abelardo-salazar/core-ui-design-system
```

### Peer Dependencies

El paquete declara React, Radix UI, TanStack Table y Sonner como `peerDependencies` — tu proyecto debe instalarlos aparte (evita instancias duplicadas y permite que Next.js resuelva sus propias directivas `'use client'`). Instalá el set completo:

```bash
npm install react@^19.0.0 react-dom@^19.0.0 \
  @radix-ui/react-avatar@^1.1.11 \
  @radix-ui/react-checkbox@^1.3.3 \
  @radix-ui/react-dialog@^1.1.15 \
  @radix-ui/react-dropdown-menu@^2.1.24 \
  @radix-ui/react-popover@^1.1.23 \
  @radix-ui/react-progress@^1.1.16 \
  @radix-ui/react-select@^2.2.6 \
  @radix-ui/react-switch@^1.2.6 \
  @radix-ui/react-tabs@^1.1.21 \
  @radix-ui/react-toggle@^1.1.18 \
  @radix-ui/react-tooltip@^1.2.16 \
  @tanstack/react-table@9.1.2 \
  sonner@^2.0.7
```

> `recharts` (usado por `Chart`) **no** es peerDependency: viene bundleado dentro del propio paquete, no hace falta instalarlo aparte.

---

## ⚙️ 3. Setup Inicial

Para que los estilos de Tailwind y las fuentes funcionen correctamente, debes importar la hoja de estilos **una sola vez** en el punto de entrada de tu aplicación (ej. `main.tsx`, `App.tsx` o `layout.tsx`).

```tsx
// main.tsx
import '@abelardo-salazar/core-ui-design-system/style.css'; // 👈 Importante

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

---

## 📚 Contenido

- [Core UI Design System](#core-ui-design-system)
  - [🔒 1. Configuración de Autenticación (Requerido)](#-1-configuración-de-autenticación-requerido)
    - [Paso A: Generar Token](#paso-a-generar-token)
    - [Paso B: Configurar Proyecto](#paso-b-configurar-proyecto)
  - [📦 2. Instalación](#-2-instalación)
    - [Peer Dependencies](#peer-dependencies)
  - [⚙️ 3. Setup Inicial](#️-3-setup-inicial)
  - [📚 Contenido](#-contenido)
  - [🧩 4. Documentación de API](#-4-documentación-de-api)
    - [🧱 Átomos (Fundamentos)](#-átomos-fundamentos)
    - [Button — Uso y Props](#button--uso-y-props)
    - [Avatar — Uso y Props](#avatar--uso-y-props)
    - [Typography — Uso y Props](#typography--uso-y-props)
    - [Badge — Uso y Props](#badge--uso-y-props)
    - [Skeleton — Uso y Props](#skeleton--uso-y-props)
    - [Chip — Uso y Props](#chip--uso-y-props)
    - [Image — Uso y Props](#image--uso-y-props)
    - [🧬 Moléculas (Estructura)](#-moléculas-estructura)
    - [Layout — Uso y Props](#layout--uso-y-props)
    - [Card — Uso y Props](#card--uso-y-props)
    - [Dialog — Uso y Props](#dialog--uso-y-props)
    - [Sheet — Uso y Props](#sheet--uso-y-props)
    - [AspectRatio — Uso y Props](#aspectratio--uso-y-props)
    - [Tabs — Uso y Props](#tabs--uso-y-props)
    - [🔲 Overlays](#-overlays)
    - [Popover — Uso y Props](#popover--uso-y-props)
    - [Tooltip — Uso y Props](#tooltip--uso-y-props)
    - [DropdownMenu — Uso y Props](#dropdownmenu--uso-y-props)
    - [📝 Formularios (Forms)](#-formularios-forms)
    - [Checkbox — Uso y Props](#checkbox--uso-y-props)
    - [Input — Uso y Props](#input--uso-y-props)
    - [Textarea — Uso y Props](#textarea--uso-y-props)
    - [Select — Uso y Props](#select--uso-y-props)
    - [Switch — Uso y Props](#switch--uso-y-props)
    - [Calendar — Uso y Props](#calendar--uso-y-props)
    - [DatePicker — Uso y Props](#datepicker--uso-y-props)
    - [📢 Feedback (Notificaciones)](#-feedback-notificaciones)
    - [Toast — Uso y Props](#toast--uso-y-props)
    - [Progress — Uso y Props](#progress--uso-y-props)
    - [ProgressRing — Uso y Props](#progressring--uso-y-props)
    - [Alert — Uso y Props](#alert--uso-y-props)
    - [📊 Datos](#-datos)
    - [Table — Uso y Props](#table--uso-y-props)
    - [DataTable — Uso y Props](#datatable--uso-y-props)
    - [Chart — Uso y Props](#chart--uso-y-props)
  - [💻 Desarrollo Local](#-desarrollo-local)

---

## 🧩 4. Documentación de API

### 🧱 Átomos (Fundamentos)

| Componente  | Descripción                   | Props clave                                                                                 |
| :---------- | :----------------------------- | :------------------------------------------------------------------------------------------ |
| `Button`    | Botón interactivo polimórfico | `variant`, `size`, `isLoading`, `asChild`, `fullWidth`, `startIcon`, `endIcon`, `className` |
| `Heading`   | Títulos semánticos            | `level`, `as`, `className`                                                                  |
| `Text`      | Párrafos y texto cuerpo       | `size`, `weight`, `as`, `className`                                                         |
| `Badge`     | Etiquetas de estado           | `variant`, `size`, `className`                                                              |
| `Avatar`    | Imagen de perfil con fallback | `src`, `alt`, `fallback`, `className`                                                       |
| `Separator` | Divisor visual                | `orientation`, `className`                                                                  |
| `Skeleton`  | Placeholder de carga          | `className`                                                                                 |
| `Chip`      | Etiqueta toggleable/removible | `variant`, `pressed`, `defaultPressed`, `onPressedChange`, `onRemove`, `removeLabel`         |
| `Image`     | Imagen con estado de carga/error | `src`, `alt`, `fallback`, `containerClassName`                                            |

### Button — Uso y Props

- **Exports:** `Button`.
- **Props principales:**
  - `variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'` — define el estilo visual (ver `buttonVariants.ts`).
  - `size?: 'sm' | 'md' | 'lg' | 'icon'` — define la altura y el padding.
  - `isLoading?: boolean` — muestra un spinner (`ReloadIcon`) y deshabilita la interacción.
  - `asChild?: boolean` — usa `@radix-ui/react-slot` para renderizar un elemento distinto (p. ej. `<a>`) preservando estilos.
  - `startIcon?: React.ReactNode`, `endIcon?: React.ReactNode` — iconos antes/después del texto.
  - `fullWidth?: boolean` — si es `true` aplica `w-full`.
  - `className?: string` y todos los `React.ButtonHTMLAttributes<HTMLButtonElement>` estándar.

La implementación usa `class-variance-authority` (`buttonVariants`) para combinar variantes y tamaños. Variantes por defecto: `variant: 'primary'`, `size: 'md'`.

> **Nota sobre `variant="destructive"` y el token `--error-focus-content`:** en primary/secondary/accent/neutral, tanto el color base como su `-focus` (hover) son oscuros en modo claro, así que un solo `-content` (blanco) sirve como color de texto para los dos estados. `error` es el único color del sistema donde eso no es cierto: el base (`--error`, `#ef4444`) es claro pero el `-focus` (`--error-focus`, `#b91c1c` en claro / `#f87171` en oscuro) es oscuro — la relación se invierte. Por eso `destructive` es la única variante que necesita `hover:text-error-focus-content` además de `hover:bg-error-focus`; sin ese token, el texto (`text-error-content`, negro) cae a 3.25:1 sobre el fondo de hover. No es un descuido de copiar/pegar de las otras variantes — no lo agregues a primary/secondary/accent/neutral, ahí un solo `-content` ya cubre ambos estados. Ver `src/index.css` para el detalle y el cálculo de contraste en ambos temas.

Uso (ejemplos):

```tsx
// 1. Básico
<Button variant="primary">Guardar</Button>

// 2. Loading
<Button isLoading>Guardando...</Button>

// 3. Con iconos
<Button startIcon={<svg>...</svg>}>Ajustes</Button>

// 4. Polimórfico: renderizar como enlace
<Button asChild>
  <a href="https://example.com" target="_blank" rel="noreferrer">Ir a Example</a>
</Button>

// 5. Full width
<Button fullWidth>Enviar</Button>
```

Nota: controla apariencia y tamaño via `variant`, `size` y `className`. Si `asChild` es `true`, `Button` no renderiza un `button` nativo sino el elemento hijo con los estilos aplicados.

### Avatar — Uso y Props

- **Exports:** `Avatar`, `AvatarImage`, `AvatarFallback`.
- **`Avatar`**: Root wrapper. Props: `className?: string` y acepta los props del `@radix-ui/react-avatar` Root (por ejemplo `children`, `style`). Usa Tailwind para controlar tamaño (ej. `h-12 w-12`).
- **`AvatarImage`**: Props principales: `src?: string`, `alt?: string`, `className?: string`. Renderiza la imagen y usa `object-cover` para ajustar al contenedor.
- **`AvatarFallback`**: Props: `children?: React.ReactNode` (por ejemplo iniciales) y `className?: string`. Se muestra cuando la imagen no carga.

Uso (ejemplos):

```tsx
// 1. Básico
<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

// 2. Fallback si la imagen falla
<Avatar>
  <AvatarImage src="/broken-image.jpg" alt="@user" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// 3. Tamaño personalizado via Tailwind
<Avatar className="h-12 w-12">
  <AvatarImage src="https://github.com/google.png" alt="Google" />
  <AvatarFallback>GL</AvatarFallback>
</Avatar>
```

Nota: controla el tamaño y la apariencia via `className` en el `Avatar` root; los subcomponentes respetan estilos inherentes y clases adicionales.

### Typography — Uso y Props

- **Exports:** `Heading`, `Text`.
- **`Heading` Props principales:**
  - `level?: 'h1' | 'h2' | 'h3' | 'h4'` — controla la variante visual (tamaños/estilos definidos en `headingVariants`).
  - `as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'` — renderiza un elemento HTML distinto al nivel por defecto.
  - `className?: string` y `React.HTMLAttributes<HTMLHeadingElement>` estándar.

- **`Text` Props principales:**
  - `size?: 'sm' | 'md' | 'lg' | 'lead' | 'muted'` — controla tamaño y leading (ver `textVariants`).
  - `weight?: 'normal' | 'medium' | 'bold'` — controla el peso tipográfico.
  - `as?: React.ElementType` — renderizar como otro elemento (`p`, `span`, `div`, etc.).
  - `className?: string` y `React.HTMLAttributes<HTMLElement>` estándar.

Descripción: componentes tipográficos reutilizables que combinan `class-variance-authority` con utilidades Tailwind para ofrecer variantes semánticas y visuales consistentes. `Heading` expone variantes por `level` y permite cambiar el elemento HTML con `as`. `Text` proporciona tamaños y pesos para párrafos y texto contextual.

Uso (ejemplos):

```tsx
// Heading: usa 'level' para variantes visuales o 'as' para el tag semántico
<Heading level="h1">Product Design</Heading>
<Heading level="h2" as="h3">Section title (visual h2, semantic h3)</Heading>

// Text: control de tamaño y peso
<Text size="sm">Pequeño texto auxiliar</Text>
<Text size="md">Texto por defecto</Text>
<Text size="lead">Lead paragraph con mayor tamaño</Text>
<Text size="muted" weight="medium" className="text-base-content">Texto muted</Text>

// Usar 'as' para cambiar el elemento
<Text as="span" className="font-medium">Inline label</Text>
```

Nota: usa `className` para ajuste fino (color, margen, tracking). Para mantener semántica y accesibilidad, elige `as` y `level` de forma coherente (por ejemplo `level="h2"` para secciones principales).

### Badge — Uso y Props

- **Exports:** `Badge`.
- **Props principales:**
  - `variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'` — define el estilo visual.
  - `size?: 'sm' | 'md' | 'lg' | 'icon'` — define la altura y el padding (mismos nombres de tamaño que `Button`; default `'sm'`).
  - `className?: string` — clases adicionales (p. ej. para tamaño, espaciado o tipografía).
  - Acepta `React.HTMLAttributes<HTMLDivElement>` (eventos y atributos HTML estándar).

La implementación usa `class-variance-authority` con variantes definidas en `badgeVariants.ts`. Las variantes por defecto son `variant: 'default'`, `size: 'sm'`.

> **Nota sobre `variant="destructive"` y el token `--error-focus-content`:** mismo caso que `Button` (`variant="destructive"`) — `error` es el único color del sistema donde el base es claro y su `-focus` (hover) es oscuro, así que el texto necesita un `-focus-content` propio (`hover:text-error-focus-content`) distinto del `-content` del estado base. Ver la nota en la sección de `Button` y `src/index.css` para el detalle completo.

Uso (ejemplos):

```tsx
<div className="flex gap-2">
  <Badge>Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Removed</Badge>
  <Badge variant="outline">Outline</Badge>
  <Badge variant="ghost">Ghost</Badge>
</div>

// Personalizar tamaño/alto
<Badge className="text-[10px] px-1 py-0 h-5">Small</Badge>
```

Nota: usa `className` para ajustar padding/alto/texto; `badgeVariants` ya aplica `inline-flex`, `rounded-full`, `px-2.5 py-0.5` y utilidades de enfoque.

### Skeleton — Uso y Props

- **Exports:** `Skeleton`.
- **Props principales:**
  - `className?: string` — define ancho/alto, border-radius y utilidades Tailwind para personalizar el placeholder.
  - Acepta `React.HTMLAttributes<HTMLDivElement>` (eventos y atributos HTML estándar).

Descripción: componente ligero para placeholders en estados de carga. Aplica por defecto `animate-pulse rounded-md bg-base-300` — usa el token del DS (no un gris fijo), así que responde solo a modo oscuro sin necesitar una variante `dark:` explícita. Se usa para simular bloques de texto, imágenes o botones mientras se cargan datos. Para evitar salto de layout se recomienda usar patrones de carga que reserven el espacio final (por ejemplo, usar la estructura de `Card`).

Uso (ejemplos):

```tsx
// 1. Básico — placeholder inline o bloque
<Skeleton className="w-[100px] h-[20px] rounded-full" />

// 2. Patrón: tarjeta de carga (usar la estructura real de la Card)
<Card className="w-[350px]">
  <CardHeader className="gap-2">
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-4/5" />
  </CardHeader>

  <CardContent>
    <Skeleton className="h-[150px] w-full rounded-md" />
  </CardContent>

  <CardFooter>
    <Skeleton className="h-10 w-28" />
  </CardFooter>
</Card>

// 3. Patrón: lista de avatares + texto
<div className="flex flex-col space-y-6">
  {Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ))}
</div>
```

Nota: usa `className` para ajustar dimensiones y `rounded-*` según el patrón (avatar, tarjeta, líneas de texto). Combina `Skeleton` con los contenedores reales (por ejemplo `Card`) para mantener el layout estable durante la carga.

### Chip — Uso y Props

- **Exports:** `Chip`.
- **Props principales:**
  - `variant?: 'default' | 'secondary' | 'outline' | 'ghost'` — estilo visual base (ver `chipVariants.ts`).
  - `pressed?: boolean` / `defaultPressed?: boolean` — toggle controlado / no controlado.
  - `onPressedChange?: (pressed: boolean) => void`.
  - `onRemove?: () => void` — si se pasa, agrega un botón de cierre (✕) independiente del cuerpo del chip.
  - `removeLabel?: string` (default `'Remove'`) — label accesible del botón de cierre.
  - `disabled?: boolean`.
  - `className?: string` y `React.HTMLAttributes<HTMLSpanElement>` (menos `onSelect`, reservado).

**Comportamiento no obvio:** el cuerpo del Chip solo se vuelve interactivo (un `@radix-ui/react-toggle` real) si el consumidor participa del protocolo `pressed`/`defaultPressed`/`onPressedChange` — si no se pasa ninguno, el cuerpo es texto plano (`<span>`), sin foco ni rol de botón. El botón de cierre (`onRemove`) nunca queda anidado dentro del cuerpo: son dos elementos interactivos hermanos e independientes (anidar un `<button>` dentro de otro `<button>`/Toggle sería HTML inválido), cada uno con su propio foco — `Tab` los separa.

Uso (ejemplos, extraídos de `Chip.stories.tsx`):

```tsx
// 1. Estático — sin Toggle ni botón de cierre
<Chip>Static</Chip>

// 2. Toggleable — cuerpo interactivo vía Radix Toggle real
<Chip
  defaultPressed={false}
  onPressedChange={(pressed) => console.log(pressed)}
  variant="outline"
>
  Design
</Chip>

// 3. Removable — un único botón de cierre, sin Toggle
<Chip onRemove={() => console.log('removed')}>Design</Chip>

// 4. Ambos — Toggle + botón de cierre, cada uno con su propio foco
<Chip
  defaultPressed={false}
  onPressedChange={(pressed) => console.log(pressed)}
  onRemove={() => console.log('removed')}
>
  Design
</Chip>
```

Nota: el estado "on" del Toggle siempre gana sobre `variant` (`has-[[data-state=on]]:bg-primary`), mismo criterio que usan `Switch`/`Checkbox` para "esto está activo".

### Image — Uso y Props

- **Exports:** `Image`.
- **Props principales:**
  - `fallback?: React.ReactNode` — nodo a mostrar si la imagen falla al cargar (patrón compositivo, igual que `AvatarFallback`).
  - `containerClassName?: string` — clases para el contenedor que envuelve el `<img>` y los estados de carga/error.
  - Acepta `React.ImgHTMLAttributes<HTMLImageElement>` (`src`, `alt`, `className`, etc.).

**Comportamiento no obvio:** mientras carga, muestra un `Skeleton` cubriendo el contenedor. Si la carga falla y no se pasó `fallback`, **no renderiza nada** — no hornea un ícono de "imagen rota" por default; es una decisión explícita, no un olvido. El `<img>` se desmonta al fallar (si no, quedaría invisible pero seguiría en el DOM). Si cambia `src`, vuelve a pasar por el ciclo completo de carga en vez de conservar el estado de la imagen anterior. Requiere `'use client'` (a diferencia de `Avatar`, no hay una primitiva de Radix disponible para una imagen rectangular; el estado de carga/error solo se puede conocer vía `onLoad`/`onError` del `<img>` nativo). Pensada para usarse dentro de `AspectRatio` u otro contenedor con tamaño explícito — llena `h-full w-full` de su contenedor.

Uso (ejemplos, extraídos de `Image.stories.tsx`):

```tsx
// 1. Ciclo completo: Skeleton mientras carga -> imagen visible al cargar
<div className="h-32 w-32">
  <Image src="/photo.jpg" alt="Loaded photo" />
</div>

// 2. Error con fallback (compositivo, como AvatarFallback)
<div className="h-32 w-32">
  <Image
    src="/broken-image.jpg"
    alt="Broken"
    fallback={<span className="flex h-full w-full items-center justify-center bg-base-200 text-xs">No image</span>}
  />
</div>

// 3. Error sin fallback: no renderiza nada (comportamiento mínimo documentado)
<div className="h-32 w-32">
  <Image src="/broken-image.jpg" alt="Broken" />
</div>
```

### 🧬 Moléculas (Estructura)

| Componente      | Descripción                | API & Composición                                                                                                  |
| ---------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **`Card`**      | Contenedor de información. | **Subcomponentes:** `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`            |
| **`Dialog`**    | Modal accesible.           | `open`: boolean; `onOpenChange`: (open: boolean) => void; **Subcomponentes:** `<DialogTrigger>`, `<DialogContent>` |
| **`Sheet`**     | Panel lateral (Drawer).    | `side`: "top" \| "right" \| "bottom" \| "left"                                                                     |
| **`Container`** | Wrapper de layout.         | `size`: 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' — controla `max-width` (ver sección `Layout` para el detalle).       |
| **`AspectRatio`** | Fuerza una relación de aspecto. | `ratio`: number (ej. `16 / 9`). Se compone con otro contenido (`Image`, etc.), no es una API todo-en-uno.      |
| **`Tabs`**      | Navegación por pestañas.   | `defaultValue`/`value`/`onValueChange` en el root; **Subcomponentes:** `<TabsList>`, `<TabsTrigger>`, `<TabsContent>` |

### Layout — Uso y Props

- **Componentes cubiertos:** `Container`, `Separator`, `SkipToContent`.

- **`Container`**
  - **Exports:** `Container`.
  - **Props principales:** `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` — controla `max-width` (implementado vía `cva`); `className?: string`; acepta `React.HTMLAttributes<HTMLDivElement>`.
  - **Descripción:** contenedor centrado con `px` responsive y variantes de `max-width`. Usa `containerVariants` para combinar `size` con clases por defecto (`mx-auto w-full px-4 md:px-8`).
  - **Uso:**

```tsx
<Container size="md" className="py-8">
  <h1>Contenido centrado</h1>
</Container>
```

- **`Separator`**
  - **Exports:** `Separator`.
  - **Props principales:** `orientation?: 'horizontal' | 'vertical'` (por defecto `horizontal`); `decorative?: boolean`; `className?: string`.
  - **Descripción:** componente ligero de separación visual que usa `@radix-ui/react-separator` y variantes (`horizontal` / `vertical`) para establecer dimensiones (`h-[1px] w-full` o `h-full w-[1px]`).
  - **Uso:**

```tsx
// Horizontal
<Separator className="my-6" />

// Vertical (por ejemplo en un toolbar)
<Separator orientation="vertical" className="mx-3 h-5" />
```

- **`SkipToContent`**
  - **Exports:** `SkipToContent`.
  - **Props principales:** `href?: string` (por defecto `#main-content`); `className?: string`; acepta `React.AnchorHTMLAttributes<HTMLAnchorElement>`.
  - **Descripción:** enlace accesible para saltar al contenido principal; está estilizado con `buttonVariants` y posicionamiento oculto hasta recibir foco (ideal para accesibilidad keyboard users / screen readers).
  - **Uso:**

```tsx
// Insertar al principio del layout
<SkipToContent />

// Personalizar destino
<SkipToContent href="#content" />
```

Notas:

- `Container` es ideal para establecer el ancho máximo y padding responsive de la app; combina bien con `Separator` para dividir secciones.
- `SkipToContent` debe colocarse al inicio del DOM para ser efectivo; usa `buttonVariants` para mantener estilo consistente.

### Card — Uso y Props

- **Exports:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **`Card` (root):** `className?: string` y acepta `React.HTMLAttributes<HTMLDivElement>` (atributos y eventos estándar). Renderiza un contenedor `div` con estilos base (`rounded-box border bg-base-100 text-base-content shadow-sm`).
- **Subcomponentes:**
  - `CardHeader`: contenedor para título y descripción. Props: `className?: string`.
  - `CardTitle`: se renderiza como un `h3` (tipografía semántica). Props: `className?: string`.
  - `CardDescription`: texto secundario/mutado. Props: `className?: string`.
  - `CardContent`: cuerpo principal (padding y layout). Props: `className?: string`.
  - `CardFooter`: área de acciones (botones, enlaces). Props: `className?: string`.

La API está pensada para composición: puedes mezclar contenido arbitrario dentro de `Card` (imágenes, grids, formularios) y usar `className` en cada subcomponente para ajustar espaciado y alineación.

Uso (ejemplos simplificados extraídos de `Card.stories.tsx`):

```tsx
// 1. Simple (Notificación)
<Card className="w-87.5">
  <CardHeader>
    <CardTitle>Create project</CardTitle>
    <CardDescription>Deploy your new project in one-click.</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-base-content/80">Your project will be deployed to the edge network instantly.</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="ghost">Cancel</Button>
    <Button>Deploy</Button>
  </CardFooter>
</Card>

// 2. Form (Login)
<Card className="w-95">
  <CardHeader>
    <CardTitle>Login</CardTitle>
    <CardDescription>Enter your credentials to access the account.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Input id="email" label="Email" placeholder="m@example.com" type="email" />
    <Input id="password" label="Password" type="password" />
  </CardContent>
  <CardFooter className="flex flex-col gap-4">
    <Button fullWidth>Sign In</Button>
    <Button variant="link" size="sm" className="text-xs">Forgot password?</Button>
  </CardFooter>
</Card>

// 3. Image / Blog style
<Card className="w-87.5 overflow-hidden">
  <div className="h-48 w-full bg-neutral/10 flex items-center justify-center">🖼️</div>
  <CardHeader>
    <CardTitle>Design Systems 101</CardTitle>
    <CardDescription>Learn how to build scalable UI libraries.</CardDescription>
  </CardHeader>
  <CardFooter>
    <Button variant="outline" fullWidth>Read Article</Button>
  </CardFooter>
</Card>
```

Notas:

- Usa `className` en el `Card` root y en subcomponentes para controlar anchura (`w-...`), espaciado y comportamiento responsive.
- `Card` favorece composición; no impone restricciones sobre el contenido dentro de `CardContent`.

### Dialog — Uso y Props

- **Exports:** `Dialog`, `DialogTrigger`, `DialogContent`, `DialogOverlay`, `DialogClose`, `DialogPortal`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`.
- **Principales props y comportamiento:**
  - `Dialog` (root): acepta `open?: boolean` y `onOpenChange?: (open: boolean) => void` si necesitas controlarlo desde estado externo; de lo contrario funciona como no controlado.
  - `DialogTrigger`: normalmente se usa como trigger y admite `asChild` para renderizar un elemento diferente (ej. `Button` o `a`).
  - `DialogContent`: props comunes: `className?: string`, `children?: React.ReactNode` y otros props de `@radix-ui/react-dialog` Content (e.g. `onInteractOutside`). Soporta clases de animación y `sm:max-w-...` para controlar anchura.
  - `DialogOverlay`: `className?: string` para ajustar color/transparencia/efecto backdrop.
  - `DialogClose`: botón que cierra el diálogo; puede usarse con `asChild` para que un `Button` actúe como cierre.
  - `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`: wrappers semánticos con `className?: string` para composición y tipografía.

La implementación usa `@radix-ui/react-dialog` y aplica estilos/animaciones (overlay, zoom/slide, foco) por defecto. Radix gestiona el foco, el trap y los atributos ARIA para accesibilidad; evita reimplementar ese comportamiento.

Uso (ejemplo simplificado — extraído de `Dialog.stories.tsx`):

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>

  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>

    <div className="grid gap-4 py-4">
      <Input id="name" defaultValue="Pedro Duarte" />
      <Input id="username" defaultValue="@pedrodev" />
    </div>

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="ghost">Cancel</Button>
      </DialogClose>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Notas:

- Usa `asChild` en `DialogTrigger` y `DialogClose` cuando quieres que elementos existentes (p. ej. `Button`) actúen como trigger/close manteniendo estilos.
- Controla anchura con `className` en `DialogContent` (p. ej. `sm:max-w-[425px]`).
- Para controlar el diálogo externamente, pasa `open` y `onOpenChange` al `Dialog` root.

### Sheet — Uso y Props

- **Exports:** `Sheet`, `SheetTrigger`, `SheetContent`, `SheetOverlay`, `SheetClose`, `SheetPortal`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`.
- **Props y comportamiento clave:**
  - `Sheet` (root): acepta `open?: boolean` y `onOpenChange?: (open: boolean) => void` para controlarlo externamente, o funciona no-controlado por defecto.
  - `SheetContent`: `side?: 'top' | 'right' | 'bottom' | 'left'` — controla desde qué lado aparece el sheet (por defecto `right`); `className?: string`; `children?: React.ReactNode`.
  - `SheetTrigger`: `asChild?: boolean`, `className?: string` — se usa para disparar el sheet y puede renderizar un elemento existente (ej. `Button`) conservando estilos.
  - `SheetOverlay`: `className?: string` — fondo/backdrop (opacidad, blur) que se muestra detrás del contenido.
  - `SheetClose`: botón que cierra el sheet; admite `asChild` para usar un `Button` o enlace como cierre.

La implementación utiliza `@radix-ui/react-dialog` con variantes visuales definidas en `sheetVariants.ts` (clases para `side` con animaciones y tamaños responsivos). El overlay y el content incluyen animaciones de entrada/salida; Radix gestiona foco y atributos ARIA para accesibilidad.

Uso (ejemplo extraído de `Sheet.stories.tsx`):

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open right sheet</Button>
  </SheetTrigger>

  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here. Click save when you're done.
      </SheetDescription>
    </SheetHeader>

    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="name" className="text-right text-sm font-medium">
          Name
        </label>
        <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
      </div>
    </div>

    <SheetFooter>
      <SheetClose asChild>
        <Button type="submit">Save changes</Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

Notas:

- `side` controla la orientación y las clases aplicadas (`sheetVariants.ts` contiene las opciones con `top`, `bottom`, `left`, `right`).
- Usa `SheetTrigger` y `SheetClose` con `asChild` para integrar botones existentes sin perder estilos.
- `SheetOverlay` maneja el backdrop; personalízalo con `className` si necesitas distinta opacidad o blur.

### AspectRatio — Uso y Props

- **Exports:** `AspectRatio`.
- **Props principales:** `React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>` (de `@radix-ui/react-aspect-ratio`) — principalmente `ratio?: number` (ej. `16 / 9`).

Descripción: fuerza una relación de aspecto sobre su contenido usando CSS puro (el "padding-bottom trick" que resuelve la propia primitiva de Radix), sin hooks ni estado — no necesita `'use client'`. `AspectRatio` es un contenedor de composición, no una API todo-en-uno: se combina con otro contenido (por ejemplo `Image`), igual que `Popover`+`Calendar` se combinan para armar `DatePicker`.

Uso (ejemplos, extraídos de `AspectRatio.stories.tsx`):

```tsx
// 1. Ratio puro, con contenido propio
<div style={{ width: 320 }}>
  <AspectRatio ratio={16 / 9}>
    <div className="h-full w-full bg-primary" />
  </AspectRatio>
</div>

// 2. AspectRatio + Image (patrón típico: portada/thumbnail)
<div style={{ width: 320 }}>
  <AspectRatio ratio={16 / 9}>
    <Image src="/cover.jpg" alt="Cover photo" />
  </AspectRatio>
</div>
```

### Tabs — Uso y Props

- **Exports:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
- **Props y comportamiento clave:**
  - `Tabs` (root): `defaultValue?: string`, `value?: string`, `onValueChange?: (value: string) => void` — controlado o no controlado.
  - `TabsList`: `className?: string` — contenedor tipo píldora (`bg-base-200`, `rounded-box`).
  - `TabsTrigger`: `value: string` (requerido), `disabled?: boolean`, `className?: string`.
  - `TabsContent`: `value: string` (requerido), `className?: string` — sin Portal, vive en el flujo normal del documento (a diferencia de `DropdownMenuContent`/`TooltipContent`).

**Comportamiento no obvio:** el `activationMode` por defecto de Radix Tabs es `"automatic"` — `ArrowRight`/`ArrowLeft` mueven el foco **y** activan el tab en el mismo paso, sin necesitar `Enter`/`Space` adicional. Pensado para grupos chicos (2-5 opciones), no para una fila larga de tabs de dashboard.

Uso (ejemplo, extraído de `Tabs.stories.tsx`):

```tsx
<Tabs defaultValue="prep" className="w-80">
  <TabsList>
    <TabsTrigger value="prep">Prep</TabsTrigger>
    <TabsTrigger value="cook">Cook</TabsTrigger>
    <TabsTrigger value="serve">Serve</TabsTrigger>
  </TabsList>
  <TabsContent value="prep">Corta los vegetales y marina la proteína.</TabsContent>
  <TabsContent value="cook">Cocina a fuego medio durante 12 minutos.</TabsContent>
  <TabsContent value="serve">Emplata y decora con hierbas frescas.</TabsContent>
</Tabs>
```

### 🔲 Overlays

Contenido flotante posicionado relativo a un trigger (Portal + `@radix-ui/react-popper`), con animaciones de entrada/salida y la misma superficie visual (`bg-base-100`, `rounded-box`, `border-base-300`, `shadow-md`) en los tres.

| Componente        | Descripción                          | Props clave                                                                 |
| :----------------- | :------------------------------------ | :---------------------------------------------------------------------------- |
| `Popover`          | Contenido flotante disparado por click | `align`, `sideOffset`; **Subcomponentes:** `<PopoverTrigger>`, `<PopoverAnchor>`, `<PopoverContent>` |
| `Tooltip`          | Texto flotante disparado por hover/foco | Requiere `<TooltipProvider>`; **Subcomponentes:** `<TooltipTrigger>`, `<TooltipContent>` |
| `DropdownMenu`     | Menú de acciones/opciones             | **Subcomponentes:** `<DropdownMenuTrigger>`, `<DropdownMenuContent>`, `<DropdownMenuItem>`, `<DropdownMenuCheckboxItem>`, `<DropdownMenuRadioGroup>`/`<DropdownMenuRadioItem>`, `<DropdownMenuLabel>`, `<DropdownMenuSeparator>` |

### Popover — Uso y Props

- **Exports:** `Popover`, `PopoverTrigger`, `PopoverAnchor`, `PopoverContent`.
- **Props principales:**
  - `Popover` (root): no controlado por defecto; acepta los props de `PopoverPrimitive.Root` (`open`, `onOpenChange`, etc.).
  - `PopoverTrigger`: `asChild?: boolean`.
  - `PopoverAnchor`: ancla de posicionamiento alternativa (sin ser el trigger que abre/cierra).
  - `PopoverContent`: `align?: 'start' | 'center' | 'end'` (default `'center'`), `sideOffset?: number` (default `4`), `className?: string`.

El contenido se monta en un Portal (fuera del árbol donde se declara) con `role="dialog"`, y usa la misma superficie visual que `Select`/`DropdownMenu`. `Calendar`+`Popover` es exactamente cómo está armado `DatePicker` — no una API distinta.

Uso (ejemplo, extraído de `Popover.stories.tsx`):

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent aria-label="Popover example">
    <p>This is the popover content.</p>
  </PopoverContent>
</Popover>
```

### Tooltip — Uso y Props

- **Exports:** `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`.
- **Props principales:**
  - `TooltipProvider`: sin props propias — debe montarse **una sola vez** en un nivel alto del árbol (mismo rol que `<Toast />` en el root layout). Sin un `TooltipProvider` ancestro, `Tooltip` lanza un error (Radix no trae un contexto por defecto).
  - `Tooltip` (root): no controlado por defecto.
  - `TooltipTrigger`: `asChild?: boolean`.
  - `TooltipContent`: `align?: 'start' | 'center' | 'end'`, `sideOffset?: number` (default `4`), `className?: string`.

**Comportamiento no obvio:** el hover pasa por el delay por defecto de Radix (`delayDuration = 700ms`) antes de abrir. El foco por teclado, en cambio, abre **de inmediato**, sin ese delay (`TooltipTrigger.onFocus` llama a `context.onOpen()` directo, sin pasar por el timer que sí usa el hover). El contenido vive en un Portal con `role="tooltip"`.

**En dispositivos táctiles el contenido de `Tooltip` no está disponible — es una decisión de diseño aceptada, no un bug.** Radix nunca abre el tooltip ante un tap (ignora explícitamente `pointerType === 'touch'` en su handler de apertura), y `TooltipContent` añade `pointer-coarse:hidden` como capa defensiva de CSS: en un dispositivo cuyo input principal es de baja precisión (dedo) el panel queda oculto aunque algo intente mostrarlo. **`Tooltip` no es apto para información que el usuario necesite en touch.** Para esos casos usá [`Popover`](#popover--uso-y-props), que sí soporta tap de forma nativa.

Uso (ejemplo, extraído de `Tooltip.stories.tsx`):

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Saved to your library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### DropdownMenu — Uso y Props

- **Exports:** `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuGroup`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`.
- **Alcance recortado a propósito:** sin `Sub`/`SubTrigger`/`SubContent` (submenús anidados) ni `Shortcut`.
- **Props y comportamiento clave:**
  - `DropdownMenu` (root): controlado/no controlado, mismo patrón que `Popover`.
  - `DropdownMenuContent`: `align?` (default `'start'`), `sideOffset?` (default `4`).
  - `DropdownMenuCheckboxItem` / `DropdownMenuRadioItem`: **totalmente controlados** en Radix — a diferencia de `Checkbox`/`Switch`, no existe `defaultChecked`/`defaultValue`; `checked`/`onCheckedChange` (o `value`/`onValueChange` en el `RadioGroup`) quedan enteramente a cargo de quien consume.

**Comportamiento no obvio:** seleccionar un `DropdownMenuItem`, `DropdownMenuCheckboxItem` o `DropdownMenuRadioItem` **cierra el menú** por default (Radix, sin `preventDefault` en `onSelect`); el foco vuelve al trigger al cerrar.

Uso (ejemplo simplificado, extraído de `DropdownMenu.stories.tsx`):

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={() => console.log('profile')}>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem checked={notifications} onCheckedChange={setNotifications}>
      Show notifications
    </DropdownMenuCheckboxItem>
    <DropdownMenuSeparator />
    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
      <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

### 📝 Formularios (Forms)

| Componente   | Descripción          | Props clave                                                                                                         |
| :----------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `Input`      | Campo de texto       | `type`, `label?`, `error?`, `helperText?`, `startIcon?`, `endIcon?`, `variant?`, `size?`, `disabled?`, `className?` |
| `Textarea`   | Texto multilinea     | Standard HTML props, `variant?`, `error?`, `className?`                                                             |
| `Select`     | Dropdown avanzado    | `value?`, `defaultValue?`, `onValueChange?`, `placeholder?`, `className?`                                           |
| `Switch`     | Toggle binario       | `checked?`, `defaultChecked?`, `onCheckedChange?`, `disabled?`, `className?`                                        |
| `Checkbox`   | Casilla de selección | `checked?`, `defaultChecked?`, `onCheckedChange?`, `disabled?`, `className?`                                        |
| `Calendar`   | Grilla de calendario | `mode`, `selected`, `onSelect`, `showOutsideDays?` (todos los props de `DayPicker`)                                 |
| `DatePicker` | Selector de fecha (Popover + Calendar) | `date?`, `onDateChange?`, `placeholder?`, `disabled?`, `className?`                                |

### Checkbox — Uso y Props

- **Exports:** `Checkbox`.
- **Props principales:**
  - `checked?: boolean` — controla el estado de la casilla (componente controlado).
  - `defaultChecked?: boolean` — estado inicial para uso no controlado.
  - `onCheckedChange?: (checked: boolean) => void` — callback al cambiar el estado.
  - `disabled?: boolean` — deshabilita la interacción.
  - `className?: string` — clases adicionales para personalizar tamaño y estilos.
  - Acepta los props de `@radix-ui/react-checkbox` (`React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>`).

La implementación envuelve `@radix-ui/react-checkbox` y expone `Checkbox` con estilos base y un `Indicator` que renderiza `CheckIcon` cuando está marcado.

Uso (ejemplos):

```tsx
// 1. No controlado
<Checkbox defaultChecked />

// 2. Controlado
const [checked, setChecked] = useState(false);
<Checkbox checked={checked} onCheckedChange={setChecked} />

// 3. Con label
<label className="flex items-center gap-2">
  <Checkbox />
  <span>Acepto términos</span>
</label>

// 4. Deshabilitado
<Checkbox disabled />

// 5. Personalizar tamaño/estilo
<Checkbox className="h-6 w-6 rounded-sm border" />
```

Nota: para accesibilidad, envuelve el `Checkbox` con un `label` o usa `aria-label` cuando no haya texto visible.

### Input — Uso y Props

- **Exports:** `Input`.
- **Props principales:**
  - `label?: string` — etiqueta accesible asociada al `input`.
  - `type?: string` — tipo estándar de `input` (`text`, `email`, `password`, etc.).
  - `error?: string` — mensaje de error; activa la variante visual `error` y `aria-invalid`.
  - `helperText?: string` — texto de ayuda descriptivo (vinculado mediante `aria-describedby`).
  - `startIcon?: React.ReactNode`, `endIcon?: React.ReactNode` — iconos dentro del campo.
  - `variant?: 'default' | 'error'` — variantes visuales (definidas en `inputVariants.ts`).
  - `size?: 'sm' | 'md' | 'lg'` — tamaños disponibles.
  - `disabled?: boolean`, `className?: string` y el resto de `React.InputHTMLAttributes<HTMLInputElement>`.

La implementación genera un `id` accesible si no se pasa uno y enlaza `aria-invalid` y `aria-describedby` según `error`/`helperText`. Usa `inputVariants` (class-variance-authority) para combinar `variant` y `size`.

Uso (ejemplos, extraídos de `Input.stories.tsx`):

```tsx
// 1. Default
<Input label="Email" placeholder="name@example.com" type="email" />

// 2. Con error
<Input label="Username" defaultValue="admin" error="Este nombre de usuario ya está en uso." />

// 3. Con helper text
<Input label="Password" type="password" helperText="Debe tener al menos 8 caracteres." />

// 4. Con iconos
<Input label="Search" placeholder="Search products..." startIcon={<svg>...</svg>} />

// 5. Disabled
<Input label="API Key" value="sk-123456789" disabled />
```

Notas:

- `Input` ajusta padding cuando hay `startIcon`/`endIcon` (`pl-10`/`pr-10`) y enlaza mensajes (`error`/`helperText`) para lectores de pantalla.
- Para formularios controlados, usa `value` y `onChange` como en un `input` estándar.

### Textarea — Uso y Props

- **Exports:** `Textarea`.
- **Props principales:**
  - `label?: string` — etiqueta accesible asociada al `textarea`.
  - `variant?: 'default' | 'error'` — controla la apariencia visual (implementado en `textareaVariants.ts`).
  - `error?: string` — mensaje de error; activa la variante visual `error` y `aria-invalid`.
  - `helperText?: string` — texto de ayuda descriptivo (vinculado mediante `aria-describedby`).
  - `className?: string` — clases Tailwind adicionales para ajustar tamaño/espaciado.
  - Acepta `React.TextareaHTMLAttributes<HTMLTextAreaElement>` y `VariantProps<typeof textareaVariants>`.

Descripción: textarea estilizada con `class-variance-authority` (`textareaVariants`) que aplica `min-h-[80px]`, bordes, padding y estados (`error`, `disabled`). Se usa para input multilinea en formularios y admite `rows`, `placeholder`, y otras props estándar de `textarea`.

Uso (ejemplos):

```tsx
// 1. Default
<Textarea label="comentario" placeholder="Escribe tu comentario..." />

// 2. Con error (visual y aria-invalid)
<Textarea label="comentario" error placeholder="Este campo es obligatorio" />

// 3. Controlado
const [value, setValue] = useState('');
<Textarea label="comentario" value={value} onChange={(e) => setValue(e.target.value)} />

// 4. Personalizar filas y tamaño
<Textarea label="comentario" rows={6} className="text-sm" />

// 5. Deshabilitado
<Textarea label="comentario" disabled value="No editable" />
```

### Select — Uso y Props

- **Exports:** `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`.
- **Props y comportamiento clave:**
  - `Select` (root): `value?: string`, `defaultValue?: string`, `onValueChange?: (value: string) => void` — API para controlado/no-controlado.
  - `SelectTrigger`: `className?: string`, `asChild?: boolean` — dispara el panel y puede renderizar elementos existentes como trigger.
  - `SelectContent`: `position?: 'popper'` (usa `popper` por defecto en la implementación), `className?: string` — controla el panel desplegable (animaciones, tamaño mínimo).
  - `SelectItem`: `value: string`, `disabled?: boolean`, `className?: string` — representa una opción; usa `ItemIndicator` (check) cuando está seleccionada.
  - `SelectGroup` y `SelectLabel`: para agrupar opciones y mostrar labels de grupo.
  - `SelectSeparator`: separador entre grupos/opciones.

La implementación usa `@radix-ui/react-select` y aplica estilos/accessibilidad por defecto (foco, roles, ARIA). `SelectTrigger` renderiza el valor actual via `SelectValue`.

Uso (ejemplo mínimo):

```tsx
<Select defaultValue="apple" onValueChange={(v) => console.log(v)}>
  <SelectTrigger className="w-56">
    <SelectValue placeholder="Selecciona una fruta" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
```

Uso con grupos:

```tsx
<Select>
  <SelectTrigger className="w-56">
    <SelectValue placeholder="Selecciona..." />
  </SelectTrigger>
  <SelectContent>
    <SelectLabel>Fruits</SelectLabel>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectSeparator />
    <SelectLabel>Vegetables</SelectLabel>
    <SelectItem value="carrot">Carrot</SelectItem>
  </SelectContent>
</Select>
```

Notas:

- Para listas largas, `SelectScrollUpButton`/`SelectScrollDownButton` mejoran la experiencia; `SelectContent` calcula un ancho mínimo basado en el trigger.
- Usa `asChild` en `SelectTrigger` para renderizar un `Button` o `Input` preservando estilos del trigger.

### Switch — Uso y Props

- **Exports:** `Switch`.
- **Props principales:**
  - `checked?: boolean` — estado controlado.
  - `defaultChecked?: boolean` — estado inicial (no controlado).
  - `onCheckedChange?: (checked: boolean) => void` — callback al cambiar el estado.
  - `disabled?: boolean` — deshabilita la interacción.
  - `className?: string` — clases Tailwind adicionales para ajustar tamaño/colores.
  - Acepta `React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>` (props de `@radix-ui/react-switch`).

Descripción: toggle binario construido sobre `@radix-ui/react-switch`. Proporciona estilos y animaciones por defecto (`data-[state=checked]`/`data-[state=unchecked]`), soporte para `disabled` y permite personalizar tamaño y apariencia mediante `className`.

Uso (ejemplos):

```tsx
// 1. No controlado
<Switch defaultChecked />

// 2. Controlado
const [on, setOn] = useState(false);
<Switch checked={on} onCheckedChange={setOn} />

// 3. Con label
<label className="flex items-center gap-2">
  <Switch />
  <span>Recibir notificaciones</span>
</label>

// 4. Deshabilitado
<Switch disabled />

// 5. Personalizar tamaño/estilo
<Switch className="h-8 w-14" />
```

Nota: para accesibilidad, envuelve el `Switch` en un `label` o provee `aria-label` cuando no haya texto visible. Usa `onCheckedChange` para integrar con formularios controlados.

### Calendar — Uso y Props

- **Exports:** `Calendar`.
- **Props principales:** `CalendarProps = DayPickerProps` (tipo re-exportado de `@daypicker/react`) — soporta todos los props reales de `DayPicker`: `mode: 'single' | 'multiple' | 'range'`, `selected`, `onSelect`, `showOutsideDays?: boolean` (default `true`), etc.

**Comportamiento no obvio:** `Calendar` es un wrapper de estilos sobre `@daypicker/react`, no una calendarización propia del DS. Reemplaza los componentes internos `Chevron`, `PreviousMonthButton`, `NextMonthButton` y `DayButton` de DayPicker por versiones que usan `buttonVariants` del DS (mismos estilos que `Button`). El estilo visual de cada día sale de los `modifiers` que provee DayPicker, no de una prop propia: `today` (borde + texto `primary` si no está seleccionado), `outside` (opacidad reducida), `disabled` (`pointer-events-none`), `range_middle` (fondo `primary/10`), `selected`/`range_start`/`range_end` (fondo `primary` sólido).

Uso (ejemplo, extraído de `Calendar.stories.tsx`):

```tsx
<Calendar mode="single" selected={date} onSelect={setDate} />
```

### DatePicker — Uso y Props

- **Exports:** `DatePicker`.
- **Props principales:**
  - `date?: Date` — fecha seleccionada.
  - `onDateChange?: (date: Date | undefined) => void`.
  - `placeholder?: string` (default `'Pick a date'`).
  - `disabled?: boolean`.
  - `className?: string` — se aplica al `Button` trigger.

**Comportamiento no obvio:** `DatePicker` es **100% controlado, sin estado interno propio** — compone `Popover` + `Button` (trigger) + `Calendar` (`mode="single"`) tal cual ya existen en el DS, no una API monolítica aparte. El consumidor maneja `date`/`onDateChange` desde afuera, igual que lo haría en una app real. Formatea la fecha visible con `date-fns` (`format(date, 'PPP')`).

Uso (ejemplo, extraído de `DatePicker.stories.tsx`):

```tsx
function ControlledDatePicker() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return <DatePicker date={date} onDateChange={setDate} />;
}
```

### 📢 Feedback (Notificaciones)

| Componente     | Descripción                        | Props clave                                                                          |
| :-------------- | :----------------------------------- | :--------------------------------------------------------------------------------------- |
| `Toast`        | Notificaciones no-modales (Sonner)  | Ver props de `<Toaster />` más abajo                                                |
| `Progress`     | Barra de progreso lineal            | `value`, `max?`, `variant?: 'primary'\|'success'\|'warning'\|'error'`, `className?`    |
| `ProgressRing` | Progreso circular (anillo SVG)      | `value`, `max?`, `variant?`, `size?`, `strokeWidth?`, `showValueLabel?`               |
| `Alert`        | Aviso inline persistente (no-modal) | `variant?: 'info'\|'success'\|'warning'\|'error'`, `icon?`; **Subcomponentes:** `<AlertTitle>`, `<AlertDescription>` |

El sistema de Toast utiliza **Sonner**.

**Configuración Global:**
Props aceptadas por `<Toaster />`:

- `position`: "top-left" | "top-right" | "bottom-left" | "bottom-right"
- `richColors`: boolean (Colores más vibrantes)
- `closeButton`: boolean

**Métodos de Disparo:**

```ts
toast('Mensaje base');
toast.success('Operación exitosa');
toast.error('Hubo un error');
toast.info('Nueva actualización');
toast.warning('Ten cuidado');
```

---

### Toast — Uso y Props

- **Exports:** `Toast` (Toaster) y `toast` (helper para disparar toasts).
- **Props principales (Toaster / Sonner):**
  - `position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'` — posición del contenedor.
  - `richColors?: boolean` — colores más vibrantes.
  - `closeButton?: boolean` — mostrar botón de cierre en cada toast.
  - Acepta `React.ComponentProps<typeof import('sonner').Toaster>` (props del `Toaster` de Sonner).

Descripción: envoltorio ligero sobre `sonner` que provee un `Toaster` con tema y clases por defecto y el helper `toast` para disparar notificaciones. El componente `Toast` debe renderizarse una sola vez (por ejemplo en el `App` o en el layout global) para que los toasts se muestren correctamente.

Uso (ejemplos):

```tsx
// 1. Renderizar el Toaster una sola vez (App.tsx o decorator de Storybook)
import { Toast } from '@abelardo-salazar/core-ui-design-system';

function App() {
  return (
    <>
      <Toast />
      <MainApp />
    </>
  );
}

// 2. Disparar toasts desde cualquier parte del código
import { toast } from '@abelardo-salazar/core-ui-design-system';

toast('Mensaje base');
toast.success('Operación exitosa', { description: 'Guardado correctamente' });
toast.error('Hubo un error al guardar');

// 3. Toast con acción
toast('Evento creado', {
  description: 'Domingo, 3 Dic, 09:00',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

Consejos:

- Renderiza `Toast` una sola vez cerca de la raíz de la app o en un decorator de Storybook (ver `Toast.stories.tsx`).
- Personaliza comportamiento visual/colores pasando las props del `Toaster` o ajustando las clases que el wrapper aplica.
- Los toasts son no-modales; no bloquean el foco y no deben usarse para contenido crítico que requiera confirmación inmediata.

### Progress — Uso y Props

- **Exports:** `Progress`.
- **Props principales:**
  - `value?: number` — valor actual.
  - `max?: number` (default `100`).
  - `variant?: 'primary' | 'success' | 'warning' | 'error'` (default `'primary'`) — ver `progressVariants.ts`.
  - `aria-label?: string` (default `'Progress'` si no se pasa — `role="progressbar"` exige nombre accesible).
  - `className?: string` y `React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>` (`@radix-ui/react-progress`).

Descripción: barra horizontal sobre `@radix-ui/react-progress`. El ancho del indicador se calcula como `translateX(-${100 - percentage}%)` a partir de `value`/`max`.

Uso (ejemplos, extraídos de `Progress.stories.tsx`):

```tsx
// 1. Default (variant primary)
<Progress value={50} />

// 2-4. Variantes de color
<Progress value={80} variant="success" />
<Progress value={60} variant="warning" />
<Progress value={30} variant="error" />

// 5. Vacío / 6. Completo
<Progress value={0} />
<Progress value={100} />
```

### ProgressRing — Uso y Props

- **Exports:** `ProgressRing`.
- **Props principales:**
  - `value: number` (requerido) — valor actual.
  - `max?: number` (default `100`).
  - `variant?: 'primary' | 'success' | 'warning' | 'error'` (default `'primary'`) — ver `progressRingVariants.ts`.
  - `size?: number` (default `64`) — diámetro del anillo en px.
  - `strokeWidth?: number` (default `6`).
  - `showValueLabel?: boolean` (default `false`) — opt-in: a tamaños chicos el porcentaje no cabe.
  - `aria-label?: string` (default `'Progress'`).
  - `className?: string` y `Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>`.

Descripción: SVG puro (dos `<circle>` — uno de fondo y otro de progreso animado vía `strokeDasharray`/`strokeDashoffset`), sin dependencia de Radix. `role="progressbar"` con `aria-valuenow`/`aria-valuemin`/`aria-valuemax`. El `value` se clampa entre `0` y `max` (un valor por encima de `max` no rompe el cálculo del arco).

Uso (ejemplos, extraídos de `ProgressRing.stories.tsx`):

```tsx
// 1. Default (sin label)
<ProgressRing value={50} />

// 2. Con label centrado (opt-in)
<ProgressRing value={72} showValueLabel />

// 3. Tamaño y grosor personalizados
<ProgressRing value={40} size={120} strokeWidth={10} showValueLabel />

// 4. Valor por encima del máximo (clamping a 100%)
<ProgressRing value={150} max={100} showValueLabel />
```

### Alert — Uso y Props

- **Exports:** `Alert`, `AlertTitle`, `AlertDescription`.
- **Props principales:**
  - `variant?: 'info' | 'success' | 'warning' | 'error'` (default `'info'`) — ver `alertVariants.ts`.
  - `icon?: React.ReactNode` — reemplaza el ícono default de la variante (patrón compositivo, igual que `fallback` en `Image`).
  - `className?: string` y `React.HTMLAttributes<HTMLDivElement>`.

**Comportamiento no obvio (accesibilidad):** el `role` del `Alert` se **deriva automáticamente de `variant`**, sin ninguna prop de override. `info`/`success` son "así está el estado" → `role="status"` (cortés: espera a que el lector de pantalla termine de leer lo que esté leyendo). `warning`/`error` son "algo salió mal" → `role="alert"` (asertivo: interrumpe al lector de pantalla). También el ícono se resuelve por variante — `InfoCircledIcon`/`CheckCircledIcon`/`ExclamationTriangleIcon`/`CrossCircledIcon` respectivamente — a menos que se pase `icon` explícitamente: si `icon` es `undefined` se usa el default; si se pasa **cualquier** valor, incluidos `null` o `false`, se usa tal cual, lo que permite ocultar el ícono explícitamente sin una prop separada. `AlertTitle` se renderiza como un `<div>`, no un `<h*>`, a propósito — un `Alert` puede aparecer en cualquier punto del árbol (inyectado por un formulario, un toast, etc.) sin que el componente pueda saber qué nivel de heading le corresponde ahí.

Uso (ejemplos, extraídos de `Alert.stories.tsx`):

```tsx
// 1. Info (default) — role="status"
<Alert>
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>This is a general information message.</AlertDescription>
</Alert>

// 2. Success — role="status"
<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>

// 3. Warning / Error — role="alert"
<Alert variant="warning">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>This action may have unintended consequences.</AlertDescription>
</Alert>

// 4. Ícono personalizado (override)
<Alert variant="success" icon={<span>🚀</span>}>
  <AlertTitle>Deployed</AlertTitle>
  <AlertDescription>Your app is live.</AlertDescription>
</Alert>

// 5. Sin ícono, explícito (distingue "no pasé icon" de "no quiero icon")
<Alert icon={null}>
  <AlertTitle>No icon</AlertTitle>
  <AlertDescription>This alert explicitly opts out of any icon.</AlertDescription>
</Alert>
```

### 📊 Datos

| Componente  | Descripción                                       | API & Composición                                                                                             |
| :----------- | :-------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `Table`     | 8 primitivos HTML de tabla, estilizados            | `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableFooter>`, `<TableRow>`, `<TableHead>`, `<TableCell>`, `<TableCaption>` |
| `DataTable` | Tabla con sorting, filtro global y paginación       | `columns: ColumnDef<typeof features, TData>[]`, `data`, `searchPlaceholder?`, `className?` (sobre `@tanstack/react-table` v9) |
| `Chart`     | Charts de Bar/Line/Area/Pie/Ring sobre recharts     | `ChartContainer`, `ChartTooltipContent`, `ChartLegendContent` + re-exports de recharts (`BarChart`, `LineChart`, `AreaChart`, `PieChart`, etc.) |

### Table — Uso y Props

- **Exports:** `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`.

8 primitivos de bajo nivel, cada uno mapea 1:1 a su elemento HTML de tabla (`<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>` respectivamente) con estilos del DS. Todos aceptan `className?: string` y los atributos/eventos HTML estándar de su elemento — no traen ninguna lógica de datos (para eso está `DataTable`).

**Comportamiento no obvio:** `Table` envuelve el `<table>` en un `<div className="relative w-full overflow-x-auto">` — el scroll horizontal para tablas con muchas columnas es responsabilidad del propio primitivo, no de quien lo consume. El `ref` se forwardea al `<table>`, no al `div` wrapper. `TableRow` aplica `hover:bg-base-200` (mismo token de highlight que `SelectItem`/`DropdownMenuItem`, pero en `hover` en vez de `focus`, porque una fila de tabla no es un ítem navegable por teclado por defecto).

Uso (ejemplo simplificado, extraído de `Table.stories.tsx`):

```tsx
<Table>
  <TableCaption>Listado de facturas recientes.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Factura</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead className="text-right">Monto</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.map((row) => (
      <TableRow key={row.invoice}>
        <TableCell className="font-medium">{row.invoice}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell className="text-right">{row.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={2}>Total</TableCell>
      <TableCell className="text-right">$750.00</TableCell>
    </TableRow>
  </TableFooter>
</Table>
```

Nota: `TableCaption` y `TableFooter` son opcionales — una tabla mínima (sin caption ni footer) es un uso válido y común.

### DataTable — Uso y Props

- **Exports:** `DataTable`, `features` (el objeto de features de `@tanstack/react-table` v9, re-exportado desde el mismo módulo).
- **Props principales:**
  - `columns: ColumnDef<typeof features, TData>[]` (requerido) — ver nota abajo, tienen que tiparse contra `typeof features`.
  - `data: TData[]` (requerido).
  - `searchPlaceholder?: string` (default `'Buscar...'`) — la caja de búsqueda global **siempre es visible**, no es opcional vía prop.
  - `className?: string`.

**Comportamiento no obvio:** construida sobre `@tanstack/react-table` v9. Las columnas deben tiparse contra `typeof features` (exportado por este mismo módulo, vía `createColumnHelper<typeof features, TData>()`) — es un requisito real de los generics de v9, no un detalle estilístico. `features` combina `rowSortingFeature` + `columnFilteringFeature` + `globalFilteringFeature` + `rowPaginationFeature`, pero **`columnFilteringFeature` está registrada únicamente porque el sistema de tipos de v9 la exige como prerequisito** de `globalFilteringFeature`/`filteredRowModel`/`filterFns` — `DataTable` no expone ningún filtro por columna, solo el filtro global (la caja de búsqueda). Alcance v1: sorting + filtro global + paginación; sin selección de filas, visibilidad de columnas, resize, agrupación/agregación ni pinning.

Uso (ejemplo, extraído de `DataTable.stories.tsx`):

```tsx
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable, features } from '@abelardo-salazar/core-ui-design-system';

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columnHelper = createColumnHelper<typeof features, Person>();
const columns = [
  columnHelper.accessor('name', { header: 'Nombre' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('role', { header: 'Rol' }),
];

<DataTable columns={columns} data={people} />;
```

Notas:

- Hacer click en un `TableHead` ordenable alterna el sort de esa columna (ícono `CaretUpIcon`/`CaretDownIcon`/`CaretSortIcon`, con `text-primary` cuando la columna está efectivamente ordenada).
- El filtro global resetea la paginación a la primera página.

### Chart — Uso y Props

- **Exports:** `ChartContainer`, `ChartTooltipContent`, `ChartLegendContent`, `ChartConfig` (tipo), `CHART_COLOR_TOKENS`, más re-exports directos de `recharts` (sin wrapper propio, mismo criterio que `Popover` re-exportando `PopoverAnchor`): `BarChart`/`Bar`, `LineChart`/`Line`, `AreaChart`/`Area`, `PieChart`/`Pie`/`Cell`/`Label`, `XAxis`, `YAxis`, `CartesianGrid`, `ResponsiveContainer`, `ChartTooltip` (el `Tooltip` de recharts, renombrado — choca en compilación con el `Tooltip` propio del DS vía `export *`), `ChartLegend` (el `Legend` de recharts, renombrado por consistencia con `ChartTooltip`).
- **Props principales:**
  - `ChartContainer`: `config: ChartConfig` (`Record<string, { label?: ReactNode; color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info' }>`, requerido), `children` (el chart de recharts), más `React.ComponentPropsWithoutRef<'div'>`.
  - `ChartTooltipContent`: `config: ChartConfig` (requerido), `hideLabel?: boolean`, `indicator?: 'dot' | 'line'` (default `'dot'`) — el resto (`active`/`payload`/`label`) lo inyecta Recharts.
  - `ChartLegendContent`: `config: ChartConfig` (requerido) — el resto (`payload`) lo inyecta Recharts.

Alcance: **Bar, Line, Area, Pie — incluyendo Ring (donut)**. `recharts` **no** es peerDependency: viene bundleado dentro del paquete del DS.

**Comportamiento no obvio:**

- `ChartContainer` inyecta `--color-<key>` como variable CSS por cada entrada de `config`, apuntando al token real del DS (`var(--color-primary)`, etc). Las piezas de datos referencian esa variable vía `fill`/`stroke` (ej. `fill="var(--color-escritorio)"`), nunca un color fijo — así responden solas a claro/oscuro. Esto es más simple que el recipe original de `ChartContainer` de shadcn/ui (que además inyecta un bloque `<style>` duplicado por tema): acá no hace falta, los tokens del DS ya cambian de valor solos con `.dark`.
- "**Ring**" (donut) no es un componente propio: se logra componiendo `Pie` con `innerRadius`/`outerRadius` (el hueco) y un texto central armado a mano.
- **`<Label position="center">` no sirve para el texto central de un Ring** — probado contra un `Pie` real, no renderiza nada en `recharts@3.10.1`. Es un bug/quirk conocido de la propia librería ([issue #6030 de recharts](https://github.com/recharts/recharts/issues/6030)): para `position="center"` específicamente, `Label` resuelve el viewBox contra el contexto *cartesiano* en vez del *polar*, y un `PieChart` sin ejes nunca provee ese contexto cartesiano. Para el texto central de un Ring, usa un `<text x="50%" y="50%">` crudo como hijo de `Pie` (`Pie` renderiza sus `children` tal cual, sin filtrarlos) — los porcentajes se resuelven contra el viewport del propio `<svg>`, sin JS ni conocer el tamaño del contenedor. Ver `RingChartExample` en `Chart.stories.tsx` para el patrón completo.
- Para `Pie`, el tooltip y la leyenda resuelven cada porción por `name`/`value`, no por `dataKey` — en un `Pie`, `dataKey` es el mismo string (el campo del valor numérico, ej. `"value"`) en **todas** las porciones; lo que distingue cada porción es `name` (tooltip) / `value` (leyenda), resuelto por Recharts vía `nameKey`.

Uso (ejemplos, extraídos de `Chart.stories.tsx`):

```tsx
// 1. BarChart
const chartConfig: ChartConfig = {
  escritorio: { label: 'Escritorio', color: 'primary' },
  movil: { label: 'Móvil', color: 'secondary' },
};

<ChartContainer config={chartConfig} className="aspect-video w-full">
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <YAxis tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent config={chartConfig} />} />
    <ChartLegend content={<ChartLegendContent config={chartConfig} />} />
    <Bar dataKey="escritorio" fill="var(--color-escritorio)" radius={4} />
    <Bar dataKey="movil" fill="var(--color-movil)" radius={4} />
  </BarChart>
</ChartContainer>;

// 2. Pie
const teamConfig: ChartConfig = {
  design: { label: 'Design', color: 'primary' },
  engineering: { label: 'Engineering', color: 'secondary' },
};

<ChartContainer config={teamConfig} className="aspect-video w-full">
  <PieChart>
    <ChartTooltip content={<ChartTooltipContent config={teamConfig} />} />
    <ChartLegend content={<ChartLegendContent config={teamConfig} />} />
    <Pie data={teamData} dataKey="headcount" nameKey="team">
      {teamData.map((entry) => (
        <Cell key={entry.team} fill={`var(--color-${entry.team})`} />
      ))}
    </Pie>
  </PieChart>
</ChartContainer>;

// 3. Ring (donut) — Pie + innerRadius/outerRadius + <text> central compuesto a mano
<ChartContainer config={teamConfig} className="aspect-video w-full">
  <PieChart>
    <ChartTooltip content={<ChartTooltipContent config={teamConfig} />} />
    <Pie data={teamData} dataKey="headcount" nameKey="team" innerRadius={55} outerRadius={85}>
      {teamData.map((entry) => (
        <Cell key={entry.team} fill={`var(--color-${entry.team})`} />
      ))}
      <text x="50%" y="50%" textAnchor="middle">
        <tspan x="50%" dy="-0.3em" className="fill-base-content text-2xl font-bold">
          {total}
        </tspan>
        <tspan x="50%" dy="1.4em" className="fill-base-content/65 text-xs">
          Personas
        </tspan>
      </text>
    </Pie>
  </PieChart>
</ChartContainer>;
```

## 💻 Desarrollo Local

Si deseas contribuir o modificar la librería:

1. Clonar el repositorio.
2. Instalar dependencias: `npm install`.
3. Iniciar Storybook (Documentación interactiva):

```bash
npm run storybook
```

4. Compilar librería:

```bash
npm run build
```

---

**Core UI Design System** © Abelardo Salazar / @abelardo-salazar 2026. Internal Use Only.
