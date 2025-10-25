import { Button } from '@/app/common/ui/button';
import { PlusIcon } from 'lucide-react';

export const InlineAppend = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="group/add-line h-1 bg-transparent hover:bg-gray-50 relative">
      <div className="px-4 absolute inset-0 flex items-center justify-start opacity-0 group-hover/add-line:opacity-100 transition-opacity">
        <Button
          onClick={onClick}
          variant="ghost"
          size="sm"
          className="w-full h-4 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <PlusIcon className="w-3 h-3 mr-1" />
        </Button>
      </div>
    </div>
  );
};
