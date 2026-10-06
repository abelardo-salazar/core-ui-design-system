import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { badgeVariants } from './badgeVariants';

type BadgeVariantProps = Omit<VariantProps<typeof badgeVariants>, 'interactive'>;

export interface InteractiveBadgeProps
  extends BadgeVariantProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renderiza un <button> real: foco, Enter/Space y disabled nativos, sin handlers propios. */
  interactive: true;
}

export interface StaticBadgeProps
  extends BadgeVariantProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  interactive?: false;
}

// Unión discriminada por `interactive`, no un solo tipo con todo opcional: así
// `<Badge onClick={fn}>` sin `interactive` es un error de compilación (antes compilaba y
// renderizaba un <div> con el click funcionando pero sin foco por teclado ni semántica de
// botón) en vez de perder el hover/foco en silencio. `onClick` se omite explícitamente del
// lado <div> en vez de dejarlo heredar de HTMLAttributes para que el error sea sobre esa
// prop puntual, no sobre toda la forma del objeto.
export type BadgeProps = InteractiveBadgeProps | StaticBadgeProps;

// La unión sola NO alcanza: en `StaticBadgeProps`, `interactive` es opcional
// (`interactive?: false`), así que al omitirlo TS no puede usarlo para discriminar y el
// chequeo de propiedades sobrantes de JSX cae a "¿existe esta prop en ALGÚN miembro de la
// unión?" — onClick/disabled/type existen en InteractiveBadgeProps, así que `<Badge onClick>`
// sin `interactive` compilaba igual (bug real de #34, reproducido contra main antes de este
// fix). Dos firmas sobrecargadas, una por rama, arreglan esto: TS chequea las props sobrantes
// contra la firma CONCRETA que intenta primero, no contra la unión — ninguna de las dos admite
// onClick/disabled/type sin `interactive: true` literal. (`disabled`/`type` ni siquiera son
// parte de HTMLAttributes<HTMLDivElement> — por eso esto también los cubre a ellos, no solo a
// onClick, sin necesitar ningún Omit/never adicional.)
function Badge(props: InteractiveBadgeProps): React.ReactElement;
function Badge(props: StaticBadgeProps): React.ReactElement;
function Badge(props: BadgeProps) {
  const { className, variant, size, interactive = false, ...rest } = props;

  if (interactive) {
    // El cast hace falta porque TS no sigue el discriminante `interactive` a través de un
    // rest-spread sobre una unión (el chequeo en runtime ya garantiza que `rest` es la rama
    // de botón acá; TS no puede inferirlo solo).
    const { type = 'button', ...buttonProps } = rest as Omit<
      InteractiveBadgeProps,
      'className' | 'variant' | 'size' | 'interactive'
    >;
    return (
      <button
        type={type}
        className={cn(badgeVariants({ variant, size, interactive: true }), className)}
        {...buttonProps}
      />
    );
  }

  return (
    <div
      className={cn(badgeVariants({ variant, size, interactive: false }), className)}
      {...(rest as Omit<StaticBadgeProps, 'className' | 'variant' | 'size' | 'interactive'>)}
    />
  );
}

export { Badge };
