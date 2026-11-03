import * as React from 'react';
import {
  InfoCircledIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { alertVariants, alertIconVariants } from './alertVariants';

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>;

// error/warning mean "something went wrong" → assertive (interrupts the screen reader).
// info/success mean "this is the state" → polite (waits for whatever is being read to
// finish). This is the default when `live` isn't passed; `live` overrides it (ROLE_BY_LIVE).
const ROLE_BY_VARIANT: Record<AlertVariant, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
};

// off has no role: role="region" would add one landmark per notice, and a persistent notice
// shouldn't overload the page's landmark navigation.
const ROLE_BY_LIVE = {
  assertive: 'alert',
  polite: 'status',
  off: undefined,
} as const;

const DEFAULT_ICON_BY_VARIANT: Record<
  AlertVariant,
  React.ComponentType<React.ComponentProps<typeof InfoCircledIcon>>
> = {
  info: InfoCircledIcon,
  success: CheckCircledIcon,
  warning: ExclamationTriangleIcon,
  error: CrossCircledIcon,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /**
   * Replaces the variant's default icon (compositional pattern, same as `fallback` in
   * Image). If it isn't passed (`undefined`), the `variant` default icon is used. If any
   * value is passed -- including `null` or `false` -- it's used as is, which lets you hide
   * the icon explicitly without a separate prop.
   */
  icon?: React.ReactNode;
  /**
   * Overrides how the alert is announced: `assertive` -> `role="alert"`, `polite` ->
   * `role="status"`, `off` -> no role. Use `assertive` for the result of an action just taken and
   * `off` for persistent notices. If it isn't passed, the role comes from `variant`.
   */
  live?: keyof typeof ROLE_BY_LIVE;
}

// -----------------------------------------------------------------------------
// Alert Root
// -----------------------------------------------------------------------------
/**
 * Inline message. By default, `error`/`warning` use `role="alert"` and `info`/`success`,
 * `role="status"`; `live` overrides it.
 *
 * Limitation: a `role="status"` that mounts dynamically isn't announced, because readers only
 * read the changes of a `status` region that was already in the DOM. To announce it, use
 * `live="assertive"`, `announce()` or keep the `Alert` mounted and change its content.
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, live, children, ...props }, ref) => {
    const resolvedVariant = variant ?? 'info';
    const role = live ? ROLE_BY_LIVE[live] : ROLE_BY_VARIANT[resolvedVariant];
    const DefaultIcon = DEFAULT_ICON_BY_VARIANT[resolvedVariant];

    const resolvedIcon =
      icon !== undefined ? (
        icon
      ) : (
        <DefaultIcon className={cn(alertIconVariants({ variant }))} aria-hidden />
      );

    return (
      <div ref={ref} role={role} className={cn(alertVariants({ variant }), className)} {...props}>
        {resolvedIcon}
        <div className="flex-1 space-y-1">{children}</div>
      </div>
    );
  },
);
Alert.displayName = 'Alert';

// -----------------------------------------------------------------------------
// Alert Title
// -----------------------------------------------------------------------------
// Deliberately a <div>, not an <h*>: unlike CardTitle, an Alert can show up
// anywhere in the tree (injected by a form, a toast, etc.) without the
// component being able to know which heading level belongs there. Forcing a fixed level
// could break the heading order of the consuming page.
const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('font-medium leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = 'AlertTitle';

// -----------------------------------------------------------------------------
// Alert Description
// -----------------------------------------------------------------------------
const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn('text-sm text-base-content [&_p]:leading-relaxed', className)}
      ref={ref}
      {...props}
    />
  ),
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
