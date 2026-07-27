'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toast = ({ ...props }: ToasterProps) => {
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
      {...props}
    />
  );
};

export { Toast };
