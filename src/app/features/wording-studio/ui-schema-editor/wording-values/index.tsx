import { StringTemplateWordingValueInput } from './string-template';
import { Input } from '@/app/common/ui/input';
import { Switch } from '@/app/common/ui/switch';
import {
  PathToArrayItemTypeId,
  PathToField,
  PathToType,
  PathToWordingInstanceValue,
  useObjectFieldNamePossibilities,
} from '../../use-project-wording-form';
import { Fragment, useCallback } from 'react';
import { range } from 'lodash-es';
import { InlineAppend } from '../_inline-append';
import { DeleteButton } from '../../_ui-delete-button';
import { Card } from '@/app/common/ui/card';
import { SchemaObjectNode } from '@/server/data/wording.types';
import { useFieldHasParams } from '../_base-field';
import { cn } from '@/app/common/lib/utils';
import { useWordingStudioStore } from '../../ui-wording-studio-context';
import { useReadStoreField, useSelectStoreField } from '../../store';

export const WordingArrayInput = ({
  pathToType,
  pathToValue,
}: {
  pathToType: PathToType;
  pathToValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const pathToItemTypeId: PathToArrayItemTypeId =
    `${pathToType}.itemTypeId` as const;
  const itemTypeId = useReadStoreField(store, pathToItemTypeId);
  const itemType = useReadStoreField(store, `schema.nodes.${itemTypeId}.type`);

  const count = useSelectStoreField(
    store,
    pathToValue,
    (v) => (v as unknown[] | undefined)?.length ?? 0,
  );

  const onInsertValue = useCallback((index: number) => {
    const newValue =
      itemType === 'string-template'
        ? ''
        : itemType === 'number'
          ? 0
          : itemType === 'boolean'
            ? false
            : itemType === 'array'
              ? []
              : {};

    store?.setField(pathToValue, (prev) => {
      if (!!prev && !Array.isArray(prev)) {
        return prev;
      }

      const current = (prev ?? []) as unknown[];

      return [
        ...current.slice(0, index + 1),
        newValue,
        ...current.slice(index + 1),
      ];
    });
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
              pathToType={`schema.nodes.${itemTypeId}`}
              pathToValue={`${pathToValue}.${index}`}
            />
            <DeleteButton
              onDelete={() => {
                store?.setField(pathToValue, (prev) => {
                  if (!!prev && !Array.isArray(prev)) {
                    return prev;
                  }

                  const current = (prev ?? []) as unknown[];

                  return current.filter((_, i) => i !== index);
                });
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

const WordingObjectTemplateFieldInput = ({
  pathToField,
  pathToParentValue,
}: {
  pathToField: PathToField;
  pathToParentValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const possibleFieldNames = useObjectFieldNamePossibilities({
    store,
    pathToField,
  });

  const fieldTypeId = useReadStoreField(store, `${pathToField}.typeId`);
  const pathToFieldType = `schema.nodes.${fieldTypeId}` as const;
  const fieldType = useReadStoreField(store, `${pathToFieldType}.type`);

  return (
    <>
      {possibleFieldNames.map((name) => (
        <div
          key={name}
          className={cn(
            'w-full',
            fieldType === 'string-template' && name.length < 80 && `flex gap-2`,
          )}
        >
          <div className="py-2">{name}</div>
          <div className={cn(fieldType !== 'string-template' && 'pl-4')}>
            <WordingValueInput
              pathToType={pathToFieldType}
              pathToValue={`${pathToParentValue}.${name}`}
            />
          </div>
        </div>
      ))}
    </>
  );
};
export const WordingObjectFieldInput = ({
  pathToField,
  pathToParentValue,
}: {
  pathToField: PathToField;
  pathToParentValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const name = useReadStoreField(store, `${pathToField}.name`);

  const isTemplateField = useFieldHasParams({
    store,
    pathToField,
  });

  const fieldTypeId = useReadStoreField(store, `${pathToField}.typeId`);

  const pathToFieldType = `schema.nodes.${fieldTypeId}` as const;

  if (isTemplateField) {
    return (
      <WordingObjectTemplateFieldInput
        pathToField={pathToField}
        pathToParentValue={pathToParentValue}
      />
    );
  }

  return (
    <div className="w-full flex gap-2">
      <div className="py-2">{name}</div>
      <WordingValueInput
        pathToType={pathToFieldType}
        pathToValue={`${pathToParentValue}.${name}`}
      />
    </div>
  );
};
const WordingObjectInput = ({
  pathToType,
  pathToValue,
}: {
  pathToType: PathToType;
  pathToValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const nbFields = useSelectStoreField(
    store,
    pathToType,
    (type) => (type as SchemaObjectNode | undefined)?.fields?.length ?? 0,
  );

  return (
    <Card className="w-full px-2 py-2 gap-0">
      {range(nbFields).map((index) => (
        <WordingObjectFieldInput
          key={index}
          pathToField={`${pathToType}.fields.${index}`}
          pathToParentValue={pathToValue}
        />
      ))}
    </Card>
  );
};

const NumberWordingValueInput = ({
  pathToValue,
}: {
  pathToValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const value = useReadStoreField(store, pathToValue) as number | undefined;

  return (
    <Input
      type="number"
      value={value?.toString() ?? ''}
      onChange={(e) => {
        const numValue =
          e.target.value === '' ? undefined : parseFloat(e.target.value);
        store?.setField(pathToValue, numValue);
      }}
      placeholder="Enter number"
      className="w-full"
    />
  );
};

const BooleanWordingValueInput = ({
  pathToValue,
}: {
  pathToValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const value = useReadStoreField(store, pathToValue) as boolean | undefined;

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={value ?? false}
        onCheckedChange={(checked) => {
          store?.setField(pathToValue, checked);
        }}
      />
      <span className="text-sm">{value ? 'True' : 'False'}</span>
    </div>
  );
};

export const WordingValueInput = ({
  pathToType,
  pathToValue,
}: {
  pathToType: PathToType;
  pathToValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const type = useReadStoreField(store, `${pathToType}.type`);

  switch (type) {
    case 'string-template': {
      return <StringTemplateWordingValueInput pathToValue={pathToValue} />;
    }
    case 'number': {
      return <NumberWordingValueInput pathToValue={pathToValue} />;
    }
    case 'boolean': {
      return <BooleanWordingValueInput pathToValue={pathToValue} />;
    }
    case 'array': {
      return (
        <WordingArrayInput pathToType={pathToType} pathToValue={pathToValue} />
      );
    }
    case 'object': {
      return (
        <WordingObjectInput pathToType={pathToType} pathToValue={pathToValue} />
      );
    }
  }
  return null;
};
