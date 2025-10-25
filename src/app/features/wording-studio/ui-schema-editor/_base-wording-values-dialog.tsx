import { ReactNode } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/common/ui/dialog';
import { Button } from '@/app/common/ui/button';

export const BaseWordingValuesDialog = ({
  trigger,
  children,
}: {
  trigger: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full overflow-hidden max-w-[50%] shrink h-[28px] px-2 border text-sm hover:border-gray-300 transition-all rounded cursor-pointer flex items-center justify-start">
          {trigger}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Values</DialogTitle>
          <DialogDescription>{children}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
