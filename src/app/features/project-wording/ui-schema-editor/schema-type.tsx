import { useMemo } from 'react';
import {
  PathToType,
  useFieldType,
  useProjectWordingForm,
} from '../use-project-wording-form';
import { SchemaArrayItem } from './field-array';
import { SchemaObjectFieldsList } from './field-object';

export const SchemaType = ({
  pathToType,
  form,
  wordingEditable,
}: {
  pathToType: PathToType;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  wordingEditable: boolean;
}) => {
  const fieldType = useFieldType({
    pathToType,
    form,
  });

  const elem = useMemo(() => {
    switch (fieldType) {
      case 'array': {
        return (
          <SchemaArrayItem
            pathToType={pathToType}
            form={form}
            wordingEditable={wordingEditable}
          />
        );
      }
      case 'object': {
        return (
          <SchemaObjectFieldsList
            pathToFieldList={`${pathToType}.fields`}
            form={form}
            wordingEditable={wordingEditable}
          />
        );
      }
    }
    return null;
  }, [fieldType, pathToType, form]);

  if (!elem) {
    return null;
  }

  return <div className="pl-[24px] border-l">{elem}</div>;
};
