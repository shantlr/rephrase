import {
  useReadStoreField,
  useSelectStoreField,
} from '@/app/features/wording-studio/store';
import { useStudioStore } from '../../store';
import { PathToField, PathToFieldList } from '../../types';
import { SchemaStringField } from '../ui-string';
import { SchemaObjectField } from '../ui-object';
import { SchemaArrayField } from '../ui-array';
import {
  SchemaObjectNode,
  SchemaObjectNodeField,
} from '@/server/data/wording.types';
import { concatPath } from '../../utils/concat-path';
import { useFieldVisible } from '../../use-field-visible';

export const SchemaAnyField = ({
  fieldPath,
  valuePath,
}: {
  fieldPath: PathToField;
  valuePath: string;
}) => {
  const store = useStudioStore();
  const field = useReadStoreField(store, fieldPath) as
    | SchemaObjectNodeField
    | undefined;

  switch (field?.type?.type) {
    case 'string': {
      return (
        <SchemaStringField
          fieldPath={fieldPath}
          valuePath={concatPath(valuePath, field.name)}
        />
      );
    }
    case 'object': {
      return (
        <SchemaObjectField
          fieldPath={fieldPath}
          valuePath={concatPath(valuePath, field.name)}
        />
      );
    }
    case 'array': {
      return (
        <SchemaArrayField
          fieldPath={fieldPath}
          valuePath={concatPath(valuePath, field.name)}
        />
      );
    }
    default:
  }

  return null;
};

const FieldWrapper = ({
  fieldPath,
  valuePath,
}: {
  fieldPath: PathToField;
  valuePath: string;
}) => {
  const isVisible = useFieldVisible(fieldPath);
  if (!isVisible) return null;
  return <SchemaAnyField fieldPath={fieldPath} valuePath={valuePath} />;
};

export const SchemaFieldList = ({
  schemaPath,
  valuePath,
}: {
  schemaPath: PathToFieldList;
  valuePath: string;
}) => {
  const store = useStudioStore();

  const length = useSelectStoreField(
    store,
    schemaPath,
    (fields) => (fields as SchemaObjectNode['fields'])?.length ?? 0,
  );

  return (
    <>
      {Array.from({ length }).map((_, index) => {
        const fieldPath = `${schemaPath}.${index}` as PathToField;
        return (
          <div key={index}>
            <FieldWrapper fieldPath={fieldPath} valuePath={valuePath} />
          </div>
        );
      })}
    </>
  );
};
