import { useReadStoreField } from '@/app/features/wording-studio/store';
import { PathToField } from '../../types';
import { useStudioStore } from '../../store';
import { ReactNode } from 'react';

export const BaseField = ({
  icon,
  fieldPath,
  valuesPreview,
  children,
}: {
  /**
   * Icon to display right before the field name
   */
  icon?: ReactNode;
  fieldPath: PathToField;
  valuesPreview?: ReactNode;
  children?: ReactNode;
}) => {
  const store = useStudioStore();
  const name = useReadStoreField(store, `${fieldPath}.name`);
  return (
    <div>
      <div className="flex gap-2 items-center">
        {icon}
        <div className="text-gray-500 text-sm">{name}</div>
        {valuesPreview}
      </div>
      {children}
    </div>
  );
};
