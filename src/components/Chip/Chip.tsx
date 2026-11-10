'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { Cross2Icon } from '@radix-ui/react-icons';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { chipVariants } from './chipVariants';

type ChipSize = NonNullable<VariantProps<typeof chipVariants>['size']>;

export interface ChipProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'onSelect'>,
    VariantProps<typeof chipVariants> {
  /** Controlled toggle. Together with onPressedChange, turns on the interactive mode of the body (a real Radix Toggle). */
  pressed?: boolean;
  /** Toggle no controlado. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** If passed, adds a close button (X) independent of the chip body. */
  onRemove?: () => void;
  /** Accessible label of the close button. */
  removeLabel?: string;
  disabled?: boolean;
}

// Horizontal padding of the body (static span or Toggle). "right" only applies when there is NO
// close button: if there is one, the gap-1 of the root still provides the space between the text
// and the button, unchanged; if the body also had its own pr, that space would double.
// Chip's own scale (not Button's), proportional to the font-size of each size.
const BODY_PADDING: Record<ChipSize, { left: string; right: string; vertical?: string }> = {
  sm: { left: 'pl-2.5', right: 'pr-2.5', vertical: 'py-0.5' },
  md: { left: 'pl-3', right: 'pr-3' },
  lg: { left: 'pl-4', right: 'pr-4' },
};

// sm: unchanged from the current close button (p-1.5 already gives Material's 24x24 spec for
// a Chip's delete icon). md/lg: explicit width only; the height is NOT set (unlike earlier
// versions of this file): an explicit height (h-8/h-11) doesn't respond to items-stretch, so
// the button wasn't centered with the Toggle and overflowed the root's bottom border by ~1px.
// Without its own height it stretches just like the Toggle/body and stays centered: the same
// mechanism already proven, not a new one.
const CLOSE_BUTTON_SIZE: Record<ChipSize, string> = {
  sm: 'p-1.5',
  md: 'w-8',
  lg: 'w-11',
};

// Extends the close button's hit area to the OUTER edge of the root (never beyond its own
// visual box, so the focus ring doesn't change), following the pill's curve: rounded-r-full
// rounds only the two right corners with the same radius as the root (instead of a rectangle
// whose corners fall outside the visible silhouette; before this fix, a tap there did trigger
// onRemove). No extension to the left: the gap-1 next to the body still doesn't respond, on
// purpose.
// sm rebuilds the historical padding that the root re-introduces (rootDeadZoneRestore); that
// case deliberately does NOT reach the border itself (see the comment there: "the 1px border
// is unavoidable and fine" was the rule agreed for sm). md/lg do reach the border: they are new
// sizes, with no historical commitment, and the task explicitly asks for the 1px border to
// respond there.
const CLOSE_BUTTON_HIT_AREA: Record<ChipSize, string> = {
  sm: "relative after:content-[''] after:absolute after:rounded-r-full after:-top-0.5 after:-right-2.5 after:-bottom-0.5 after:left-0",
  md: "relative after:content-[''] after:absolute after:rounded-r-full after:-top-px after:-right-px after:-bottom-px after:left-0",
  lg: "relative after:content-[''] after:absolute after:rounded-r-full after:-top-px after:-right-px after:-bottom-px after:left-0",
};

