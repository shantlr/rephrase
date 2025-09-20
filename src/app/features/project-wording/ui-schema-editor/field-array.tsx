import { useStore } from '@tanstack/react-form';
import {
  PathToField,
  PathToType,
  useFieldType,
  useFormSelectedLocale,
  useProjectWordingForm,
  useTypePath,
} from '../use-project-wording-form';
import { SchemaBaseField, usePathToTypeFromPathToField } from './_base-field';
import { get } from 'lodash-es';
import { SchemaArrayNode } from '@/server/data/wording.types';
import { SelectFieldType } from './_select-field-type';
import { SchemaType } from './schema-type';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { Badge } from '@/app/common/ui/badge';
import { WordingArrayInput } from './wording-values';

export const useArrayItemPathToType = ({
  pathToType,
  form,
}: {
  pathToType: PathToType;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const itemTypeId = useStore(
    form.store,
    (s) => (get(s.values, `${pathToType}`) as SchemaArrayNode)?.itemTypeId,
  );
  const pathToItem = useTypePath(itemTypeId);
  return {
    itemTypeId,
    pathToItem,
  };
};

const Wording = ({
  pathToField,
  form,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const { pathToType } = usePathToTypeFromPathToField({
    pathToField,
    form,
  });
  const selectedLocale = useFormSelectedLocale(form);

  const { pathToItem } = useArrayItemPathToType({
    pathToType,
    form,
  });
  const itemType = useFieldType({
    pathToType: pathToItem,
    form,
  });

  const value = useStore(
    form.store,
    (s) =>
      get(s.values, `${pathToType}.instances.${selectedLocale}`) as
        | unknown[]
        | undefined,
  );

  const count = value?.length ?? 0;

  return (
    <BaseWordingValuesDialog
      trigger={
        itemType === 'string-template' ? (
          <>
            {value?.map((v) => (
              <Badge key={v as string} variant="secondary">
                {' '}
                {v as string}{' '}
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
          form={form}
          children={(locale) => (
            <WordingArrayInput
              pathToType={pathToType}
              pathToValue={`${pathToType}.instances.${locale}`}
              form={form}
            />
          )}
        />
      }
    />
  );
};

export const SchemaArrayField = ({
  pathToField,
  form,
  wordingEditable,
  onDelete,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  wordingEditable: boolean;
  onDelete?: (pathToField: PathToField) => void;
}) => {
  const { pathToType } = usePathToTypeFromPathToField({
    pathToField,
    form,
  });

  return (
    <SchemaBaseField
      pathToField={pathToField}
      form={form}
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
            {wordingEditable && (
              <Wording pathToField={pathToField} form={form} />
            )}
            {deleteButton}
          </div>

          {!!expanded && (
            <SchemaArrayItem
              form={form}
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
  form,
}: {
  pathToType: PathToType;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  wordingEditable: boolean;
}) => {
  const { pathToItem } = useArrayItemPathToType({
    pathToType,
    form,
  });

  return (
    <div className="w-full flex flex-col pl-[12px]">
      <div className="w-full border-l border-gray-300 pl-4 group-hover:border-primary">
        <div className="flex items-center gap-2 text-sm">
          Item type
          <SelectFieldType pathToType={pathToItem} form={form} />
        </div>
      </div>
      <SchemaType pathToType={pathToItem} form={form} wordingEditable={false} />
    </div>
  );
};
