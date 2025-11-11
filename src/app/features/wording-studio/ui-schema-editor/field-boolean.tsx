import {
  PathToField,
  PathToWordingInstanceValue,
} from '../use-project-wording-form';
import { SchemaBaseField } from './_base-field';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { Switch } from '@/app/common/ui/switch';
import { useReadStoreField } from '../store';
import { useWordingStudioStore } from '../ui-wording-studio-context';

const BooleanWordingValueInput = ({
  pathToValue,
}: {
  pathToValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const value = useReadStoreField(store, pathToValue) as boolean | undefined;

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={value ?? false}
        onCheckedChange={(checked) => {
          store?.setField(pathToValue, checked);
        }}
      />
      <span className="text-sm">{value ? 'True' : 'False'}</span>
    </div>
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
  ) as boolean | undefined;

  return (
    <BaseWordingValuesDialog
      trigger={
        typeof value === 'boolean' ? (
          <span className="text-gray-400">{String(value)}</span>
        ) : (
          <span className="text-gray-400">{'<empty>'}</span>
        )
      }
      children={
        <BaseEditLocales
          children={(locale) => (
            <BooleanWordingValueInput
              pathToValue={`${pathToType}.instances.${locale}`}
            />
          )}
        />
      }
    />
  );
};

export const SchemaBooleanField = ({
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
