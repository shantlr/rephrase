import { useMemo } from 'react';
import { PathToType } from '../use-project-wording-form';
import { SchemaArrayItem } from './field-array';
import { SchemaObjectFieldsList } from './field-object';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { useReadStoreField } from '../store';

export const SchemaType = ({
  pathToType,
  wordingEditable,
}: {
  pathToType: PathToType;
  wordingEditable: boolean;
}) => {
  const store = useWordingStudioStore();
  const fieldType = useReadStoreField(store, `${pathToType}.type`);

  const elem = useMemo(() => {
    switch (fieldType) {
      case 'array': {
        return (
          <SchemaArrayItem
            pathToType={pathToType}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'object': {
        return (
          <SchemaObjectFieldsList
            pathToFieldList={`${pathToType}.fields`}
            wordingEditable={wordingEditable}
          />
        );
      }
    }
    return null;
  }, [fieldType, pathToType]);

  if (!elem) {
    return null;
  }

  return (
    <div className="pl-[24px] border-l group-hover:border-primary">{elem}</div>
  );
};
