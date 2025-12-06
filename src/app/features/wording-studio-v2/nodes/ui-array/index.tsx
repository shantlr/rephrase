import { useReadStoreField } from '@/app/features/wording-studio/store';
import { useStudioStore } from '../../store';
import { PathToArrayItemTypeId, PathToField, PathToType } from '../../types';
import { BaseField } from '../ui-base-field';
import { ListIcon } from 'lucide-react';

const StringTemplateValueEditor = ({
  itemType,
  pathToValue,
}: {
  itemType;
  pathToValue;
}) => {};

const Items = ({
  pathToValue,
  pathToItemType,
}: {
  pathToValue;
  pathToItemType;
}) => {
  const store = useStudioStore();
  const itemType = useReadStoreField(store, pathToItemType);
  const value = [];
  const length = value.length;

  return (
    <div>
      {Array.from({ length }).map((_, index) => {
        return null;

        return (
          <StringTemplateValueEditor
            itemType={itemType}
            pathToValue={`${pathToValue}.${index}`}
          />
        );
      })}
      {/* ADD ITEMS TO ARRAY */}
      <button
        onClick={() => {
          store.setField(pathToValue, (prev) => [...(prev ?? []), '']);
        }}
      >
        +
      </button>
    </div>
  );
};

export const SchemaArrayField = ({
  fieldPath,
  typePath,
}: {
  fieldPath: PathToField;
  typePath: PathToType;
}) => {
  const store = useStudioStore();
  const itemTypeId = useReadStoreField(
    store,
    `${typePath}.itemTypeId` satisfies PathToArrayItemTypeId,
  );
  const itemType = useReadStoreField(store, `schema.nodes.${itemTypeId}`);
  console.log(itemType);

  return (
    <BaseField
      icon={<ListIcon size={16} className="text-gray-500" />}
      fieldPath={fieldPath}
    >
      <div className="ml-4">
        <Items />
        {/* <SchemaFieldList schemaPath={`${typePath}.items`} /> */}
      </div>
    </BaseField>
  );
};
