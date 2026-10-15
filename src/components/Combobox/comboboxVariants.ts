import { cva, type VariantProps } from 'class-variance-authority';

// Misma escala que Input (32 / 44 / 48, con su mismo padding horizontal y tamaño de texto) para
// que un Combobox quede alineado con Input y con el trigger de Select en un formulario.
export const comboboxTriggerVariants = cva(
  [
    'flex w-full items-center justify-between gap-2 rounded-btn border border-base-300 bg-base-100 text-left',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-11 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

// Contenedor del modo múltiple: Chips + botón. min-h en vez de h para que los Chips bajen de
// línea. El padding horizontal de Input se reparte entre el contenedor (izquierda, antes del
// primer Chip) y el botón, así el placeholder queda donde el texto de un Input del mismo size.
// El anillo de foco del botón se dibuja en el contenedor, que es lo que se ve como campo.
export const comboboxFieldVariants = cva(
  [
    'flex w-full flex-wrap items-center rounded-btn border border-base-300 bg-base-100',
    'has-[[data-combobox-trigger]:focus-visible]:ring-2 has-[[data-combobox-trigger]:focus-visible]:ring-primary has-[[data-combobox-trigger]:focus-visible]:ring-offset-2',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-8 gap-1 pl-1 text-xs',
        md: 'min-h-11 gap-1 py-1 pl-1.5 text-sm',
        lg: 'min-h-12 gap-1.5 py-1 pl-2 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export const comboboxMultipleTriggerVariants = cva(
  'flex flex-1 items-center justify-between gap-2 self-stretch text-left focus-visible:outline-none disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'pl-1 pr-2',
        md: 'pl-1.5 pr-3',
        lg: 'pl-2 pr-4',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export const comboboxSearchVariants = cva(
  'flex w-full bg-transparent outline-none placeholder:text-base-content/50 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 text-xs',
        md: 'h-11 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export const comboboxItemVariants = cva(
  [
    'flex cursor-default select-none items-center gap-2 rounded-sm px-2 outline-none',
    'data-[selected=true]:bg-base-200',
    'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'py-1.5 text-xs',
        md: 'py-2 text-sm',
        lg: 'py-3 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export type ComboboxSize = NonNullable<VariantProps<typeof comboboxTriggerVariants>['size']>;
