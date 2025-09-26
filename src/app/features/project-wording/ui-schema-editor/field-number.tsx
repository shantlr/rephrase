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
import { Input } from '@/app/common/ui/input';

const NumberWordingValueInput = ({
  pathToValue,
  form,
}: {
  pathToValue: string;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const value = useStore(
    form.store,
    (s) => get(s.values, pathToValue) as number | undefined,
  );

  return (
    <Input
      type="number"
      value={value?.toString() ?? ''}
      onChange={(e) => {
        const numValue =
          e.target.value === '' ? undefined : parseFloat(e.target.value);
        form.setFieldValue(pathToValue as `${PathToType}.${string}`, numValue);
      }}
      placeholder="Enter number"
    />
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
    const numValue = get(
      s.values,
      `${pathToType}.instances.${selectedLocale}`,
    ) as number | undefined;
    return numValue?.toString();
  });

  return (
    <BaseWordingValuesDialog
      trigger={value || <span className="text-gray-400">{'<empty>'}</span>}
      children={
        <BaseEditLocales
          form={form}
          children={(locale) => (
            <NumberWordingValueInput
              form={form}
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
