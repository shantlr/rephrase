import { useStore } from '@tanstack/react-form';
import {
  PathToField,
  PathToType,
  useFormSelectedLocale,
  useProjectWordingForm,
} from '../use-project-wording-form';
import { SchemaBaseField, usePathToTypeFromPathToField } from './_base-field';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { get } from 'lodash-es';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { Switch } from '@/app/common/ui/switch';

const BooleanWordingValueInput = ({
  pathToValue,
  form,
}: {
  pathToValue: string;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const value = useStore(
    form.store,
    (s) => get(s.values, pathToValue) as boolean | undefined,
  );

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={value ?? false}
        onCheckedChange={(checked) => {
          form.setFieldValue(pathToValue as `${PathToType}.${string}`, checked);
        }}
      />
      <span className="text-sm">{value ? 'True' : 'False'}</span>
    </div>
  );
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

  const value = useStore(form.store, (s) => {
    const boolValue = get(
      s.values,
      `${pathToType}.instances.${selectedLocale}`,
    ) as boolean | undefined;
    return boolValue !== undefined ? (boolValue ? 'true' : 'false') : undefined;
  });

  return (
    <BaseWordingValuesDialog
      trigger={value || <span className="text-gray-400">{'<empty>'}</span>}
      children={
        <BaseEditLocales
          form={form}
          children={(locale) => (
            <BooleanWordingValueInput
              form={form}
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
  form,
  onDelete,
  wordingEditable,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  onDelete?: (pathToField: PathToField) => void;
  wordingEditable: boolean;
}) => {
  return (
    <SchemaBaseField
      pathToField={pathToField}
      form={form}
      expandable={false}
      onDelete={onDelete}
      children={({ fieldName, selectType, deleteButton }) => (
        <div className="w-full flex gap-1 group">
          {selectType}
          {fieldName}
          {!!wordingEditable && (
            <Wording pathToField={pathToField} form={form} />
          )}
          {deleteButton}
        </div>
      )}
    />
  );
};
