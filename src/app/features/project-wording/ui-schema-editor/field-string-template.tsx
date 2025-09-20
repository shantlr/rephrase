import { useStore } from '@tanstack/react-form';
import {
  PathToField,
  useFormSelectedLocale,
  useProjectWordingForm,
} from '../use-project-wording-form';
import { SchemaBaseField, usePathToTypeFromPathToField } from './_base-field';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { get } from 'lodash-es';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { StringTemplateWordingValueInput } from './wording-values/string-template';

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

  const value = useStore(form.store, (s) =>
    get(s.values, `${pathToType}.instances.${selectedLocale}`),
  );
  return (
    <BaseWordingValuesDialog
      trigger={value || ''}
      children={
        <BaseEditLocales
          form={form}
          children={(locale) => (
            <StringTemplateWordingValueInput
              form={form}
              pathToValue={`${pathToType}.instances.${locale}`}
            />
          )}
        />
      }
    />
  );
};

// export const useStringTemplateParamsFromLocaleData = ({
//   pathToType,
//   form,
// }: {
//   pathToType: PathToType;
//   form: ReturnType<typeof useProjectWordingForm>['form'];
// }) => {
//   const values = [];
//   // const values = useStore(form.store, (s) => {
//   //   const res = s.values.locales.flatMap((l) => l.data[fieldId]?.values);

//   //   return res;
//   // });

//   const params = useMemo(() => {
//     return sortBy(
//       uniq(
//         values
//           .flatMap((v) => {
//             // Extract params name from string template
//             // E.g: `hello {firstName} {lastName}`
//             return (
//               v?.match(/{(.*?)}/g)?.map((m) => m.replace(/[{}]/g, '').trim()) ||
//               []
//             );
//           })
//           .filter((v) => !!v),
//       ),
//     );
//   }, [values]);

//   return params;
// };

export const SchemaStringTemplateField = ({
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
