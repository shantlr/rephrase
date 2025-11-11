import { PathToField, PathToType } from '../use-project-wording-form';
import { SchemaBaseField, useFieldHasParams } from './_base-field';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { flatMap, isEqual, map, sortBy, uniq } from 'lodash-es';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { StringTemplateWordingValueInput } from './wording-values/string-template';
import { PluralizationWordingValueInput } from './wording-values/pluralization';
import { SchemaStringTemplateNode } from '@/server/data/wording.types';
import { useEffect } from 'react';
import { Badge } from '@/app/common/ui/badge';
import { Switch } from '@/app/common/ui/switch';
import { extractParams } from './_util-extract-params';
import { FieldTemplateWordingDialog } from './field-template-wording-dialog';
import { useReadStoreField, useSelectStoreField } from '../store';
import {
  useWordingStudioStore,
  WordingStudioStore,
} from '../ui-wording-studio-context';

const Wording = ({ pathToField }: { pathToField: PathToField }) => {
  const store = useWordingStudioStore();
  const typeId = useReadStoreField(store, `${pathToField}.typeId`);
  const pathToType = `schema.nodes.${typeId}` as const;
  const selectedLocale = useReadStoreField(store, 'selectedLocale');

  const currentNode = useReadStoreField(store, pathToType) as
    | SchemaStringTemplateNode
    | undefined;

  const isPluralized = currentNode?.variant === 'pluralized';

  const value = useSelectStoreField(
    store,
    `${pathToType}.instances.${selectedLocale}`,
    (v) => {
      if (isPluralized && v) {
        const { one, other } = (v ?? {}) as { one: string; other: string };
        const singularValue = one || '<no-singular>';
        const pluralValue = other || '<no-plural>';
        return `${singularValue} / ${pluralValue}`;
      }
      return v;
    },
  );

  const handleVariantToggle = (checked: boolean) => {
    const currentInstances = currentNode?.instances || {};
    const currentParams = currentNode?.params || {};

    if (checked) {
      const convertedInstances: Record<string, { one: string; other: string }> =
        {};
      Object.entries(currentInstances).forEach(([locale, value]) => {
        convertedInstances[locale] = {
          one: typeof value === 'string' ? value : '',
          other: '',
        };
      });

      const updatedParams = {
        ...currentParams,
        count: { type: 'number' as const },
      };

      store?.setField(`${pathToType}.variant`, 'pluralized');
      store?.setField(`${pathToType}.params`, updatedParams);
      if (Object.keys(convertedInstances).length) {
        store?.setField(`${pathToType}.instances`, convertedInstances);
      }
    } else {
      const convertedInstances: Record<string, string> = {};
      Object.entries(currentInstances).forEach(([locale, value]) => {
        convertedInstances[locale] =
          typeof value === 'object' && value?.one ? value.one : '';
      });

      const updatedParams = { ...currentParams };
      if (updatedParams.count?.type === 'number') {
        delete updatedParams.count;
      }

      store?.setField(`${pathToType}.variant`, undefined);
      store?.setField(
        `${pathToType}.params`,
        Object.keys(updatedParams).length > 0 ? updatedParams : undefined,
      );
      if (Object.keys(convertedInstances).length) {
        store?.setField(`${pathToType}.instances`, convertedInstances);
      }
    }
  };

  return (
    <BaseWordingValuesDialog
      trigger={
        (value as string) || <span className="text-gray-400">{'<empty>'}</span>
      }
      children={
        <BaseEditLocales
          beforeLocales={
            <div className="flex items-center space-x-2 p-2 border-b">
              <Switch
                id="pluralization-toggle"
                checked={isPluralized}
                onCheckedChange={handleVariantToggle}
              />
              <label
                htmlFor="pluralization-toggle"
                className="text-sm font-medium"
              >
                Pluralization
              </label>
            </div>
          }
          children={(locale) =>
            isPluralized ? (
              <PluralizationWordingValueInput
                pathToValue={`${pathToType}.instances.${locale}`}
              />
            ) : (
              <StringTemplateWordingValueInput
                pathToValue={`${pathToType}.instances.${locale}`}
              />
            )
          }
        />
      }
    />
  );
};

