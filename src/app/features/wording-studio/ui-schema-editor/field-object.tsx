import { PathToField, PathToType } from '../use-project-wording-form';
import { SchemaBaseField, useFieldHasParams } from './_base-field';
import { range } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { SchemaNode, SchemaObjectNode } from '@/server/data/wording.types';
import { InlineAppend } from './_inline-append';
import { SchemaFormField } from './schema-field';
import { FieldTemplateWordingDialog } from './field-template-wording-dialog';
import { LoaderCircle } from 'lucide-react';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { useReadStoreField, useSelectStoreField } from '../store';

export const SchemaObjectField = ({
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
  const pathToType: PathToType = `schema.nodes.${typeId}`;
  const [inited, setInited] = useState(false);

  useEffect(() => {
    requestIdleCallback(() => {
      setInited(true);
    });
  }, []);

  const hasParams = useFieldHasParams({
    store,
    pathToField,
  });

  return (
    <SchemaBaseField
      pathToField={pathToField}
      expandable
      onDelete={onDelete}
      children={({
        expanded,
        expandButton,
        fieldName,
        selectType,
        deleteButton,
      }) => (
        <div className="">
          <div className="w-full flex gap-1">
            {expandButton}
            {selectType}
            {fieldName}
            {wordingEditable && hasParams && (
              <FieldTemplateWordingDialog pathToField={pathToField} />
            )}
            {deleteButton}
          </div>

          {!inited && (
            <LoaderCircle
              className="text-gray-300 transition-all animate-spin"
              width={16}
            />
          )}
          {!!inited && !!expanded && (
            <div className="ml-[12px] pl-[24px] border-l ">
              <SchemaObjectFieldsList
                pathToFieldList={`${pathToType}.fields`}
                wordingEditable={wordingEditable && !hasParams}
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
  wordingEditable,
}: {
  pathToFieldList: `${PathToType}.fields` | `schema.root.fields`;
  wordingEditable: boolean;
}) => {
  const store = useWordingStudioStore();

  const fieldCount = useSelectStoreField(
    store,
    pathToFieldList as `schema.root.fields`,
    (fields) => {
      return fields?.length;
    },
  );

  const onInsertField = useCallback((index: number) => {
    const newField = {
      id: nanoid(),
      type: 'string-template',
    } satisfies SchemaNode;

    store?.setField(`schema.nodes.${newField.id}`, newField);
    store?.setField(pathToFieldList, (prev) => [
      ...(prev ?? []).slice(0, index + 1),
      {
        name: '',
        typeId: newField.id,
      },
      ...(prev ?? []).slice(index + 1),
    ]);
  }, []);

  const onDeleteField = useCallback((fieldPath: string) => {
    const m = fieldPath.match(/^.+(?<index>\d+)$/);
    if (m?.groups?.index) {
      const index = Number(m.groups.index);

      store?.setField(pathToFieldList, (prev) => {
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
          onInsertField(-1);
        }}
      />
      {range(0, fieldCount).map((_, index) => (
        <div key={index} className="w-full flex flex-col">
          {/* Render each item in the array */}
          <SchemaFormField
            key={index}
            pathToField={`${pathToFieldList}.${index}`}
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
