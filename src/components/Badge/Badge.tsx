import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { badgeVariants } from './badgeVariants';

type BadgeVariantProps = Omit<VariantProps<typeof badgeVariants>, 'interactive'>;

export interface InteractiveBadgeProps
  extends BadgeVariantProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders a real <button>: native focus, Enter/Space and disabled, with no handlers of its own. */
  interactive: true;
}

export interface StaticBadgeProps
  extends BadgeVariantProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  interactive?: false;
}

// Union discriminated by `interactive`, not a single type with everything optional: that way
// `<Badge onClick={fn}>` without `interactive` is a compile error (before, it compiled and
// rendered a <div> with a working click but without keyboard focus or button
// semantics) instead of silently losing the hover/focus. `onClick` is explicitly omitted on
// the <div> side instead of letting it inherit from HTMLAttributes so the error is about that
// specific prop, not about the whole shape of the object.
export type BadgeProps = InteractiveBadgeProps | StaticBadgeProps;

// The union alone is NOT enough: in `StaticBadgeProps`, `interactive` is optional
// (`interactive?: false`), so when it's omitted TS can't use it to discriminate and JSX's
// excess property check falls back to "does this prop exist in ANY member of the
// union?"; onClick/disabled/type exist in InteractiveBadgeProps, so `<Badge onClick>`
// without `interactive` compiled anyway (real bug of #34, reproduced against main before this
// fix). Two overloaded signatures, one per branch, fix this: TS checks excess props
// against the CONCRETE signature it tries first, not against the union; neither of them allows
// onClick/disabled/type without a literal `interactive: true`. (`disabled`/`type` aren't even
// part of HTMLAttributes<HTMLDivElement>, which is why this also covers them, not just
// onClick, without needing any extra Omit/never.)
function Badge(props: InteractiveBadgeProps): React.ReactElement;
function Badge(props: StaticBadgeProps): React.ReactElement;
function Badge(props: BadgeProps) {
  const { className, variant, size, interactive = false, ...rest } = props;

  if (interactive) {
    // The cast is needed because TS doesn't follow the `interactive` discriminant through a
    // rest-spread over a union (the runtime check already guarantees that `rest` is the button
    // branch here; TS can't infer it on its own).
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
