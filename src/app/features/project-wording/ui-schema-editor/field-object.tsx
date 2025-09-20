import { useStore } from '@tanstack/react-form';
import {
  PathToField,
  PathToType,
  useProjectWordingForm,
} from '../use-project-wording-form';
import { SchemaBaseField, usePathToTypeFromPathToField } from './_base-field';
import { get, range } from 'lodash-es';
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { SchemaNode, SchemaObjectNode } from '@/server/data/wording.types';
import { InlineAppend } from './_inline-append';
import { SchemaFormField } from './schema-field';

export const SchemaObjectField = ({
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
  return (
    <SchemaBaseField
      pathToField={pathToField}
      form={form}
      expandable
      onDelete={onDelete}
      children={({
        expanded,
        expandButton,
        fieldName,
        selectType,
        deleteButton,
      }) => (
        <div className="group">
          <div className="group w-full flex gap-1">
            {expandButton}
            {selectType}
            {fieldName}
            {/* <Wording pathToField={pathToField} form={form} /> */}
            {deleteButton}
          </div>

          {!!expanded && (
            <div className="ml-[12px] pl-[24px] border-l group-hover:border-primary">
              <SchemaObjectFieldsList
                pathToFieldList={`${pathToType}.fields`}
                form={form}
                wordingEditable={wordingEditable}
              />
            </div>
          )}
        </div>
      )}
    />
  );
};

export const SchemaObjectFieldsList = ({
  pathToFieldList,
  form,
  wordingEditable,
}: {
  pathToFieldList: `${PathToType}.fields` | `schema.root.fields`;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  wordingEditable: boolean;
}) => {
  const fieldCount = useStore(form.store, (s) => {
    const array = get(s.values, pathToFieldList);
    if (Array.isArray(array)) {
      return array.length;
    }
    return 0;
  });

  const onInsertField = useCallback((index: number) => {
    const newField = {
      id: nanoid(),
      type: 'string-template',
    } satisfies SchemaNode;

    form.setFieldValue(`schema.nodes.${newField.id}`, newField);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setFieldValue(pathToFieldList, (prev: any) => {
      if (!Array.isArray(prev)) {
        return prev;
      }
      const current = prev as SchemaObjectNode['fields'];
      return [
        ...current.slice(0, index + 1),
        {
          name: '',
          typeId: newField.id,
        },
        ...current.slice(index + 1),
      ] satisfies SchemaObjectNode['fields'];
    });
  }, []);

  const onDeleteField = useCallback((fieldPath: string) => {
    const m = fieldPath.match(/^.+\[(?<index>\d+)\]$/);
    if (m?.groups?.index) {
      const index = Number(m.groups.index);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setFieldValue(pathToFieldList, (prev: any) => {
        if (!Array.isArray(prev)) {
          return prev;
        }
        const current = prev as SchemaObjectNode['fields'];
        return current.filter((_, i) => i !== index);
      });
    }
  }, []);

  return (
    <>
      <InlineAppend
        onClick={() => {
          onInsertField(0);
        }}
      />
      {range(0, fieldCount).map((_, index) => (
        <div key={index} className="w-full flex flex-col">
          {/* Render each item in the array */}
          <SchemaFormField
            key={index}
            pathToField={`${pathToFieldList}[${index}]`}
            form={form}
            onDelete={onDeleteField}
            wordingEditable={wordingEditable}
          />
          <InlineAppend
            onClick={() => {
              onInsertField(index);
            }}
          />
        </div>
      ))}
      <div className="mb-2" />
    </>
  );
};
