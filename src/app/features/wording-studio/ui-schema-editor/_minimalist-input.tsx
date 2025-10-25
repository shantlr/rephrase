import { cn } from '@/app/common/lib/utils';
import { ComponentProps } from 'react';

export const MinimalistInput = (props: ComponentProps<'input'>) => {
  return (
    <input
      type="text"
      {...props}
      className={cn(
        'w-full font-medium text-sm px-0 py-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent min-w-0',
        props.className,
      )}
    />
  );
};
