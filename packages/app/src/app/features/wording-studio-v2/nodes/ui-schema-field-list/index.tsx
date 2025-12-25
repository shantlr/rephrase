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
        return (
          <div key={index}>
            <SchemaAnyField
              fieldPath={`${schemaPath}.${index}`}
              valuePath={valuePath}
            />
          </div>
        );
      })}
    </>
  );
};
