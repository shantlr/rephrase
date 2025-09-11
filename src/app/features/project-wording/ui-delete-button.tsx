import { Button } from '@/app/common/ui/button';
import { TrashIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/common/ui/alert-dialog';

export const DeleteButton = ({
  onDelete,
  requireConfirmation,
  itemName,
  itemType = 'item',
  className = 'h-5 w-5 p-0 opacity-0 group-hover:opacity-60 hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity focus:opacity-100',
  title = `Delete ${itemType}`,
  size = 'sm',
}: {
  onDelete: () => void;
  requireConfirmation: boolean;
  itemName?: string;
  itemType?: string;
  className?: string;
  title?: string;
  size?: 'sm' | 'default';
}) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-2.5 h-2.5';

  if (!requireConfirmation) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={className}
        onClick={onDelete}
        title={title}
      >
        <TrashIcon className={iconSize} />
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size={size} className={className} title={title}>
          <TrashIcon className={iconSize} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemType}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete
            {itemName ? ` the ${itemType} "${itemName}"` : ` this ${itemType}`}?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
