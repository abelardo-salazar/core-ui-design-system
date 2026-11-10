'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;
type Offset = NonNullable<ToasterProps['offset']>;

// Sonner 2.0.8 ignores env(safe-area-inset-*): with viewport-fit=cover a top toast sits under the
// notch and a bottom one over the home indicator. Same values as sonner's VIEWPORT_OFFSET (24px)
// and MOBILE_VIEWPORT_OFFSET (16px, up to 600px wide) plus each side's inset, which is 0 without
// viewport-fit=cover. A consumer offset replaces the whole default of that prop: sonner fills the
// sides it omits with its plain 24px / 16px, without the inset.
const safeAreaOffset = (base: string): Offset => ({
  top: `calc(${base} + env(safe-area-inset-top))`,
  right: `calc(${base} + env(safe-area-inset-right))`,
  bottom: `calc(${base} + env(safe-area-inset-bottom))`,
  left: `calc(${base} + env(safe-area-inset-left))`,
});
const DEFAULT_OFFSET = safeAreaOffset('24px');
const DEFAULT_MOBILE_OFFSET = safeAreaOffset('16px');

const Toast = ({ offset, mobileOffset, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-base-100 group-[.toaster]:text-base-content group-[.toaster]:border-base-300 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-base-content/60',
          actionButton: 'group-[.toast]:bg-neutral group-[.toast]:text-neutral-content',
          cancelButton: 'group-[.toast]:bg-base-200 group-[.toast]:text-base-content/60',
        },
      }}
      offset={offset ?? DEFAULT_OFFSET}
      mobileOffset={mobileOffset ?? DEFAULT_MOBILE_OFFSET}
      {...props}
    />
  );
};

export { Toast };
