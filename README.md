# Core UI Design System

<!-- El badge de versión se actualiza a mano en cada bump (ver "version" en package.json) —
     no hay automatización que lo sincronice. Si cambias package.json#version, actualiza esta
     línea en el mismo commit. -->

![Version](https://img.shields.io/badge/version-0.6.0-blue.svg)
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

El paquete declara React, Radix UI, TanStack Table, cmdk (lo usa `Combobox`) y Sonner como `peerDependencies` — tu proyecto debe instalarlos aparte (evita instancias duplicadas y permite que Next.js resuelva sus propias directivas `'use client'`). Instala el set completo:

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
  @radix-ui/react-toggle-group@^1.1.20 \
  @radix-ui/react-tooltip@^1.2.16 \
  @tanstack/react-table@^9.1.2 \
  cmdk@^1.1.1 \
  sonner@^2.0.7
```

> `recharts` (usado por `Chart`) **no** es peerDependency: viene bundleado dentro del propio paquete, no hace falta instalarlo aparte. Desde `0.4.1`, `Chart` **no** vive en el barrel principal — se importa desde el subpath `@abelardo-salazar/core-ui-design-system/charts` (ver [Chart — Uso y Props](#chart--uso-y-props)). Así el import principal queda libre de `recharts` y sigue siendo seguro para Server Components.

---

## ⚙️ 3. Setup Inicial

Hay dos hojas de estilos, según si tu proyecto usa Tailwind. Se importa **una sola**, una sola vez.

### Con Tailwind v4

Para proyectos con Tailwind v4 (4.1 o posterior; `tailwindcss` es peer opcional del paquete). En tu hoja de estilos global (`globals.css`, `index.css`…), después de Tailwind:

```css
@import 'tailwindcss';
@import '@abelardo-salazar/core-ui-design-system/tailwind.css';
```

- `./tailwind.css` trae los tokens, las capas base y `tailwindcss-animate` sin compilar: los compila tu Tailwind, junto con tus clases, en una sola compilación.
- Las clases que usan los componentes del paquete se detectan solas; no agregues un `@source` hacia `node_modules`.
- Las utilidades de los tokens quedan disponibles para tu código, con opacidad incluida: `bg-primary/5`, `text-base-content/65`, `border-error/40`.
- **No la combines con `style.css`**: `style.css` ya viene compilado, y junto a tu Tailwind quedan dos compilaciones en las mismas capas. Algunas utilidades responsive de los componentes dejan de aplicarse (por ejemplo, el `md:px-8` de `Container`). El porqué está en [ARCHITECTURE § Orden de utilidades entre dos compilaciones](./ARCHITECTURE.md#orden-de-utilidades-entre-dos-compilaciones).

**La fuente la cargas tú.** `./tailwind.css` no importa Google Fonts: así eliges cómo cargarla, por ejemplo autoalojada con `next/font`, sin una petición a un tercero que bloquee el renderizado. El token `--font-sans` vale `'Ubuntu', ui-sans-serif, system-ui, sans-serif`:

- Con un `@import` de Google Fonts o un `@font-face` propio, basta con que la familia se llame `Ubuntu`. El `@import url(...)` va antes de `@import 'tailwindcss'`.
- Con `next/font`, la familia queda con otro nombre (`__Ubuntu_<hash>`). Exponla en `--font-sans` con la opción `variable`:

```tsx
// app/layout.tsx
import { Ubuntu } from 'next/font/google';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-sans',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={ubuntu.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Sin Tailwind

Importa `style.css`, ya compilado y con la fuente Ubuntu de Google Fonts incluida, en el punto de entrada de tu aplicación (ej. `main.tsx`, `App.tsx` o `layout.tsx`):

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

## 🎨 4. Theming (Custom Properties)

El sistema de colores y radios se define en tokens semánticos (CSS Custom Properties) que viven dentro de Tailwind v4 en `@layer base { :root {...} }` (tema claro) y `:root:has(.dark), .dark {...}` (tema oscuro). Cualquier componente de color (`bg-primary`, `text-primary-content`, etc.) apunta a estos tokens indirectamente vía `var(...)`, así que **sobreescribir el token cambia el color en todos los componentes que lo usan**, sin tocar el paquete.

### Tokens overrideables

Estos son los tokens semánticos soportados como superficie pública de theming, con su valor default:

| Token                   | Claro (default) | Oscuro (default)             |
| ----------------------- | --------------- | ---------------------------- |
| `--primary`             | `#302b6e`       | `#b7b1ff`                    |
| `--primary-focus`       | `#28245b`       | `#cfcbff`                    |
| `--primary-content`     | `#ffffff`       | `#000000`                    |
| `--secondary`           | `#235e43`       | `#2dd287`                    |
| `--secondary-focus`     | `#1c4b36`       | `#40d692`                    |
| `--secondary-content`   | `#ffffff`       | `#000000`                    |
| `--accent`              | `#426020`       | `#9ed261`                    |
| `--accent-focus`        | `#354c19`       | `#aad875`                    |
| `--accent-content`      | `#ffffff`       | `#000000`                    |
| `--neutral`             | `#282524`       | `#ffffff`                    |
| `--neutral-focus`       | `#0d0c0c`       | `#e5e5e5`                    |
| `--neutral-content`     | `#ffffff`       | `#000000`                    |
| `--base-100`            | `#ffffff`       | `#141414`                    |
| `--base-200`            | `#fcfcfc`       | `#1f1f1f`                    |
| `--base-300`            | `#f3f4f6`       | `#292929`                    |
| `--base-content`        | `#282524`       | `#ffffff`                    |
| `--info`                | `#3b82f6`       | (igual, no cambia en oscuro) |
| `--success`             | `#22c55e`       | (igual, no cambia en oscuro) |
| `--warning`             | `#eab308`       | (igual, no cambia en oscuro) |
| `--error`               | `#ef4444`       | (igual, no cambia en oscuro) |
| `--error-content`       | `#000000`       | (igual, no cambia en oscuro) |
| `--error-focus`         | `#b91c1c`       | `#f87171`                    |
| `--error-focus-content` | `#ffffff`       | `#000000`                    |

> `--info`, `--success` y `--warning` **no** tienen variantes `-focus`/`-content` en el sistema actual — solo `--error` las tiene completas (por el contraste de texto que necesita, ver comentarios en `src/tailwind.css`). No agregues `--info-focus`, `--success-content`, etc. asumiendo simetría: no existen y no tienen efecto salvo que también se definan.

### Patrón sancionado: override sin capa (`@layer`)

La única forma de override que garantiza ganar sobre los tokens del design system **sin importar el orden de import** entre tu hoja de estilos y la del paquete es CSS declarado **fuera de cualquier `@layer`**, apuntando a `:root` (claro) y `.dark` (oscuro):

```css
/* tu-tema.css — en cualquier orden respecto a la hoja del design system (tailwind.css o style.css) */
:root {
  --primary: #1d4ed8;
  --primary-focus: #1e40af;
  --primary-content: #ffffff;

  --base-100: #f8fafc;
  --base-content: #0f172a;
}

.dark {
  --primary: #93c5fd;
  --primary-focus: #bfdbfe;
  --primary-content: #0f172a;

  --base-100: #0f172a;
  --base-content: #f8fafc;
}
```

Esto funciona porque, por especificación de CSS Cascade Layers, **cualquier regla sin capa tiene prioridad sobre cualquier regla dentro de una `@layer`**, sin importar en qué orden se importen las hojas de estilo. Verificado en navegador real (Chromium vía Playwright, contra Storybook sirviendo el CSS compilado real del paquete): un override sin capa insertado incluso _antes_ del CSS del design system en el `<head>` sigue ganando.

### ⚠️ Qué NO hacer: override dentro de tu propio `@layer base`

Si tu proyecto también usa Tailwind y seguís su convención de customización de tema poniendo tus overrides dentro de tu propio `@layer base { :root {...} }`, **la prioridad deja de estar garantizada** y pasa a depender del orden de import entre tu hoja de estilos y la del design system:

- Si tu `@layer base` se importa **después** del CSS del design system → tu override gana.
- Si tu `@layer base` se importa **antes** del CSS del design system → tu override **NO gana**: el valor del design system prevalece.

Esto es así porque ambas hojas declaran la misma capa con nombre `base`, y dentro de una capa con nombre compartido el desempate para igual especificidad es el orden normal de cascada (la declaración que aparece más tarde en el documento gana) — ya no aplica la prioridad especial de "sin capa". Es un mecanismo frágil: un reorden de imports, un bump de una dependencia que cambia cuándo se inyecta su CSS, o un bundler que reordena hojas de estilo puede invertir silenciosamente cuál de las dos gana.

Verificado en navegador real (misma configuración de prueba): un override en `@layer base` importado _antes_ del CSS del design system efectivamente **no** tuvo efecto — el token quedó en su valor default del paquete.

**Por eso el patrón sancionado es siempre el override sin capa** (sección anterior), incluso en proyectos que ya usan `@layer base` para otras cosas.

### `--palette-*` es interno, no es la API de theming

`src/tailwind.css` también define tokens `--palette-*` (`--palette-navy`, `--palette-red-dark`, etc.) que son la implementación interna de los tokens semánticos (`--primary: var(--palette-navy)`, por ejemplo). **No están pensados para ser overrideados directamente** y no forman parte de la superficie pública de theming — pueden renombrarse o reestructurarse en cualquier momento sin que eso cuente como breaking change. Overrideá siempre el token semántico (`--primary`, `--base-100`, etc.), nunca `--palette-*`.

---

## 📚 Contenido

- [Core UI Design System](#core-ui-design-system)
  - [🔒 1. Configuración de Autenticación (Requerido)](#-1-configuración-de-autenticación-requerido)
    - [Paso A: Generar Token](#paso-a-generar-token)
    - [Paso B: Configurar Proyecto](#paso-b-configurar-proyecto)
  - [📦 2. Instalación](#-2-instalación)
    - [Peer Dependencies](#peer-dependencies)
  - [⚙️ 3. Setup Inicial](#️-3-setup-inicial)
    - [Con Tailwind v4](#con-tailwind-v4)
    - [Sin Tailwind](#sin-tailwind)
  - [🎨 4. Theming (Custom Properties)](#-4-theming-custom-properties)
    - [Tokens overrideables](#tokens-overrideables)
    - [Patrón sancionado: override sin capa (`@layer`)](#patrón-sancionado-override-sin-capa-layer)
    - [⚠️ Qué NO hacer: override dentro de tu propio `@layer base`](#️-qué-no-hacer-override-dentro-de-tu-propio-layer-base)
    - [`--palette-*` es interno, no es la API de theming](#--palette--es-interno-no-es-la-api-de-theming)
  - [📚 Contenido](#-contenido)
  - [🧩 5. Documentación de API](#-5-documentación-de-api)
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
    - [ToggleGroup — Uso y Props](#togglegroup--uso-y-props)
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
    - [Locales — subpath `/locale`](#locales--subpath-locale)
    - [Combobox — Uso y Props](#combobox--uso-y-props)
    - [QuantityStepper — Uso y Props](#quantitystepper--uso-y-props)
    - [📢 Feedback (Notificaciones)](#-feedback-notificaciones)
    - [Toast — Uso y Props](#toast--uso-y-props)
    - [Progress — Uso y Props](#progress--uso-y-props)
    - [ProgressRing — Uso y Props](#progressring--uso-y-props)
    - [Alert — Uso y Props](#alert--uso-y-props)
    - [EmptyState — Uso y Props](#emptystate--uso-y-props)
    - [♿ Accesibilidad](#-accesibilidad)
    - [VisuallyHidden — Uso y Props](#visuallyhidden--uso-y-props)
    - [announce() — Uso y opciones](#announce--uso-y-opciones)
    - [📊 Datos](#-datos)
    - [Table — Uso y Props](#table--uso-y-props)
    - [DataTable — Uso y Props](#datatable--uso-y-props)
    - [Chart — Uso y Props](#chart--uso-y-props)
    - [🧾 Tipos y utilidades exportados](#-tipos-y-utilidades-exportados)
  - [💻 Desarrollo Local](#-desarrollo-local)
  - [🤖 Integración Continua (CI)](#-integración-continua-ci)

---

## 🧩 5. Documentación de API

### 🧱 Átomos (Fundamentos)

| Componente  | Descripción                      | Props clave                                                                                  |
| :---------- | :------------------------------- | :------------------------------------------------------------------------------------------- |
| `Button`    | Botón interactivo polimórfico    | `variant`, `size`, `isLoading`, `asChild`, `fullWidth`, `startIcon`, `endIcon`, `className`  |
| `Heading`   | Títulos semánticos               | `level`, `as`, `className`                                                                   |
| `Text`      | Párrafos y texto cuerpo          | `size`, `weight`, `as`, `className`                                                          |
| `Badge`     | Etiquetas de estado              | `variant`, `size`, `interactive`, `className`                                                |
| `Avatar`    | Imagen de perfil con fallback    | `src`, `alt`, `fallback`, `className`                                                        |
| `Separator` | Divisor visual                   | `orientation`, `className`                                                                   |
| `Skeleton`  | Placeholder de carga             | `className`                                                                                  |
| `Chip`      | Etiqueta toggleable/removible    | `variant`, `size`, `pressed`, `defaultPressed`, `onPressedChange`, `onRemove`, `removeLabel` |
| `Image`     | Imagen con estado de carga/error | `src`, `alt`, `fallback`, `containerClassName`                                               |

### Button — Uso y Props

- **Exports:** `Button`, `buttonVariants`.
- **Props principales:**
  - `variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'` — define el estilo visual (ver `buttonVariants.ts`).
  - `size?: 'sm' | 'md' | 'lg' | 'icon'` (default `'md'`) — define la altura y el padding. Alturas: `sm` = 32px, `md` = 44px, `lg` = 48px, `icon` = 44x44 (cuadrado). `sm` es un tamaño compacto, por debajo del objetivo táctil de 44px (WCAG 2.5.5 / Apple HIG) — para una acción secundaria de baja frecuencia, no para el control principal de una fila táctil.
  - `shape?: 'default' | 'pill'` (default `'default'`) — `default` = `rounded-btn` (el radio estándar del DS); `pill` = `rounded-full`. Con `shape="pill"` y `size="icon"`, el resultado es un círculo de 44x44; el anillo de foco sigue la forma sin configuración adicional.
  - `isLoading?: boolean` — muestra un spinner (`ReloadIcon`) y deshabilita la interacción.
  - `asChild?: boolean` — usa `@radix-ui/react-slot` para renderizar un elemento distinto (p. ej. `<a>`) preservando estilos.
  - `startIcon?: React.ReactNode`, `endIcon?: React.ReactNode` — iconos antes/después del texto.
  - `fullWidth?: boolean` — si es `true` aplica `w-full`.
  - `className?: string` y todos los `React.ButtonHTMLAttributes<HTMLButtonElement>` estándar.

La implementación usa `class-variance-authority` (`buttonVariants`, exportado para que un consumidor arme su propio elemento con el mismo look) para combinar variantes y tamaños. Variantes por defecto: `variant: 'primary'`, `size: 'md'`, `shape: 'default'`.

> **Regla de alineación: `Button`, `Input` y el trigger de `Select` comparten la misma escala de alturas** (`sm` = 32px, `md` = 44px, `lg` = 48px — `Input`/`Select` no tienen `size="icon"`). En una misma fila (p. ej. un campo con un botón de búsqueda al lado, o un `Select` junto a un `Button`), usa el mismo `size` en los tres para que queden alineados por arriba y por abajo — ver el story `AlignedFormRow` en `FormDemo.stories.tsx`.

> **Nota sobre `variant="destructive"` y el token `--error-focus-content`:** en primary/secondary/accent/neutral, tanto el color base como su `-focus` (hover) son oscuros en modo claro, así que un solo `-content` (blanco) sirve como color de texto para los dos estados. `error` es el único color del sistema donde eso no es cierto: el base (`--error`, `#ef4444`) es claro pero el `-focus` (`--error-focus`, `#b91c1c` en claro / `#f87171` en oscuro) es oscuro — la relación se invierte. Por eso `destructive` es la única variante que necesita `hover:text-error-focus-content` además de `hover:bg-error-focus`; sin ese token, el texto (`text-error-content`, negro) cae a 3.25:1 sobre el fondo de hover. No es un descuido de copiar/pegar de las otras variantes — no lo agregues a primary/secondary/accent/neutral, ahí un solo `-content` ya cubre ambos estados. Ver `src/tailwind.css` para el detalle y el cálculo de contraste en ambos temas.

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

// 6. Forma píldora — con size="icon" da un círculo de 44x44
<Button shape="pill">Aplicar filtro</Button>
<Button shape="pill" size="icon" aria-label="Agregar"><PlusIcon /></Button>
```

Nota: controla apariencia y tamaño via `variant`, `size`, `shape` y `className`. Si `asChild` es `true`, `Button` no renderiza un `button` nativo sino el elemento hijo con los estilos aplicados.

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

- **Exports:** `Badge`, `badgeVariants`.
- **Props principales:**
  - `variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'` — define el estilo visual.
  - `size?: 'sm' | 'md' | 'lg' | 'icon'` (default `'sm'`) — escala **propia de `Badge`** (no la de `Button`), compacta, pensada para una etiqueta de estado, no un control. Alturas reales (borde + padding vertical + line-height del propio `text-*`, sin `h-*` fijas salvo `icon`, medidas en navegador): `sm` ≈ 22px, `md` ≈ 26px, `lg` ≈ 30px, `icon` = 24px exactos (cuadrado, sin padding horizontal — para un ícono o un número corto).
  - `interactive?: boolean` (default `false`) — con `interactive`, `Badge` renderiza un `<button type="button">` real: foco por teclado, `Enter`/`Space` y `disabled` nativos del navegador, sin que `Badge` sintetice ningún handler propio. Sin `interactive`, sigue siendo un `<div>`. `cursor-pointer`, el anillo de foco (`focus-visible:ring-2 ring-primary ring-offset-2`) y el hover por color **solo existen cuando `interactive` es `true`** — en un `<div>` no-interactivo serían CSS muerto (nunca se dispara `:focus-visible` sin `tabIndex`).
  - `className?: string` — clases adicionales.
  - **Con `interactive: true`:** acepta `React.ButtonHTMLAttributes<HTMLButtonElement>` (`onClick`, `disabled`, `type`, etc). **Sin `interactive`** (o `interactive: false`): acepta `React.HTMLAttributes<HTMLDivElement>` — atributos legítimos de un `<div>` (`title`, `id`, `style`, `role`, `aria-*`, `data-*`, `children`, etc.), **sin `onClick`, `disabled` ni `type`**. `BadgeProps` es una unión discriminada por `interactive`, pero la unión sola no alcanza para que esto se cumpla en el compilador: `Badge` está declarada con dos firmas sobrecargadas (una por rama) para que el chequeo de propiedades sobrantes de JSX se haga contra la firma concreta, no contra la unión completa. `<Badge onClick={fn}>`, `<Badge disabled>` o `<Badge type="submit">` sin `interactive` son errores de compilación (ver nota de migración abajo); `<Badge interactive onClick={fn}>` compila. Esta garantía tiene un test de tipos dedicado (`src/components/Badge/Badge.types.test-d.tsx`, compilado por `tsc -b`, con casos `@ts-expect-error` para cada combinación inválida) — no es solo una afirmación de este README.

La implementación usa `class-variance-authority` con variantes definidas en `badgeVariants.ts`. Las variantes por defecto son `variant: 'default'`, `size: 'sm'`, `interactive: false`.

> **Nota sobre `variant="destructive"` y el token `--error-focus-content`:** mismo caso que `Button` (`variant="destructive"`) — `error` es el único color del sistema donde el base es claro y su `-focus` (hover) es oscuro, así que el texto necesita un `-focus-content` propio (`hover:text-error-focus-content`) distinto del `-content` del estado base. Esta clase, como el resto del hover, solo se aplica con `interactive: true`. Ver la nota en la sección de `Button` y `src/tailwind.css` para el detalle completo.

Uso (ejemplos):

```tsx
// Estático (default) — <div>, sin hover ni foco, para una etiqueta de estado.
<div className="flex gap-2">
  <Badge>Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Removed</Badge>
  <Badge variant="outline">Outline</Badge>
  <Badge variant="ghost">Ghost</Badge>
</div>

// Las cuatro escalas
<Badge size="sm">sm</Badge>
<Badge size="md">md</Badge>
<Badge size="lg">lg</Badge>
<Badge size="icon">9</Badge>

// Interactivo — <button> real, con onClick
<Badge interactive onClick={() => console.log('clicked')}>
  Interactive
</Badge>

// Enlace con el look de Badge: badgeVariants es la variante estilística, sin asChild/href —
// el consumidor arma su propio <a>/<Link> y le aplica las clases.
import Link from 'next/link';
<Link href="/billing" className={badgeVariants({ variant: 'secondary', interactive: true })}>
  Ver facturación
</Link>

// Personalizar tamaño/alto puntual (className sigue ganando sobre la variante vía twMerge)
<Badge className="text-[10px] px-1 py-0 h-5">Small</Badge>
```

**Migración desde `<Badge onClick={fn}>` (sin `interactive`):** antes compilaba y el click funcionaba, pero sobre un `<div>` sin foco por teclado ni semántica de botón — un bug de accesibilidad real y silencioso. Ahora `onClick`, `disabled` y `type` sin `interactive` son errores de compilación (verificado con un test de tipos dedicado, no solo con el texto de este README); cambiar a `<Badge interactive onClick={fn}>`.

**`interactive` debe ser un literal (`true`/`false` u omitido), no un `boolean` dinámico.** `Badge` tiene una firma por rama (`interactive: true` y `interactive?: false`) para que TypeScript rechace `onClick` sin `interactive`. Un valor de tipo `boolean`, como `interactive={isClickable}`, no encaja en ninguna de las dos y no compila (`No overload matches this call`). Si se decide en ejecución, usar dos `Badge` literales:

```tsx
const status = isClickable ? (
  <Badge interactive onClick={openDetail}>
    Pendiente
  </Badge>
) : (
  <Badge>Pendiente</Badge>
);
```

**`Badge` vs `Chip`:** un `Badge` interactivo compacto mide ~22px y **no cumple el objetivo táctil de 44px** (WCAG 2.5.5 / Apple HIG) — es para usos incidentales, una etiqueta que además abre algo al tocarla (p. ej. un estado que lleva al detalle). Para un control pensado para tocarse a propósito (filtros, chips seleccionables), usar `Chip`, que en `size="lg"` ya mide 44px de alto real, incluyendo el área de respuesta.

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
    <Skeleton className="h-11 w-28" />
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
  - `size?: 'sm' | 'md' | 'lg'` (default `'sm'`) — `sm` = alto derivado del contenido (comportamiento histórico); `md` = 32px de alto; `lg` = 44px de alto, el tamaño que cumple el objetivo táctil de 44px (WCAG 2.5.5 / Apple HIG). El cuerpo interactivo (`Toggle`) y el botón de cierre cubren siempre el alto completo de la píldora y siguen su silueta redondeada — no solo el texto responde al toque, y un toque justo afuera de la curva visible no activa nada. En `md`/`lg` el área de respuesta llega hasta el borde exterior de la raíz (el propio borde de 1px también responde); en `sm` llega hasta el borde interior, preservando el aspecto histórico pixel a pixel.
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

// 5. size="lg" — tamaño táctil (44px), botón de cierre a 44x44
<Chip size="lg" onRemove={() => console.log('removed')}>
  Design
</Chip>
```

Nota: el estado "on" del Toggle siempre gana sobre `variant` (`has-[[data-state=on]]:bg-primary`), mismo criterio que usan `Switch`/`Checkbox` para "esto está activo".

### Image — Uso y Props

- **Exports:** `Image`.
- **Props principales:**
  - `fallback?: React.ReactNode` — nodo a mostrar si la imagen falla al cargar (patrón compositivo, igual que `AvatarFallback`).
  - `containerClassName?: string` — clases para el contenedor que envuelve el `<img>` y los estados de carga/error.
  - `onLoad?` / `onError?` — se llaman **una sola vez por `src`** (ver abajo).
  - Acepta `React.ImgHTMLAttributes<HTMLImageElement>` (`src`, `alt`, `className`, etc.).

**Comportamiento no obvio:** mientras carga, muestra un `Skeleton` cubriendo el contenedor. Si la carga falla y no se pasó `fallback`, **no renderiza nada** — no hornea un ícono de "imagen rota" por default; es una decisión explícita, no un olvido. El `<img>` se desmonta al fallar (si no, quedaría invisible pero seguiría en el DOM). Si cambia `src`, vuelve a pasar por el ciclo completo de carga en vez de conservar el estado de la imagen anterior. Sin `src`, muestra el `fallback` (o nada) y llama a `onError`. El resultado de la carga no se pierde aunque llegue antes de que React conecte sus manejadores (imagen en caché, o renderizado en servidor cuando la imagen terminó de cargar o falló antes de la hidratación): `onLoad`/`onError` se llaman igual, una sola vez por `src`. En ese caso el evento lo vuelve a disparar `Image` y `event.nativeEvent.isTrusted` es `false`. Requiere `'use client'` (a diferencia de `Avatar`, no hay una primitiva de Radix disponible para una imagen rectangular; el estado de carga/error solo se puede conocer vía `onLoad`/`onError` del `<img>` nativo). Pensada para usarse dentro de `AspectRatio` u otro contenedor con tamaño explícito — llena `h-full w-full` de su contenedor.

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

| Componente        | Descripción                     | API & Composición                                                                                                                          |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **`Card`**        | Contenedor de información.      | **Subcomponentes:** `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`                                    |
| **`Dialog`**      | Modal accesible.                | `open`: boolean; `onOpenChange`: (open: boolean) => void; **Subcomponentes:** `<DialogTrigger>`, `<DialogContent>`                         |
| **`Sheet`**       | Panel lateral (Drawer).         | `side`: "top" \| "right" \| "bottom" \| "left"; `closeLabel`; **Subcomponentes:** `<SheetHeader>`, `<SheetBody>` (scroll), `<SheetFooter>` |
| **`Container`**   | Wrapper de layout.              | `size`: 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' — controla `max-width` (ver sección `Layout` para el detalle).                              |
| **`AspectRatio`** | Fuerza una relación de aspecto. | `ratio`: number (ej. `16 / 9`). Se compone con otro contenido (`Image`, etc.), no es una API todo-en-uno.                                  |
| **`Tabs`**        | Navegación por pestañas.        | `defaultValue`/`value`/`onValueChange` en el root; **Subcomponentes:** `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`                      |
| **`ToggleGroup`** | Opciones que cambian un valor.  | `type`: 'single' \| 'multiple'; `size`: 'sm' \| 'md' \| 'lg'; **Subcomponentes:** `<ToggleGroupItem>`                                      |

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
  - **Props principales:** `href?: string` (por defecto `#main-content`); `children?: React.ReactNode` (por defecto `'Skip to content'`); `className?: string`; acepta `React.AnchorHTMLAttributes<HTMLAnchorElement>`.
  - **Descripción:** enlace accesible para saltar al contenido principal; está estilizado con `buttonVariants` y posicionamiento oculto hasta recibir foco (ideal para accesibilidad keyboard users / screen readers).
  - **z-index:** `z-60` por defecto, así que al recibir el foco queda por encima de una cabecera fija `z-50`; `className` puede cambiarlo.
  - **Uso:**

```tsx
// Insertar al principio del layout
<SkipToContent />

// Personalizar destino y texto
<SkipToContent href="#content">Saltar al contenido</SkipToContent>
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
  - `DialogContent`: props comunes: `className?: string`, `children?: React.ReactNode` y otros props de `@radix-ui/react-dialog` Content (e.g. `onInteractOutside`). Soporta clases de animación y `sm:max-w-...` para controlar anchura. `closeLabel?: string` (default `'Close'`) es el nombre accesible de la ✕; su anillo de foco aparece solo al enfocarla con el teclado.
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

- **Exports:** `Sheet`, `SheetTrigger`, `SheetContent`, `SheetOverlay`, `SheetClose`, `SheetPortal`, `SheetHeader`, `SheetBody`, `SheetFooter`, `SheetTitle`, `SheetDescription`.
- **Props y comportamiento clave:**
  - `Sheet` (root): acepta `open?: boolean` y `onOpenChange?: (open: boolean) => void` para controlarlo externamente, o funciona no-controlado por defecto.
  - `SheetContent`: `side?: 'top' | 'right' | 'bottom' | 'left'` — controla desde qué lado aparece el sheet (por defecto `right`); `closeLabel?: string` (default `'Close'`) — nombre accesible de la ✕; `className?: string`; `children?: React.ReactNode`.
  - `SheetHeader`, `SheetBody`, `SheetFooter`: la estructura recomendada del panel. `SheetBody` es la zona con scroll; header y footer quedan fijos. Los tres aceptan `className?: string` y `React.HTMLAttributes<HTMLDivElement>`.
  - `SheetTrigger`: `asChild?: boolean`, `className?: string` — se usa para disparar el sheet y puede renderizar un elemento existente (ej. `Button`) conservando estilos.
  - `SheetOverlay`: `className?: string` — fondo/backdrop (opacidad, blur) que se muestra detrás del contenido.
  - `SheetClose`: botón que cierra el sheet; admite `asChild` para usar un `Button` o enlace como cierre.

La implementación utiliza `@radix-ui/react-dialog` con variantes visuales definidas en `sheetVariants.ts` (clases para `side` con animaciones y tamaños responsivos). El overlay y el content incluyen animaciones de entrada/salida; Radix gestiona foco y atributos ARIA para accesibilidad.

**Comportamiento no obvio:** `SheetContent` es una columna flex que separa sus hijos con 16px (`gap-4`); no hace falta padding propio entre header, body y footer. Con `SheetBody`, el contenido largo hace scroll dentro del body y header y footer quedan siempre visibles, en los cuatro lados. Sin `SheetBody`, el panel entero hace scroll y la ✕ se desplaza con el contenido. `top` y `bottom` ocupan como máximo el 85% del alto; `left` y `right`, el alto completo. El panel, la ✕ y el header respetan el safe area (`env(safe-area-inset-*)`) de los bordes que tocan el viewport, así que el título no queda debajo de la ✕ aunque haya muesca; solo surte efecto si la app declara `viewport-fit=cover` (en Next.js: `export const viewport = { viewportFit: 'cover' }`). La ✕ muestra el anillo de foco solo al enfocarla con el teclado.

Uso (ejemplo extraído de `Sheet.stories.tsx`):

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open right sheet</Button>
  </SheetTrigger>

  <SheetContent side="right" closeLabel="Cerrar">
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here. Click save when you're done.
      </SheetDescription>
    </SheetHeader>

    <SheetBody>
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="name" className="text-right text-sm font-medium">
          Name
        </label>
        <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
      </div>
    </SheetBody>

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
- Dentro de un `Sheet`, un `Combobox` va en `mode="inline"` (ver [Combobox](#combobox--uso-y-props)).
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

**Comportamiento no obvio:** el `activationMode` por defecto de Radix Tabs es `"automatic"` — `ArrowRight`/`ArrowLeft` mueven el foco **y** activan el tab en el mismo paso, sin necesitar `Enter`/`Space` adicional. Pensado para grupos chicos (2-5 opciones), no para una fila larga de tabs de dashboard. `activationMode="manual"` conviene cuando mostrar un panel es costoso: las flechas solo mueven el foco y Space o Enter muestran el panel.

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

### ToggleGroup — Uso y Props

- **Exports:** `ToggleGroup`, `ToggleGroupItem`. Client component; requiere el peer `@radix-ui/react-toggle-group`.
- **Props principales:**
  - `ToggleGroup`: `type: 'single' | 'multiple'` (requerido); `value`/`defaultValue`/`onValueChange` (`string` en modo único, `string[]` en múltiple); `size?: 'sm' | 'md' | 'lg'` (32 / 44 / 48px, default `'md'`); `orientation`, `disabled` y `loop` pasan directo a Radix.
  - `ToggleGroupItem`: `value: string` (requerido), `size?` (sobrescribe el del grupo), `disabled?`. Si solo muestra un ícono, necesita `aria-label`.

**Comportamiento no obvio:** `ToggleGroup` cambia un valor; `Tabs` cambia qué panel se ve. En modo único (`radiogroup`), una vez elegido un valor siempre hay uno: el clic sobre el ítem activo no lo desactiva y `onValueChange` nunca recibe `''`. En modo múltiple (`toolbar`, `aria-pressed`) puede quedar vacío. Las flechas mueven el foco **sin seleccionar** y Space o Enter seleccionan; en modo único esto se aparta a propósito del patrón de radio de ARIA, para que recorrer las opciones no dispare una consulta por cada una. El grupo mide lo mismo que sus ítems, así que queda alineado con un `Button` del mismo `size`. Tiene el estilo del segmento de `Tabs`: fondo `bg-base-200` e ítem activo `bg-primary`.

```tsx
<ToggleGroup type="single" defaultValue="list" aria-label="Vista">
  <ToggleGroupItem value="list" aria-label="Lista">
    <ListBulletIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="grid" aria-label="Cuadrícula">
    <GridIcon />
  </ToggleGroupItem>
</ToggleGroup>
```

### 🔲 Overlays

Contenido flotante posicionado relativo a un trigger (Portal + `@radix-ui/react-popper`), con animaciones de entrada/salida y la misma superficie visual (`bg-base-100`, `rounded-box`, `border-base-300`, `shadow-md`) en los tres.

| Componente     | Descripción                             | Props clave                                                                                                                                                                                                                      |
| :------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Popover`      | Contenido flotante disparado por click  | `align`, `sideOffset`; **Subcomponentes:** `<PopoverTrigger>`, `<PopoverAnchor>`, `<PopoverContent>`                                                                                                                             |
| `Tooltip`      | Texto flotante disparado por hover/foco | Requiere `<TooltipProvider>`; **Subcomponentes:** `<TooltipTrigger>`, `<TooltipContent>`                                                                                                                                         |
| `DropdownMenu` | Menú de acciones/opciones               | **Subcomponentes:** `<DropdownMenuTrigger>`, `<DropdownMenuContent>`, `<DropdownMenuItem>`, `<DropdownMenuCheckboxItem>`, `<DropdownMenuRadioGroup>`/`<DropdownMenuRadioItem>`, `<DropdownMenuLabel>`, `<DropdownMenuSeparator>` |

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

**En dispositivos táctiles el contenido de `Tooltip` no está disponible — es una decisión de diseño aceptada, no un bug.** Radix nunca abre el tooltip ante un tap (ignora explícitamente `pointerType === 'touch'` en su handler de apertura), y `TooltipContent` añade `pointer-coarse:hidden` como capa defensiva de CSS: en un dispositivo cuyo input principal es de baja precisión (dedo) el panel queda oculto aunque algo intente mostrarlo. **`Tooltip` no es apto para información que el usuario necesite en touch.** Para esos casos usa [`Popover`](#popover--uso-y-props), que sí soporta tap de forma nativa.

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

| Componente        | Descripción                            | Props clave                                                                                                                                                  |
| :---------------- | :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Input`           | Campo de texto                         | `type`, `label?`, `error?`, `helperText?`, `startIcon?`, `endIcon?`, `clearable?`, `onClear?`, `clearLabel?`, `variant?`, `size?`, `disabled?`, `className?` |
| `Textarea`        | Texto multilinea                       | Standard HTML props, `variant?`, `error?`, `className?`                                                                                                      |
| `Select`          | Dropdown avanzado                      | `value?`, `defaultValue?`, `onValueChange?`, `placeholder?`, `className?`                                                                                    |
| `Switch`          | Toggle binario                         | `checked?`, `defaultChecked?`, `onCheckedChange?`, `disabled?`, `className?`                                                                                 |
| `Checkbox`        | Casilla de selección                   | `checked?`, `defaultChecked?`, `onCheckedChange?`, `disabled?`, `className?`                                                                                 |
| `Calendar`        | Grilla de calendario                   | `mode`, `selected`, `onSelect`, `showOutsideDays?` (todos los props de `DayPicker`)                                                                          |
| `Combobox`        | Selección con buscador (cmdk)          | `options`, `label` o `aria-label`, `multiple?`, `value?`, `defaultValue?`, `onValueChange?`, `mode?`, `size?`, `disabled?`                                   |
| `QuantityStepper` | Campo numérico con botones − / +       | `value?`, `defaultValue?`, `onChange?`, `min?`, `max?`, `step?`, `decrementLabel?`, `incrementLabel?`                                                        |
| `DatePicker`      | Selector de fecha (Popover + Calendar) | `date?`, `onDateChange?`, `placeholder?`, `disabled?`, `className?`, `dialogLabel?`, `locale?`                                                               |

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

- **Exports:** `Input`, `inputVariants`; tipos `InputProps`, `InputBaseProps`, `InputWithEndIconProps`, `ClearableInputProps`.
- **Props principales:**
  - `label?: string` — etiqueta accesible asociada al `input`.
  - `type?: string` — tipo estándar de `input` (`text`, `email`, `password`, etc.).
  - `error?: string` — mensaje de error; activa la variante visual `error` y `aria-invalid`.
  - `helperText?: string` — texto de ayuda descriptivo (vinculado mediante `aria-describedby`).
  - `startIcon?: React.ReactNode`, `endIcon?: React.ReactNode` — iconos dentro del campo (decorativos: su contenedor lleva `aria-hidden="true"`).
  - `clearable?: boolean` — muestra un botón para vaciar el campo mientras tenga valor. No se admite junto con `endIcon` (ocupa su lugar).
  - `onClear?: () => void` — se llama después de vaciar el campo. Solo con `clearable`.
  - `clearLabel?: string` (default `'Clear'`) — `aria-label` del botón de limpiar. Solo con `clearable`.
  - `variant?: 'default' | 'error'` — variantes visuales (definidas en `inputVariants.ts`).
  - `size?: 'sm' | 'md' | 'lg'` (default `'md'`) — alturas: `sm` = 32px, `md` = 44px, `lg` = 48px. Comparte escala con `Button` y el trigger de `Select` — ver la nota de alineación en la sección de `Button`.
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

**Comportamiento no obvio (`clearable`):** vaciar el campo dispara el `onChange` del consumidor, en modo controlado, no controlado y con `register` de react-hook-form; después se llama a `onClear` y el foco vuelve al input. El botón solo se ve mientras el campo tiene valor (también tras `reset()`/`setValue()` de RHF) y no aparece con `disabled` ni `readOnly`. No limpia con Escape, para no interferir con el cierre de un `Dialog`/`Sheet`. `clearable` acepta un `boolean` dinámico.

**Tipos:** `InputProps` es una unión discriminada por `clearable` (`InputWithEndIconProps | ClearableInputProps`), así que `endIcon` junto a `clearable`, o `onClear`/`clearLabel` sin `clearable`, no compilan. Dos consecuencias para quien deriva tipos de `Input`:

- `interface X extends InputProps` no compila (una interface no puede extender una unión): extender `InputBaseProps`.
- `Omit<InputProps, K>` compila, pero pierde en silencio esa exclusión, porque `Omit` no reparte sobre uniones. Usar un Omit por rama:

```ts
import type { InputProps } from '@abelardo-salazar/core-ui-design-system';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type SearchFieldProps = DistributiveOmit<InputProps, 'type'>;
```

```tsx
import { useState } from 'react';
import { Input } from '@abelardo-salazar/core-ui-design-system';

export function SearchField() {
  const [query, setQuery] = useState('');
  return (
    <Input
      label="Buscar"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      clearable
      clearLabel="Borrar búsqueda"
      onClear={() => console.log('búsqueda vacía')}
    />
  );
}
```

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
  - `SelectTrigger`: `className?: string`, `asChild?: boolean` — dispara el panel y puede renderizar elementos existentes como trigger. Alto fijo de 44px (sin prop `size`: `SelectTrigger` no tiene escala propia) — comparte altura con `Button` `md` e `Input` `md`, ver la nota de alineación en la sección de `Button`.
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
  - `dialogLabel?: string` (default `'Choose date'`) — nombre accesible del popover.
  - `locale?: Locale` (de `date-fns`) — se aplica a la fecha del disparador y al calendario. Con un locale de `date-fns` las etiquetas de navegación del calendario quedan en inglés; con los locales que exporta el DS desde el subpath `/locale` (`import { es } from '@abelardo-salazar/core-ui-design-system/locale'`) también se traducen. Ese subpath reexporta los locales de DayPicker (los de `date-fns` con las etiquetas traducidas), es server-safe y solo empaqueta los locales que se importan. No importar desde `@daypicker/react`: es dependencia del DS, no de la app (con pnpm no se resuelve).
  - `disabled?: boolean`.
  - `className?: string` — se aplica al `Button` trigger.

**Comportamiento no obvio:** `DatePicker` es **100% controlado, sin estado interno propio** — compone `Popover` + `Button` (trigger) + `Calendar` (`mode="single"`) tal cual ya existen en el DS, no una API monolítica aparte. El consumidor maneja `date`/`onDateChange` desde afuera, igual que lo haría en una app real. Formatea la fecha visible con `date-fns` (`format(date, 'PPP', { locale })`). El calendario abre en el mes de `date` (sin `date`, en el mes actual) y la navegación sigue libre. Para el `locale`, ver [Locales](#locales--subpath-locale): no se puede pasar desde un Server Component.

Uso (ejemplo, extraído de `DatePicker.stories.tsx`):

```tsx
function ControlledDatePicker() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return <DatePicker date={date} onDateChange={setDate} />;
}
```

### Locales — subpath `/locale`

- **Import:** `@abelardo-salazar/core-ui-design-system/locale`.
- **Exports:** los locales de DayPicker (`es`, `enUS`, `ptBR`, `fr`, etc.: los de `date-fns`, con meses y etiquetas de navegación del calendario traducidos) y sus tipos (`DayPickerLocale`, `DayPickerLocaleLabels`, y los tipos de locale de `date-fns`, como `Locale`).
- **Dónde se usan:** en `locale` de `DatePicker` y de `Calendar`.

**Comportamiento no obvio:** el subpath son datos, sin `'use client'`, y solo se empaqueta el locale que se importa. Se puede importar desde un Server Component, pero un locale contiene funciones, así que **no se puede pasar como prop desde un Server Component a `DatePicker` o `Calendar`** (que son client components): React no serializa funciones. El error no aparece en `next build` sino al renderizar la página (`Functions cannot be passed directly to Client Components`). Importarlo en el componente cliente que renderiza el `DatePicker`. Con un locale de `date-fns` (en vez de este subpath), las etiquetas de navegación del calendario ("Go to the Next Month") quedan en inglés. No importar desde `@daypicker/react/locale`: es dependencia del DS, no de la app (con pnpm no se resuelve y su versión puede no coincidir).

```tsx
'use client';

import { useState } from 'react';
import { DatePicker } from '@abelardo-salazar/core-ui-design-system';
import { es } from '@abelardo-salazar/core-ui-design-system/locale';

export function BookingDate() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <DatePicker
      date={date}
      onDateChange={setDate}
      locale={es}
      placeholder="Elige una fecha"
      dialogLabel="Elegir fecha"
    />
  );
}
```

### Combobox — Uso y Props

- **Exports:** `Combobox`; tipos `ComboboxProps`, `ComboboxSingleProps`, `ComboboxMultipleProps`, `ComboboxLabelProps`, `ComboboxOption`. Client component; requiere el peer `cmdk`.
- **Props principales:**
  - `options: { value: string; label: string; disabled?: boolean }[]` (requerido).
  - `label: string` **o** `aria-label: string` — uno de los dos, no ambos (lo exigen los tipos). `label` dibuja la etiqueta visible, con el estilo de la de `Input`; `aria-label` nombra el campo sin etiqueta visible.
  - `multiple?: boolean` — sin `multiple`: `value?`/`defaultValue?: string` (`''` sin valor) y `onValueChange?: (value: string) => void`. Con `multiple`: `string[]` y `(value: string[]) => void`.
  - `mode?: 'popover' | 'inline'` (default `'popover'`).
  - `size?: 'sm' | 'md' | 'lg'` (32 / 44 / 48px, la escala de `Input` y `Select`; default `'md'`).
  - `disabled?: boolean` — deshabilita el disparador, el buscador y los Chips.
  - `id?: string` — id del botón (en `mode="inline"`, del contenedor). No se usa para etiquetar: usar `label`.
  - Textos, en inglés por defecto: `placeholder` (`'Select...'`), `searchPlaceholder` (`'Search...'`), `emptyLabel` (`'No results.'`), `removeLabel: (label: string) => string` (default `` (label) => `Remove ${label}` ``).
  - `className?: string` — en el contenedor raíz (etiqueta + campo).

**Comportamiento no obvio:**

- **Popover:** un disparador con el estilo de `Select` abre el buscador y la lista. En modo único, elegir cierra el popover y devuelve el foco al disparador (elegir la opción actual no la deselecciona). En múltiple, el popover queda abierto. Escape cierra y devuelve el foco. Un clic en la etiqueta abre el popover.
- **En línea:** buscador y lista siempre visibles, sin disparador; un clic en la etiqueta enfoca el buscador. **Dentro de un `Sheet` o `Dialog`, usar `mode="inline"`** (no se impone por código).
- **Múltiple:** las opciones elegidas se muestran como `Chip` con ✕, fuera del botón (en línea, encima del buscador). Al quitar uno, el foco pasa al Chip siguiente o, si no hay, al botón (al buscador en línea).
- **Filtro:** busca el texto en cualquier parte de la etiqueta, sin distinguir mayúsculas ni acentos ("mexico" encuentra "México"), y conserva el orden de `options`. No es configurable.
- **Accesibilidad:** el disparador anuncia la etiqueta y el valor actual ("País, México"); el popover, el buscador y la lista toman el nombre de la etiqueta. La asociación ya viene en el HTML del servidor y sigue los cambios de `label`. Las opciones elegidas llevan `aria-checked="true"`; `aria-selected` marca la opción resaltada con el teclado.
- Fuera de esta versión: búsqueda asíncrona, estado de carga y grupos.

```tsx
import { useState } from 'react';
import { Combobox, type ComboboxOption } from '@abelardo-salazar/core-ui-design-system';

const countries: ComboboxOption[] = [
  { value: 'ar', label: 'Argentina' },
  { value: 'mx', label: 'México' },
  { value: 'pe', label: 'Perú', disabled: true },
];

export function CountryField() {
  const [country, setCountry] = useState('');
  return <Combobox label="País" options={countries} value={country} onValueChange={setCountry} />;
}

export function CountriesFilter() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <Combobox
      aria-label="Países"
      multiple
      mode="inline"
      options={countries}
      value={selected}
      onValueChange={setSelected}
      placeholder="Elige..."
      searchPlaceholder="Buscar..."
      emptyLabel="Sin resultados."
      removeLabel={(label) => `Quitar ${label}`}
    />
  );
}
```

### QuantityStepper — Uso y Props

- **Exports:** `QuantityStepper`; tipo `QuantityStepperProps`. Client component.
- **Props principales:**
  - `value?: number`, `defaultValue?: number` (default: `min` si es finito, si no `0`), `onChange?: (value: number) => void` — controlado o no controlado. `onChange` recibe un número, no un evento.
  - `min?: number`, `max?: number` (sin límite por defecto), `step?: number` (default `1`).
  - `disabled?: boolean`.
  - `decrementLabel?: string` (default `'Decrease quantity'`), `incrementLabel?: string` (default `'Increase quantity'`) — nombres accesibles de los botones − y +.
  - `aria-label?: string` (default `'Quantity'`) — nombre accesible del campo numérico.
  - `className?: string` — en el contenedor (`role="group"`); el resto de los atributos de `<input>` van al campo.

**Comportamiento no obvio:** los botones − y + se deshabilitan de verdad (no solo ignoran el clic) cuando el siguiente paso saldría de `min`/`max`. Lo que se escribe en el campo se recorta a `[min, max]`; el campo puede quedar vacío mientras se edita y, al perder el foco vacío, vuelve a `0` recortado al rango. Botones y campo miden 44px, alineados con `Button` e `Input` `md`.

```tsx
import { useState } from 'react';
import { QuantityStepper } from '@abelardo-salazar/core-ui-design-system';

export function CartQuantity() {
  const [quantity, setQuantity] = useState(1);
  return (
    <QuantityStepper
      value={quantity}
      onChange={setQuantity}
      min={1}
      max={10}
      aria-label="Cantidad"
      decrementLabel="Quitar uno"
      incrementLabel="Agregar uno"
    />
  );
}
```

### 📢 Feedback (Notificaciones)

| Componente     | Descripción                              | Props clave                                                                                                                        |
| :------------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `Toast`        | Notificaciones no-modales (Sonner)       | Ver props de `<Toaster />` más abajo                                                                                               |
| `Progress`     | Barra de progreso lineal                 | `value`, `max?`, `variant?: 'primary'\|'success'\|'warning'\|'error'`, `className?`                                                |
| `ProgressRing` | Progreso circular (anillo SVG)           | `value`, `max?`, `variant?`, `size?`, `strokeWidth?`, `showValueLabel?`                                                            |
| `EmptyState`   | Estado vacío (sin datos, sin resultados) | `size?: 'sm'\|'md'`; **Subcomponentes:** `<EmptyStateIcon>`, `<EmptyStateTitle>`, `<EmptyStateDescription>`, `<EmptyStateActions>` |
| `Alert`        | Aviso inline persistente (no-modal)      | `variant?: 'info'\|'success'\|'warning'\|'error'`, `icon?`; **Subcomponentes:** `<AlertTitle>`, `<AlertDescription>`               |

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

Un `Alert` `info`/`success` que se **monta** dinámicamente no se anuncia: los lectores de pantalla solo anuncian cambios dentro de una región viva que ya existía. Para avisar el resultado de una acción, usar [`announce()`](#announce--uso-y-opciones) o dejar el `Alert` montado y cambiar su contenido. `alertVariants` y `alertIconVariants` (las clases de la raíz y del ícono por `variant`) también se exportan.

### EmptyState — Uso y Props

- **Exports:** `EmptyState`, `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateActions`; tipos `EmptyStateProps`, `EmptyStateTitleProps`. Server-safe.
- **Props principales:**
  - `EmptyState`: `size?: 'sm' | 'md'` (default `'md'`) — `sm` para tablas y tarjetas, `md` para una página; `className?: string` y `React.HTMLAttributes<HTMLDivElement>`.
  - `EmptyStateIcon`: el ícono (decorativo, `aria-hidden`), dentro de un círculo.
  - `EmptyStateTitle`: `as?: 'p' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'` (default `'p'`) — usar un heading cuando el estado vacío encabeza una sección.
  - `EmptyStateDescription`: texto secundario.
  - `EmptyStateActions`: fila de botones o enlaces.
  - Todas las partes aceptan `className?: string`.

**Comportamiento no obvio:** la raíz no tiene `role`. Si el estado vacío aparece como resultado de una acción (un filtro sin resultados), anunciarlo con [`announce()`](#announce--uso-y-opciones). El `size` llega a las partes por CSS, no por contexto de React, para que todo siga siendo server-safe. Por eso, en la raíz el `className` gana sobre el padding de `size`, pero en las partes los ajustes de `sm` ganan sobre el `className`; para cambiarlos, usar la misma variante (`group-data-[size=sm]/empty-state:…`). `DataTable` usa un `EmptyState` `sm` como estado vacío por defecto.

```tsx
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '@abelardo-salazar/core-ui-design-system';

export function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <EmptyState size="sm">
      <EmptyStateIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      </EmptyStateIcon>
      <EmptyStateTitle as="h2">Sin resultados</EmptyStateTitle>
      <EmptyStateDescription>Prueba con otros filtros.</EmptyStateDescription>
      <EmptyStateActions>
        <Button variant="outline" onClick={onReset}>
          Quitar filtros
        </Button>
      </EmptyStateActions>
    </EmptyState>
  );
}
```

### ♿ Accesibilidad

| Export           | Descripción                                                   | API                                                           |
| :--------------- | :------------------------------------------------------------ | :------------------------------------------------------------ |
| `VisuallyHidden` | Oculta contenido a la vista, visible para lectores            | `as?`, `className?`                                           |
| `announce()`     | Anuncia un mensaje a los lectores de pantalla sin montar nada | `announce(message, { politeness?: 'polite' \| 'assertive' })` |

### VisuallyHidden — Uso y Props

- **Exports:** `VisuallyHidden`; tipo `VisuallyHiddenProps`. Server-safe.
- **Props principales:** `as?: React.ElementType` (default `'span'`); `className?: string` y `React.HTMLAttributes<HTMLElement>`.

**Comportamiento no obvio:** renderiza un `span`, que no puede envolver contenido de bloque; para envolver un `SheetTitle` o `DialogTitle` que el diseño no muestra (Radix exige el título), usar `as="div"`.

```tsx
import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  VisuallyHidden,
} from '@abelardo-salazar/core-ui-design-system';

export function MenuSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Menú</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <VisuallyHidden as="div">
          <SheetTitle>Menú principal</SheetTitle>
        </VisuallyHidden>
        <nav>…</nav>
      </SheetContent>
    </Sheet>
  );
}
```

### announce() — Uso y opciones

- **Exports:** `announce`; tipo `AnnounceOptions`.
- **Firma:** `announce(message: string, options?: { politeness?: 'polite' | 'assertive' }): void` (default `'polite'`).

**Comportamiento no obvio:** no hay que montar nada: la primera llamada crea la región viva. La región no queda oculta con un `Dialog` o `Sheet` abierto, y no depende de que se haya importado el CSS del paquete. Repetir el mismo mensaje lo vuelve a anunciar; el texto se borra solo a los pocos segundos, y en el servidor la función no hace nada. Pensada para confirmaciones ("Producto agregado") y resultados de acciones que no mueven el foco. `'assertive'` interrumpe al lector: reservarlo para errores. No se ha probado con un lector de pantalla real.

```tsx
import { announce, Button } from '@abelardo-salazar/core-ui-design-system';

export function AddToCart({ onAdd }: { onAdd: () => void }) {
  return (
    <Button
      onClick={() => {
        onAdd();
        announce('Producto agregado al carrito');
      }}
    >
      Agregar
    </Button>
  );
}
```

### 📊 Datos

| Componente  | Descripción                                                             | API & Composición                                                                                                                                                                                            |
| :---------- | :---------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Table`     | 8 primitivos HTML de tabla, estilizados                                 | `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableFooter>`, `<TableRow>`, `<TableHead>`, `<TableCell>`, `<TableCaption>`                                                                                     |
| `DataTable` | Tabla con sorting, filtro global y paginación                           | `columns: ColumnDef<typeof features, TData>[]`, `data`, `searchPlaceholder?`, `className?` (sobre `@tanstack/react-table` v9)                                                                                |
| `Chart`     | Charts de Bar/Line/Area/Pie/Ring sobre recharts — **subpath `/charts`** | `ChartContainer`, `ChartTooltipContent`, `ChartLegendContent` + re-exports de recharts (`BarChart`, `LineChart`, `AreaChart`, `PieChart`, etc.), todo desde `@abelardo-salazar/core-ui-design-system/charts` |

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
  - `searchPlaceholder?: string` (default `'Search...'`) — la caja de búsqueda global **siempre es visible**, no es opcional vía prop. También es su nombre accesible.
  - `emptyState?: React.ReactNode` (default: `EmptyState` `sm` con el título `'No results.'`).
  - `previousLabel?: string` (default `'Previous'`), `nextLabel?: string` (default `'Next'`).
  - `pageLabel?: (page: number, total: number) => string` (default `` (page, total) => `Page ${page} of ${total}` ``) — `page` empieza en 1.
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

> **Import desde el subpath `/charts`, no desde el barrel principal.** `Chart` arrastra
> `recharts`, que llama `createContext()` a nivel de módulo — incluirlo en el barrel raíz
> rompía el paquete entero para cualquier consumidor de React Server Components (Next.js App
> Router), aun sin usar `Chart`. Desde `0.4.1` `Chart` tiene su propio entry point,
> `client-only` completo:
>
> ```tsx
> // ✅ Chart va por su subpath propio
> import {
>   ChartContainer,
>   ChartTooltipContent,
>   ChartLegendContent,
>   ChartTooltip,
>   ChartLegend,
>   BarChart,
>   Bar,
>   XAxis,
>   YAxis,
>   CartesianGrid,
>   type ChartConfig,
> } from '@abelardo-salazar/core-ui-design-system/charts';
>
> // ✅ El resto del DS sigue igual, desde el barrel principal
> import { Card, Heading } from '@abelardo-salazar/core-ui-design-system';
> ```
>
> El resto de la API de `Chart` no cambió — es exclusivamente una reestructuración de dónde
> se importa. Versión publicada afectada por el bug: **`0.4.0`** (única versión donde `Chart`
> existía).

- **Exports:** `ChartContainer`, `ChartTooltipContent`, `ChartLegendContent`, `ChartConfig` (tipo), `CHART_COLOR_TOKENS`, más re-exports directos de `recharts` (sin wrapper propio, mismo criterio que `Popover` re-exportando `PopoverAnchor`): `BarChart`/`Bar`, `LineChart`/`Line`, `AreaChart`/`Area`, `PieChart`/`Pie`/`Cell`/`Label`, `XAxis`, `YAxis`, `CartesianGrid`, `ResponsiveContainer`, `ChartTooltip` (el `Tooltip` de recharts, renombrado — choca en compilación con el `Tooltip` propio del DS vía `export *`), `ChartLegend` (el `Legend` de recharts, renombrado por consistencia con `ChartTooltip`).
- **Props principales:**
  - `ChartContainer`: `config: ChartConfig` (`Record<string, { label?: ReactNode; color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info' }>`, requerido), `children` (el chart de recharts), más `React.ComponentPropsWithoutRef<'div'>`.
  - `ChartTooltipContent`: `config: ChartConfig` (requerido), `hideLabel?: boolean`, `indicator?: 'dot' | 'line'` (default `'dot'`) — el resto (`active`/`payload`/`label`) lo inyecta Recharts.
  - `ChartLegendContent`: `config: ChartConfig` (requerido) — el resto (`payload`) lo inyecta Recharts.

Alcance: **Bar, Line, Area, Pie — incluyendo Ring (donut)**. `recharts` **no** es peerDependency: viene bundleado dentro del paquete del DS.

**Comportamiento no obvio:**

- `ChartContainer` inyecta `--color-<key>` como variable CSS por cada entrada de `config`, apuntando al token real del DS (`var(--color-primary)`, etc). Las piezas de datos referencian esa variable vía `fill`/`stroke` (ej. `fill="var(--color-escritorio)"`), nunca un color fijo — así responden solas a claro/oscuro. Esto es más simple que el recipe original de `ChartContainer` de shadcn/ui (que además inyecta un bloque `<style>` duplicado por tema): acá no hace falta, los tokens del DS ya cambian de valor solos con `.dark`.
- "**Ring**" (donut) no es un componente propio: se logra componiendo `Pie` con `innerRadius`/`outerRadius` (el hueco) y un texto central armado a mano.
- **`<Label position="center">` no sirve para el texto central de un Ring** — probado contra un `Pie` real, no renderiza nada en `recharts@3.10.1`. Es un bug/quirk conocido de la propia librería ([issue #6030 de recharts](https://github.com/recharts/recharts/issues/6030)): para `position="center"` específicamente, `Label` resuelve el viewBox contra el contexto _cartesiano_ en vez del _polar_, y un `PieChart` sin ejes nunca provee ese contexto cartesiano. Para el texto central de un Ring, usa un `<text x="50%" y="50%">` crudo como hijo de `Pie` (`Pie` renderiza sus `children` tal cual, sin filtrarlos) — los porcentajes se resuelven contra el viewport del propio `<svg>`, sin JS ni conocer el tamaño del contenedor. Ver `RingChartExample` en `Chart.stories.tsx` para el patrón completo.
- Para `Pie`, el tooltip y la leyenda resuelven cada porción por `name`/`value`, no por `dataKey` — en un `Pie`, `dataKey` es el mismo string (el campo del valor numérico, ej. `"value"`) en **todas** las porciones; lo que distingue cada porción es `name` (tooltip) / `value` (leyenda), resuelto por Recharts vía `nameKey`.

Uso (ejemplos, extraídos de `Chart.stories.tsx`):

```tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  type ChartConfig,
} from '@abelardo-salazar/core-ui-design-system/charts';

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

### 🧾 Tipos y utilidades exportados

Además de los componentes, cada entry point exporta los tipos de sus props y algunas utilidades, para extender o envolver componentes sin redeclarar sus tipos.

**`@abelardo-salazar/core-ui-design-system`**

| Grupo                  | Exports                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tipos de props         | `AlertProps`, `AspectRatioProps`, `BadgeProps`, `ButtonProps`, `CalendarProps`, `CheckboxProps`, `ChipProps`, `ContainerProps`, `DataTableProps`, `DatePickerProps`, `HeadingProps`, `ImageProps`, `ProgressProps`, `ProgressRingProps`, `SwitchProps`, `TextProps`, `TextareaProps`                                                                                                                                                              |
| Tipos de props (0.5.0) | `ComboboxProps`, `ComboboxSingleProps`, `ComboboxMultipleProps`, `ComboboxLabelProps`, `ComboboxOption`, `EmptyStateProps`, `EmptyStateTitleProps`, `InputProps`, `InputBaseProps`, `InputWithEndIconProps`, `ClearableInputProps`, `QuantityStepperProps`, `SheetContentProps`, `SkipToContentProps`, `ToggleGroupProps`, `ToggleGroupSingleProps`, `ToggleGroupMultipleProps`, `ToggleGroupItemProps`, `VisuallyHiddenProps`, `AnnounceOptions` |
| Variantes (`cva`)      | `buttonVariants`, `badgeVariants`, `inputVariants`, `alertVariants`, `alertIconVariants` — devuelven las clases de cada variante, para dar el mismo aspecto a un elemento propio (por ejemplo, un `Link` con `buttonVariants({ variant: 'outline' })`)                                                                                                                                                                                            |
| Utilidades             | `cn(...inputs)` — combina clases con `clsx` y resuelve conflictos de Tailwind con `tailwind-merge` (la última gana); `toast` (ver [Toast](#toast--uso-y-props)); `features` (ver [DataTable](#datatable--uso-y-props)); `announce` (ver [announce()](#announce--uso-y-opciones))                                                                                                                                                                  |

**`@abelardo-salazar/core-ui-design-system/charts`**: además de los componentes de [Chart](#chart--uso-y-props), `ChartConfig`, `ChartColorToken` y `CHART_COLOR_TOKENS` (los tokens de color válidos en `config`), los tipos `ChartContainerProps`, `ChartTooltipProps`, `ChartTooltipContentProps`, `ChartLegendProps`, `ChartLegendContentProps`, y los tipos de props de los re-exports de recharts: `AreaProps`, `BarProps`, `CartesianGridProps`, `CellProps`, `LabelProps`, `LineProps`, `PieProps`, `ResponsiveContainerProps`, `XAxisProps`, `YAxisProps`.

**`@abelardo-salazar/core-ui-design-system/locale`**: ver [Locales](#locales--subpath-locale).

```tsx
import { cn, type ButtonProps, Button } from '@abelardo-salazar/core-ui-design-system';

export function ToolbarButton({ className, ...props }: ButtonProps) {
  return <Button variant="ghost" size="sm" className={cn('gap-1', className)} {...props} />;
}
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

Las notas de arquitectura (theming, `src/tailwind.css` y las dos hojas de estilos) y la convención de versiones y tags para publicar viven en [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🤖 Integración Continua (CI)

Cada Pull Request contra `main` (y cada push a `main`) dispara el workflow
**`.github/workflows/ci.yml`** (GitHub Actions), con un único job, `verify`, que es el check
obligatorio para mergear. Corre sobre **Node 22 LTS**, con un límite de 20 minutos; si llega un
push nuevo a la misma rama, se cancela el run anterior. Pasos, en orden:

1. `npm ci` — instalación determinística desde `package-lock.json` (con caché de npm).
2. Chromium para Playwright: el navegador se guarda en caché con una clave que sigue la versión
   de `playwright` del lockfile; solo si no hay caché se instala con
   `npx playwright install chromium --only-shell` (Chrome Headless Shell, sin las dependencias
   del sistema vía apt, que el runner ya trae).
3. `npm run lint` — ESLint.
4. `npm run format:check` — Prettier.
5. `npx tsc -b` — typecheck.
6. `npm run build` — `verify-client-directives` (pre: `CLIENT_ENTRY_POINTS` sincronizado y
   ningún componente server-safe que arme handlers propios) + `tsc -b` + `vite build` +
   `verify-client-directives --post-build` (post: `dist/index.js` sin `recharts`,
   `dist/locale.js` sin el barrel raíz ni `recharts`, y `sideEffects` con los módulos con efectos
   de las dependencias empaquetadas).
7. `npm run verify:tailwind-consumer` — empaqueta con `npm pack`, arma sin red un consumidor
   con Tailwind v4 que importa `./tailwind.css` y lo compila con `@tailwindcss/cli`. Qué
   verifica y por qué: [ARCHITECTURE § Orden de utilidades entre dos compilaciones](./ARCHITECTURE.md#orden-de-utilidades-entre-dos-compilaciones).
8. `npm run test` — Vitest en modo browser (Chromium headless), con las stories como tests, en
   dos proyectos que corren uno después del otro:
   - `storybook`: todas las stories salvo las de tag `real-css`. No aplica las utilidades de
     Tailwind, así que sus aserciones van sobre clases y DOM.
   - `storybook-css`: solo las stories con tag `real-css`, las que necesitan el CSS aplicado
     (posición, z-index, `elementFromPoint`). Para sumar una, agregar `tags: ['real-css']`.
9. `npm audit --audit-level=high` — falla solo ante vulnerabilidades `high` /
   `critical`; `moderate` / `low` no bloquean.

Cualquier paso que falle marca el PR en rojo.

---

**Core UI Design System** © Abelardo Salazar / @abelardo-salazar 2026. Internal Use Only.
