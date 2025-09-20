import { useField, useStore } from '@tanstack/react-form';
import {
  PathToField,
  useProjectWordingForm,
  useTypePath,
} from '../use-project-wording-form';
import { useFormError } from '@/app/common/hooks/use-form-error';
import { MinimalistInput } from './_minimalist-input';
import { memo, ReactNode, useState } from 'react';
import { get } from 'lodash-es';
import { SchemaObjectNode } from '@/server/data/wording.types';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/app/common/lib/utils';
import { DeleteButton } from '../ui-delete-button';
import { SelectFieldType } from './_select-field-type';

export const usePathToTypeFromPathToField = ({
  pathToField,
  form,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const typeId = useStore(
    form.store,
    (s) =>
      (get(s.values, pathToField) as SchemaObjectNode['fields'][number])
        ?.typeId,
  );

  return {
    typeId,
    pathToType: useTypePath(typeId),
  };
};

export const SchemaFieldName = ({
  pathToName,
  form,
}: {
  pathToName: `${PathToField}.name`;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const nameField = useField({
    form,
    name: pathToName,
  });

  const error = useFormError(nameField.state.meta.errors);

  return (
    <>
      <div className="w-full relative shrink">
        <MinimalistInput
          value={nameField.state.value as string}
          onChange={(e) => {
            nameField.setValue(e.target.value);
          }}
        />
        {error && (
          <div className="absolute top-[20px] left-2 opacity-50 bg-red-500 text-white px-2 rounded z-1 text-sm mt-1">
            {error}
          </div>
        )}
      </div>
    </>
  );
};

export const SchemaBaseField = memo(
  ({
    pathToField,
    expandable = false,
    form,
    onDelete,

    children = ({ expandButton, selectType, fieldName, deleteButton }) => (
      <div className="group flex gap-1 items-center">
        {expandButton}
        {selectType}
        {fieldName}
        {deleteButton}
      </div>
    ),
  }: {
    pathToField: PathToField;
    expandable?: boolean;
    form: ReturnType<typeof useProjectWordingForm>['form'];
    onDelete?: (pathToField: PathToField) => void;

    children?: (arg: {
      expandButton: ReactNode;
      expanded: boolean;
      selectType: ReactNode;
      fieldName: ReactNode;
      deleteButton: ReactNode;
    }) => ReactNode;
  }) => {
    const { pathToType } = usePathToTypeFromPathToField({
      pathToField,
      form,
    });

    const fieldName = useStore(form.store, (s) =>
      get(s.values, `${pathToField}.name`),
    );

    const [showDetails, setShowDetails] = useState(true);

    return children({
      expanded: showDetails,
      expandButton: expandable && (
        <button
          type="button"
          className={cn('cursor-pointer transition-all', {
            'rotate-180': showDetails,
          })}
          onClick={() => setShowDetails((v) => !v)}
        >
          <ChevronDownIcon />
        </button>
      ),
      selectType: <SelectFieldType pathToType={pathToType} form={form} />,
      fieldName: (
        <SchemaFieldName pathToName={`${pathToField}.name`} form={form} />
      ),
      deleteButton: !!onDelete && (
        <DeleteButton
          onDelete={() => onDelete(pathToField)}
          requireConfirmation={!!fieldName}
          itemName={fieldName}
          itemType="field"
        />
      ),
    });
  },
);
SchemaBaseField.displayName = 'SchemaBaseField';
