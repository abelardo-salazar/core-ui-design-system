-

# Core UI Design System

![Version](https://img.shields.io/badge/version-0.3.1-blue.svg)
![React](https://img.shields.io/badge/react-19.0.0+-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-3178C6.svg)
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
@abelardo-salazar:registry=[https://npm.pkg.github.com](https://npm.pkg.github.com)
//[npm.pkg.github.com/:_authToken=TU_GITHUB_TOKEN_AQUI](https://npm.pkg.github.com/:_authToken=TU_GITHUB_TOKEN_AQUI)

```

> ⚠️ **IMPORTANTE:** Asegúrate de agregar `.npmrc` a tu `.gitignore` para no exponer tu token.

---

## 📦 2. Instalación

Una vez configurado el `.npmrc`, instala la librería como cualquier dependencia:

```bash
npm install @abelardo-salazar/core-ui-design-system

```

### Peer Dependencies

Asegúrate de que tu proyecto use React 19:

```bash
npm install react@^19.0.0 react-dom@^19.0.0

```

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
    - [🧬 Moléculas (Estructura)](#-moléculas-estructura)
    - [Layout — Uso y Props](#layout--uso-y-props)
    - [Card — Uso y Props](#card--uso-y-props)
    - [Dialog — Uso y Props](#dialog--uso-y-props)
    - [Sheet — Uso y Props](#sheet--uso-y-props)
    - [📝 Formularios (Forms)](#-formularios-forms)
    - [Checkbox — Uso y Props](#checkbox--uso-y-props)
    - [Input — Uso y Props](#input--uso-y-props)
    - [Textarea — Uso y Props](#textarea--uso-y-props)
    - [Select — Uso y Props](#select--uso-y-props)
    - [Switch — Uso y Props](#switch--uso-y-props)
    - [📢 Feedback (Notificaciones)](#-feedback-notificaciones)
    - [Toast — Uso y Props](#toast--uso-y-props)
  - [💻 Desarrollo Local](#-desarrollo-local)

---

## 🧩 4. Documentación de API

### 🧱 Átomos (Fundamentos)

| Componente  | Descripción                   | Props clave                                                                                 |
| :---------- | :---------------------------- | :------------------------------------------------------------------------------------------ |
| `Button`    | Botón interactivo polimórfico | `variant`, `size`, `isLoading`, `asChild`, `fullWidth`, `startIcon`, `endIcon`, `className` |
| `Heading`   | Títulos semánticos            | `level`, `as`, `className`                                                                  |
| `Text`      | Párrafos y texto cuerpo       | `size`, `weight`, `as`, `className`                                                         |
| `Badge`     | Etiquetas de estado           | `variant`, `className`                                                                      |
| `Avatar`    | Imagen de perfil con fallback | `src`, `alt`, `fallback`, `className`                                                       |
| `Separator` | Divisor visual                | `orientation`, `className`                                                                  |
| `Skeleton`  | Placeholder de carga          | `className`                                                                                 |

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
  - `className?: string` — clases adicionales (p. ej. para tamaño, espaciado o tipografía).
  - Acepta `React.HTMLAttributes<HTMLDivElement>` (eventos y atributos HTML estándar).

La implementación usa `class-variance-authority` con variantes definidas en `badgeVariants.ts`. La variante por defecto es `default`.

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

Descripción: componente ligero para placeholders en estados de carga. Aplica por defecto `animate-pulse rounded-md bg-slate-200 dark:bg-slate-200` y se usa para simular bloques de texto, imágenes o botones mientras se cargan datos. Para evitar salto de layout se recomienda usar patrones de carga que reserven el espacio final (por ejemplo, usar la estructura de `Card`).

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

### 🧬 Moléculas (Estructura)

| Componente      | Descripción                | API & Composición                                                                                                  |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **`Card`**      | Contenedor de información. | **Subcomponentes:** `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`            |
| **`Dialog`**    | Modal accesible.           | `open`: boolean; `onOpenChange`: (open: boolean) => void; **Subcomponentes:** `<DialogTrigger>`, `<DialogContent>` |
| **`Sheet`**     | Panel lateral (Drawer).    | `side`: "top"                                                                                                      |
| **`Container`** | Wrapper de layout.         | No props específicas. Limita el `max-width` automáticamente.                                                       |

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

### 📝 Formularios (Forms)

| Componente | Descripción          | Props clave                                                                                                         |
| :--------- | :------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `Input`    | Campo de texto       | `type`, `label?`, `error?`, `helperText?`, `startIcon?`, `endIcon?`, `variant?`, `size?`, `disabled?`, `className?` |
| `Textarea` | Texto multilinea     | Standard HTML props, `variant?`, `error?`, `className?`                                                             |
| `Select`   | Dropdown avanzado    | `value?`, `defaultValue?`, `onValueChange?`, `placeholder?`, `className?`                                           |
| `Switch`   | Toggle binario       | `checked?`, `defaultChecked?`, `onCheckedChange?`, `disabled?`, `className?`                                        |
| `Checkbox` | Casilla de selección | `checked?`, `defaultChecked?`, `onCheckedChange?`, `disabled?`, `className?`                                        |

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

### 📢 Feedback (Notificaciones)

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

**Core UI Design System** © Abelaro Salazar / @abelardo-salazar 2026. Internal Use Only.