// The icon grows with the button (there is no explicit spec for this; it's our own decision,
// proportional to the text size of each step).
const CLOSE_ICON_SIZE: Record<ChipSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      className,
      variant,
      size: sizeProp,
      pressed,
      defaultPressed,
      onPressedChange,
      onRemove,
      removeLabel = 'Remove',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // VariantProps allows `null` (cva semantics for "no variant") besides `undefined`; a
    // default in the destructuring doesn't cover `null`, so it's resolved here.
    const size = sizeProp ?? 'sm';

    // The body only becomes interactive (a real Toggle) if the consumer takes part in the
    // pressed/defaultPressed/onPressedChange protocol. Without it, it's plain text.
    const isToggle =
      pressed !== undefined || defaultPressed !== undefined || onPressedChange !== undefined;

    const { left, right, vertical } = BODY_PADDING[size];
    // The padding lives here (not on the root) so the real hit box of the Toggle/span fills the
    // pill: before, the root (not interactive) had the padding and the Toggle inside measured
    // 0, so tapping the "air" around the text did nothing.
    const bodyPadding = cn(left, !onRemove && right, vertical);

    // sm with a close button is the only case where the root DOES need its own padding: it's the
    // only way to rebuild the historical height/width (30px / border+10+text+gap-1+24+10+border)
    // without inflating the body again (which already has its own padding, correctly, for the case
    // without a button). pr-2.5 re-introduces the 10px to the right of the button; py-0.5
    // re-introduces the 2px above/below; both were "dead" space in PR #30 (the root stopped having
    // it, and nobody inherited it). The 1px border itself is deliberately left out of the hit area
    // in sm (it's unavoidable and fine, agreed when restoring this look); see CLOSE_BUTTON_HIT_AREA.
    const rootDeadZoneRestore = size === 'sm' && onRemove && 'py-0.5 pr-2.5';

    // Extends the Toggle's hit area to the OUTER edge of the root, only vertically (inset-x-0:
    // it never invades the gap-1 or the close button area) and with a radius: same criterion as
    // CLOSE_BUTTON_HIT_AREA but on the LEFT edge of the pill, where the Toggle lives (without the
    // radius, the rectangle's corners would fall outside the visible silhouette, the same problem
    // the close button had without rounded-r-full).
    // sm with a close button: covers the strip that rootDeadZoneRestore enlarges (py-0.5) and that
    // the Toggle, stretching only to the row height (24px), didn't reach on its own; without a
    // close button, the Toggle already reaches exactly the inner edge (nothing to fix), and the
    // border itself is left out on purpose, same as the sm ✕.
    // md/lg: covers the border itself (1px); with or without a close button next to it, the
    // Toggle is a real control that must reach the full touch size on its own. WITH a close
    // button, the right end of the Toggle borders the gap-1 (inside the pill): there
    // rounded-l-full is correct, only the left corner is outer. WITHOUT a close button, the right
    // end of the Toggle IS the right end of the pill: both corners are outer, so it needs a full
    // rounded-full (otherwise those corners stay square and respond in the gap between the curve
    // and the corner, outside the visible silhouette).
    const toggleHitArea =
      size === 'sm'
        ? onRemove &&
          "relative after:content-[''] after:absolute after:rounded-l-full after:inset-x-0 after:-top-0.5 after:-bottom-0.5"
        : onRemove
          ? "relative after:content-[''] after:absolute after:rounded-l-full after:inset-x-0 after:-top-px after:-bottom-px"
          : "relative after:content-[''] after:absolute after:rounded-full after:inset-x-0 after:-top-px after:-bottom-px";

    const body = isToggle ? (
      <TogglePrimitive.Root
        pressed={pressed}
        defaultPressed={defaultPressed}
        onPressedChange={onPressedChange}
        disabled={disabled}
        className={cn(
          'inline-flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !disabled && 'cursor-pointer',
          bodyPadding,
          toggleHitArea,
        )}
      >
        {children}
      </TogglePrimitive.Root>
    ) : (
      <span className={cn('inline-flex items-center', bodyPadding)}>{children}</span>
    );

    return (
      // The root container is NEVER interactive by itself: if it were a <button> or the Toggle
      // itself, and also had the close button inside, it would result in <button><button/></button>,
      // invalid HTML. That's why it composes two independent interactive elements as siblings.
      <span
        ref={ref}
        className={cn(chipVariants({ variant, size }), rootDeadZoneRestore, className)}
        {...props}
      >
        {body}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100 enabled:active:opacity-100 [-webkit-tap-highlight-color:transparent]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              CLOSE_BUTTON_SIZE[size],
              CLOSE_BUTTON_HIT_AREA[size],
            )}
          >
            <Cross2Icon className={CLOSE_ICON_SIZE[size]} />
            <span className="sr-only">{removeLabel}</span>
          </button>
        )}
      </span>
    );
  },
);
Chip.displayName = 'Chip';

export { Chip };
