import * as React from 'react';
import { cn } from '../../utils/cn';
import { buttonVariants } from '../Button/buttonVariants';

export type SkipToContentProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const SkipToContent = React.forwardRef<HTMLAnchorElement, SkipToContentProps>(
  ({ className, href = '#main-content', ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          buttonVariants({ variant: 'primary' }),
          'absolute left-4 top-4 z-50 -translate-y-[150%] transition-transform focus:translate-y-0',
          className,
        )}
        {...props}
      >
        Skip to content
      </a>
    );
  },
);
SkipToContent.displayName = 'SkipToContent';

export { SkipToContent };
