import { StringTemplateWordingValueInput } from './string-template';
import {
  PathToField,
  PathToType,
  useFieldType,
  useProjectWordingForm,
  useTypePath,
} from '../../use-project-wording-form';
import { Fragment, useCallback } from 'react';
import { useStore } from '@tanstack/react-form';
import { get, range } from 'lodash-es';
import { InlineAppend } from '../_inline-append';
import { useArrayItemPathToType } from '../field-array';
import { DeleteButton } from '../../ui-delete-button';
import { Card } from '@/app/common/ui/card';
import { SchemaObjectNode } from '@/server/data/wording.types';

export const WordingArrayInput = ({
  pathToType,
  pathToValue,
  form,
}: {
  pathToType: PathToType;
  pathToValue: string;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const { pathToItem } = useArrayItemPathToType({
    pathToType,
    form,
  });
  const itemType = useFieldType({
    pathToType: pathToItem,
    form,
  });

  const count = useStore(
    form.store,
    (s) => (get(s.values, pathToValue) as unknown[] | undefined)?.length ?? 0,
  );

  const onInsertValue = useCallback((index: number) => {
    const newValue =
      itemType === 'string-template' ? '' : itemType === 'array' ? [] : {};

    form.setFieldValue(
      pathToValue as `${PathToType}.${string}`,
      (prev: unknown) => {
        if (!!prev && !Array.isArray(prev)) {
          return prev;
        }

        const current = (prev ?? []) as unknown[];

        return [
          ...current.slice(0, index + 1),
          newValue,
          ...current.slice(index + 1),
        ];
      },
    );
  }, []);

  return (
    <Card className="gap-0 py-2 px-2 w-full">
      <InlineAppend
        onClick={() => {
          onInsertValue(-1);
        }}
      />
      {range(count).map((index) => (
        <Fragment key={index}>
          <div className="w-full group flex items-center">
            <WordingValueInput
              pathToType={pathToItem}
              form={form}
              pathToValue={`${pathToValue}[${index}]`}
            />
            <DeleteButton
              onDelete={() => {
                form.setFieldValue(
                  pathToValue as `${PathToType}.${string}`,
                  (prev: unknown) => {
                    if (!!prev && !Array.isArray(prev)) {
                      return prev;
                    }

                    const current = (prev ?? []) as unknown[];

                    return current.filter((_, i) => i !== index);
                  },
                );
              }}
              requireConfirmation
              itemName=""
              itemType="item"
            />
          </div>
          <InlineAppend
            onClick={() => {
              onInsertValue(index);
            }}
          />
        </Fragment>
      ))}
    </Card>
  );
};

const WordingObjectFieldInput = ({
  pathToField,
  form,
  pathToParentValue,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  pathToParentValue: string;
}) => {
  const name = useStore(
    form.store,
    (s) => (get(s.values, `${pathToField}.name`) as string) || '',
  );

  const fieldTypeId = useStore(
    form.store,
    (s) =>
      (get(s.values, pathToField) as SchemaObjectNode['fields'][number])
        .typeId as string,
  );
  const pathToFieldType = useTypePath(fieldTypeId);

  return (
    <div className="w-full flex gap-2">
      <div className="py-2">{name}</div>
      <WordingValueInput
        pathToType={pathToFieldType}
        form={form}
        pathToValue={`${pathToParentValue}.${name}`}
      />
    </div>
  );
};
const WordingObjectInput = ({
  pathToType,
  form,
  pathToValue,
}: {
  pathToType: PathToType;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  pathToValue: string;
}) => {
  const nbFields = useStore(
    form.store,
    (s) => (get(s.values, pathToType) as SchemaObjectNode)?.fields?.length || 0,
  );
  return (
    <Card className="w-full px-2 py-2 gap-0">
      {range(nbFields).map((index) => (
        <WordingObjectFieldInput
          key={index}
          pathToField={`${pathToType}.fields[${index}]`}
          form={form}
          pathToParentValue={pathToValue}
        />
      ))}
    </Card>
  );
};

export const WordingValueInput = ({
  pathToType,
  form,
  pathToValue,
}: {
  pathToType: PathToType;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  pathToValue: string;
}) => {
  const type = useFieldType({
    pathToType,
    form,
  });

  switch (type) {
    case 'string-template': {
      return (
        <StringTemplateWordingValueInput
          pathToValue={pathToValue}
          form={form}
        />
      );
    }
    case 'array': {
      return (
        <WordingArrayInput
          pathToType={pathToType}
          pathToValue={pathToValue}
          form={form}
        />
      );
    }
    case 'object': {
      return (
        <WordingObjectInput
          pathToType={pathToType}
          form={form}
          pathToValue={pathToValue}
        />
      );
    }
  }
  return null;
};
