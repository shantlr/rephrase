import {
  useProjectWordingForm,
  PathToField,
  useFieldType,
} from '../use-project-wording-form';
import { memo } from 'react';
import { SchemaStringTemplateField } from './field-string-template';
import { SchemaArrayField } from './field-array';
import { SchemaObjectField } from './field-object';
import { usePathToTypeFromPathToField } from './_base-field';

export const SchemaFormField = memo(
  ({
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
    const { pathToType } = usePathToTypeFromPathToField({
      pathToField,
      form,
    });
    const type = useFieldType({
      pathToType,
      form,
    });

    switch (type) {
      case 'string-template': {
        return (
          <SchemaStringTemplateField
            pathToField={pathToField}
            form={form}
            onDelete={onDelete}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'array': {
        return (
          <SchemaArrayField
            pathToField={pathToField}
            form={form}
            onDelete={onDelete}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'object': {
        return (
          <SchemaObjectField
            pathToField={pathToField}
            form={form}
            onDelete={onDelete}
            wordingEditable={wordingEditable}
          />
        );
      }
    }

    return null;
  },
);
SchemaFormField.displayName = 'SchemaFormField';

// const StringTemplateDetails = ({
//   pathToType,
//   form,
// }: {
//   pathToType: PathToType;
//   form: ReturnType<typeof useProjectWordingForm>['form'];
// }) => {
//   // const inferredParams = useStringTemplateParamsFromLocaleData({
//   //   pathToType,
//   //   form,
//   // });

//   // const paramsPath = `${name}.params`;
//   // const currentParams = useStore(
//   //   form.store,
//   //   (s) => get(s.values, paramsPath) as WordingStringTemplateSchema['params'],
//   // );

//   // useEffect(() => {
//   //   if (!inferredParams.length && !!currentParams) {
//   //     form.setFieldValue(paramsPath, undefined);
//   //     return;
//   //   }

//   //   const current = currentParams?.map((p) => p.name) ?? [];
//   //   if (!isEqual(current, inferredParams)) {
//   //     form.setFieldValue(
//   //       paramsPath,
//   //       inferredParams.map((p) => {
//   //         return {
//   //           name: p,
//   //           description: '',
//   //           type: {
//   //             type: 'string',
//   //           },
//   //         };
//   //       }) satisfies WordingStringTemplateSchema['params'],
//   //     );
//   //   }
//   // });

//   // if (!currentParams) {
//   //   return null;
//   // }

//   // return (
//   //   <div className="w-full pl-5 flex flex-col">
//   //     {currentParams.map((param, index) => (
//   //       <div key={index} className="border-l border-gray-300 pl-4 text-xs">
//   //         {param.name}
//   //       </div>
//   //     ))}
//   //   </div>
//   // );

//   return null;
// };
