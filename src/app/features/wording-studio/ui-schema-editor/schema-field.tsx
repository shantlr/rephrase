import { PathToField } from '../use-project-wording-form';
import { memo } from 'react';
import { SchemaStringTemplateField } from './field-string-template';
import { SchemaNumberField } from './field-number';
import { SchemaBooleanField } from './field-boolean';
import { SchemaArrayField } from './field-array';
import { SchemaObjectField } from './field-object';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { useReadStoreField } from '../store';

export const SchemaFormField = memo(
  ({
    pathToField,
    onDelete,
    wordingEditable,
  }: {
    pathToField: PathToField;
    onDelete?: (pathToField: PathToField) => void;
    wordingEditable: boolean;
  }) => {
    const store = useWordingStudioStore();

    const typeId = useReadStoreField(store, `${pathToField}.typeId`);
    const pathToType = `schema.nodes.${typeId}` as const;
    const fieldType = useReadStoreField(store, `${pathToType}.type`);

    switch (fieldType) {
      case 'string-template': {
        return (
          <SchemaStringTemplateField
            pathToField={pathToField}
            onDelete={onDelete}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'number': {
        return (
          <SchemaNumberField
            pathToField={pathToField}
            onDelete={onDelete}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'boolean': {
        return (
          <SchemaBooleanField
            pathToField={pathToField}
            onDelete={onDelete}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'array': {
        return (
          <SchemaArrayField
            pathToField={pathToField}
            onDelete={onDelete}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'object': {
        return (
          <SchemaObjectField
            pathToField={pathToField}
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
