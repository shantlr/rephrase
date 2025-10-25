import { PathToField, PathToType } from '../use-project-wording-form';
import { SchemaBaseField, useFieldHasParams } from './_base-field';
import { SelectFieldType } from './_select-field-type';
import { SchemaType } from './schema-type';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { Badge } from '@/app/common/ui/badge';
import { WordingArrayInput } from './wording-values';
import { FieldTemplateWordingDialog } from './field-template-wording-dialog';
import { useReadStoreField } from '../store';
import { useWordingStudioStore } from '../ui-wording-studio-context';

const ArrayWording = ({ pathToField }: { pathToField: PathToField }) => {
  const store = useWordingStudioStore();
  const typeId = useReadStoreField(store, `${pathToField}.typeId`);
  const pathToType = `schema.nodes.${typeId}` as const;
  const selectedLocale = useReadStoreField(store, 'selectedLocale');
  const itemTypeId = useReadStoreField(
    store,
    `${pathToType}.itemTypeId` as const,
  );
  const itemType = useReadStoreField(store, `schema.nodes.${itemTypeId}.type`);

  const value = useReadStoreField(
    store,
    `${pathToType}.instances.${selectedLocale}`,
  ) as unknown[] | undefined;

  const count = value?.length ?? 0;

  return (
    <BaseWordingValuesDialog
      trigger={
        itemType === 'string-template' ? (
          <>
            {value?.map((v, index) => (
              <Badge key={index} variant="secondary">
                {v as string}
              </Badge>
            ))}
          </>
        ) : (
          <Badge variant="outline">
            {`<${count} ${count > 1 ? 'items' : 'item'}>`}
          </Badge>
        )
      }
      children={
        <BaseEditLocales
          children={(locale) => (
            <WordingArrayInput
              pathToType={pathToType}
              pathToValue={`${pathToType}.instances.${locale}`}
            />
          )}
        />
      }
    />
  );
};

export const SchemaArrayField = ({
  pathToField,
  wordingEditable,
  onDelete,
}: {
  pathToField: PathToField;
  wordingEditable: boolean;
  onDelete?: (pathToField: PathToField) => void;
}) => {
  const store = useWordingStudioStore();
  const typeId = useReadStoreField(store, `${pathToField}.typeId`);
  const pathToType = `schema.nodes.${typeId}` as const;

  const hasParams = useFieldHasParams({
    pathToField,
    store,
  });

  return (
    <SchemaBaseField
      pathToField={pathToField}
      expandable
      onDelete={onDelete}
      children={({
        expanded,
        expandButton,
        fieldName,
        selectType,
        deleteButton,
      }) => (
        <div className="group">
          <div className="group w-full flex gap-1">
            {expandButton}
            {selectType}
            {fieldName}
            {wordingEditable &&
              (hasParams ? (
                <FieldTemplateWordingDialog pathToField={pathToField} />
              ) : (
                <ArrayWording pathToField={pathToField} />
              ))}
            {deleteButton}
          </div>

          {!!expanded && (
            <SchemaArrayItem
              pathToType={pathToType}
              wordingEditable={wordingEditable}
            />
          )}
        </div>
      )}
    />
  );
};

export const SchemaArrayItem = ({
  pathToType,
}: {
  pathToType: PathToType;
  wordingEditable: boolean;
}) => {
  const store = useWordingStudioStore();
  const itemTypeId = useReadStoreField(store, `${pathToType}.itemTypeId`);
  const pathToItem = `schema.nodes.${itemTypeId}` as const;

  return (
    <div className="w-full flex flex-col pl-[12px]">
      <div className="w-full border-l border-gray-300 pl-4 group-hover:border-primary">
        <div className="flex items-center gap-2 text-sm">
          Item type
          <SelectFieldType pathToType={pathToItem} />
        </div>
      </div>
      <SchemaType pathToType={pathToItem} wordingEditable={false} />
    </div>
  );
};
