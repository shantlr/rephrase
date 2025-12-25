import { cn } from '@/app/common/lib/utils';
import { ComponentProps, forwardRef } from 'react';

interface MinimalistInputProps extends ComponentProps<'input'> {
  active?: boolean;
}

export const MinimalistInput = forwardRef<
  HTMLInputElement,
  MinimalistInputProps
>(({ active, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="text"
      {...props}
      className={cn(
        'w-full font-medium text-sm px-0 py-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent min-w-0',
        active && 'border-blue-500',
        props.className,
      )}
    />
  );
});

MinimalistInput.displayName = 'MinimalistInput';
