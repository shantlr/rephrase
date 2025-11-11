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
    wordingEditable,
    depth,
  }: {
    pathToField: PathToField;
    wordingEditable: boolean;
    depth: number;
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
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'number': {
        return (
          <SchemaNumberField
            pathToField={pathToField}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'boolean': {
        return (
          <SchemaBooleanField
            pathToField={pathToField}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'array': {
        return (
          <SchemaArrayField
            pathToField={pathToField}
            wordingEditable={wordingEditable}
            depth={depth}
          />
        );
      }
      case 'object': {
        return (
          <SchemaObjectField
            pathToField={pathToField}
            wordingEditable={wordingEditable}
            depth={depth}
          />
        );
      }
    }

    return null;
  },
);
SchemaFormField.displayName = 'SchemaFormField';
