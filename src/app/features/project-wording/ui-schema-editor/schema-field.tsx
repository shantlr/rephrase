import {
  useProjectWordingForm,
  PathToField,
  useFieldType,
} from '../use-project-wording-form';
import { memo } from 'react';
import { SchemaStringTemplateField } from './field-string-template';
import { SchemaNumberField } from './field-number';
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
      case 'number': {
        return (
          <SchemaNumberField
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
