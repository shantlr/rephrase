import {
  useReadStoreField,
  useSelectStoreField,
} from '@/app/features/wording-studio/store';
import { useStudioStore } from '../../store';
import { PathToField, PathToFieldList } from '../../types';
import { SchemaStringTemplateField } from '../ui-string-template';
import { SchemaObjectField } from '../ui-object';
import { SchemaArrayField } from '../ui-array';

export const SchemaAnyField = ({ fieldPath }: { fieldPath: PathToField }) => {
  const store = useStudioStore();
  const field = useReadStoreField(store, fieldPath);

  const typePath = `schema.nodes.${field?.typeId ?? ''}` as const;
  const type = useReadStoreField(store, typePath);

  switch (type?.type) {
    case 'string-template': {
      return (
        <SchemaStringTemplateField fieldPath={fieldPath} typePath={typePath} />
      );
    }
    case 'object': {
      return <SchemaObjectField fieldPath={fieldPath} typePath={typePath} />;
    }
    case 'array': {
      return <SchemaArrayField fieldPath={fieldPath} typePath={typePath} />;
    }
    default:
  }

  return null;
};

export const SchemaFieldList = ({
  schemaPath,
}: {
  schemaPath: PathToFieldList;
}) => {
  const store = useStudioStore();

  const length = useSelectStoreField(
    store,
    schemaPath,
    (fields) => fields?.length ?? 0,
  );

  return (
    <>
      {Array.from({ length }).map((_, index) => {
        return (
          <div key={index}>
            <SchemaAnyField fieldPath={`${schemaPath}.${index}`} />
          </div>
        );
      })}
    </>
  );
};
