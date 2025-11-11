import {
  PathToField,
  PathToWordingInstanceValue,
} from '../use-project-wording-form';
import { SchemaBaseField } from './_base-field';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { Input } from '@/app/common/ui/input';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { useReadStoreField } from '../store';

const NumberWordingValueInput = ({
  pathToValue,
}: {
  pathToValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const value = useReadStoreField(store, pathToValue) as number | undefined;

  return (
    <Input
      type="number"
      value={value?.toString() ?? ''}
      onChange={(e) => {
        const numValue =
          e.target.value === '' ? undefined : parseFloat(e.target.value);
        store?.setField(pathToValue, numValue);
      }}
      placeholder="Enter number"
    />
  );
};

const Wording = ({ pathToField }: { pathToField: PathToField }) => {
  const store = useWordingStudioStore();
  const typeId = useReadStoreField(store, `${pathToField}.typeId`);
  const pathToType = `schema.nodes.${typeId}` as const;

  const selectedLocale = useReadStoreField(store, 'selectedLocale');

  const value = useReadStoreField(
    store,
    `${pathToType}.instances.${selectedLocale}`,
  ) as number | undefined;

  return (
    <BaseWordingValuesDialog
      trigger={
        (value as number | undefined) || (
          <span className="text-gray-400">{'<empty>'}</span>
        )
      }
      children={
        <BaseEditLocales
          children={(locale) => (
            <NumberWordingValueInput
              pathToValue={`${pathToType}.instances.${locale}`}
            />
          )}
        />
      }
    />
  );
};

export const SchemaNumberField = ({
  pathToField,
  wordingEditable,
}: {
  pathToField: PathToField;
  wordingEditable: boolean;
}) => {
  return (
    <SchemaBaseField
      pathToField={pathToField}
      expandable={false}
      children={({ fieldName, selectType, deleteButton }) => (
        <div className="w-full flex gap-1 group">
          {selectType}
          {fieldName}
          {!!wordingEditable && <Wording pathToField={pathToField} />}
          {deleteButton}
        </div>
      )}
    />
  );
};
