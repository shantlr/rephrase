import { PathToField, PathToType } from '../use-project-wording-form';
import { SchemaBaseField, useFieldHasParams } from './_base-field';
import { range } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { SchemaNode } from '@/server/data/wording.types';
import { InlineAppend } from './_inline-append';
import { SchemaFormField } from './schema-field';
import { FieldTemplateWordingDialog } from './field-template-wording-dialog';
import { LoaderCircle } from 'lucide-react';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { useReadStoreField, useSelectStoreField } from '../store';

export const SchemaObjectField = ({
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
      children={({
        expanded,
        expandButton,
        fieldName,
        selectType,
        deleteButton,
      }) => (
        <div>
          <div
            className="w-full flex gap-1  bg-white"
            // style={{
            //   position: 'sticky',
            //   top: depth * 16,
            // }}
          >
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
                depth={depth + 1}
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
  depth,
}: {
  pathToFieldList: `${PathToType}.fields` | `schema.root.fields`;
  wordingEditable: boolean;
  depth: number;
}) => {
  const store = useWordingStudioStore();

  const fieldCount = useSelectStoreField(
    store,
    pathToFieldList as `schema.root.fields`,
    (fields) => {
      return fields?.length;
    },
  );

  const visibleFieldPaths = useReadStoreField(store, 'visibleFieldPaths');

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

  return (
    <>
      <InlineAppend
        onClick={() => {
          onInsertField(-1);
        }}
      />
      {range(0, fieldCount).map((_, index) => {
        const fieldPath = `${pathToFieldList}.${index}` as PathToField;
        const isVisible = visibleFieldPaths.has(fieldPath);

        if (!isVisible) {
          return null;
        }

        return (
          <div key={index} className="w-full flex flex-col">
            {/* Render each item in the array */}
            <SchemaFormField
              key={index}
              pathToField={fieldPath}
              wordingEditable={wordingEditable}
              depth={depth + 1}
            />
            <InlineAppend
              onClick={() => {
                onInsertField(index);
              }}
            />
          </div>
        );
      })}
      <div className="mb-2" />
    </>
  );
};