export const useSyncParamsFromWordingValues = ({
  store,
  pathToType,
  currentParams,
}: {
  store: WordingStudioStore | null;
  pathToType: PathToType;
  currentParams: SchemaStringTemplateNode['params'] | undefined;
}) => {
  const values = useSelectStoreField(store, pathToType, (value) => {
    const type = value as SchemaStringTemplateNode | undefined;
    if (!type) {
      return [];
    }

    if (type.variant === 'pluralized') {
      return flatMap(type?.instances, (v) => [
        v.one ?? '',
        v.other ?? '',
      ]).filter((v) => !!v);
    }
    return map(type?.instances);
  });

  useEffect(() => {
    const check = () => {
      const extractedParams = sortBy(
        uniq(
          values
            .flatMap((v) => {
              return extractParams(v);
            })
            .filter((v) => !!v),
        ),
      );
      // Keep pluralization count param
      const numberParams = Object.fromEntries(
        Object.entries(currentParams || {}).filter(
          ([, param]) => param.type === 'number',
        ),
      );

      if (!extractedParams.length && Object.keys(numberParams).length === 0) {
        if (currentParams) {
          store?.setField(`${pathToType}.params`, undefined);
        }
      } else {
        const allParams = [...extractedParams, ...Object.keys(numberParams)];
        const uniqueParams = [...new Set(allParams)];

        if (
          (Object.keys(currentParams || {}).length ?? 0) !==
            uniqueParams.length ||
          !isEqual(
            sortBy(Object.keys(currentParams || {})),
            sortBy(uniqueParams),
          )
        ) {
          const nextParams: typeof currentParams = {};

          // Add extracted params (string type by default)
          extractedParams.forEach((p) => {
            nextParams[p] = currentParams?.[p] ?? { type: 'string' };
          });

          // Preserve existing number params
          Object.entries(numberParams).forEach(([name, param]) => {
            nextParams[name] = param;
          });

          store?.setField(`${pathToType}.params`, nextParams);
        }
      }
    };

    const id = requestIdleCallback(() => {
      check();
    });

    return () => {
      cancelIdleCallback(id);
    };
  });
};

const Params = ({ pathToField }: { pathToField: PathToField }) => {
  const store = useWordingStudioStore();
  const typeId = useReadStoreField(store, `${pathToField}.typeId`);
  const pathToType = `schema.nodes.${typeId}` as const;

  const currentParams = useReadStoreField(store, `${pathToType}.params`);

  useSyncParamsFromWordingValues({
    store,
    pathToType,
    currentParams,
  });

  if (!currentParams) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <div className="text-sm">Params:</div>
      {map(currentParams, (param, name) => (
        <Badge key={name} variant="outline">
          {name} ({param.type})
        </Badge>
      ))}
    </div>
  );
};

export const SchemaStringTemplateField = ({
  pathToField,
  wordingEditable,
}: {
  pathToField: PathToField;
  wordingEditable: boolean;
}) => {
  const store = useWordingStudioStore();
  const hasParams = useFieldHasParams({
    pathToField,
    store,
  });

  return (
    <>
      <SchemaBaseField
        pathToField={pathToField}
        expandable={false}
        children={({ fieldName, selectType, deleteButton }) => (
          <div>
            <div className="w-full flex gap-1 group">
              {selectType}
              {fieldName}
              {!!wordingEditable &&
                (hasParams ? (
                  <FieldTemplateWordingDialog pathToField={pathToField} />
                ) : (
                  <Wording pathToField={pathToField} />
                ))}
              {deleteButton}
            </div>
            <Params pathToField={pathToField} />
          </div>
        )}
      />
    </>
  );
};
