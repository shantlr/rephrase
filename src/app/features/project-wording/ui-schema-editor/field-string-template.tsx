import { useStore } from '@tanstack/react-form';
import {
  PathToField,
  PathToType,
  useFormSelectedLocale,
  useProjectWordingForm,
} from '../use-project-wording-form';
import {
  SchemaBaseField,
  useFieldHasParams,
  usePathToTypeFromPathToField,
} from './_base-field';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { flatMap, get, isEqual, map, sortBy, uniq } from 'lodash-es';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { StringTemplateWordingValueInput } from './wording-values/string-template';
import { PluralizationWordingValueInput } from './wording-values/pluralization';
import { SchemaStringTemplateNode } from '@/server/data/wording.types';
import { useEffect, useMemo } from 'react';
import { Badge } from '@/app/common/ui/badge';
import { Switch } from '@/app/common/ui/switch';
import { extractParams } from './_util-extract-params';
import { FieldTemplateWordingDialog } from './field-template-wording-dialog';

const Wording = ({
  pathToField,
  form,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const { pathToType } = usePathToTypeFromPathToField({
    pathToField,
    form,
  });
  const selectedLocale = useFormSelectedLocale(form);

  const currentNode = useStore(
    form.store,
    (s) => get(s.values, pathToType) as SchemaStringTemplateNode,
  );

  const isPluralized = currentNode?.variant === 'pluralized';

  const value = useStore(form.store, (s) => {
    const instances = get(
      s.values,
      `${pathToType}.instances.${selectedLocale}`,
    );
    if (isPluralized && instances) {
      return `${instances.one || ''} / ${instances.other || ''}`;
    }
    return instances;
  });

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

      form.setFieldValue(`${pathToType}.variant`, 'pluralized');
      form.setFieldValue(`${pathToType}.params`, updatedParams);
      if (Object.keys(convertedInstances).length) {
        form.setFieldValue(`${pathToType}.instances`, convertedInstances);
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

      form.setFieldValue(`${pathToType}.variant`, undefined);
      form.setFieldValue(
        `${pathToType}.params`,
        Object.keys(updatedParams).length > 0 ? updatedParams : undefined,
      );
      if (Object.keys(convertedInstances).length) {
        form.setFieldValue(`${pathToType}.instances`, convertedInstances);
      }
    }
  };

  return (
    <BaseWordingValuesDialog
      trigger={value || <span className="text-gray-400">{'<empty>'}</span>}
      children={
        <BaseEditLocales
          form={form}
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
                form={form}
                pathToValue={`${pathToType}.instances.${locale}`}
              />
            ) : (
              <StringTemplateWordingValueInput
                form={form}
                pathToValue={`${pathToType}.instances.${locale}`}
              />
            )
          }
        />
      }
    />
  );
};

export const useExtractParamsFromWordingValues = ({
  pathToType,
  form,
}: {
  pathToType: PathToType;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const values = useStore(form.store, (s) => {
    const type = get(s.values, pathToType) as SchemaStringTemplateNode;
    if (type.variant === 'pluralized') {
      return flatMap(type?.instances, (v) => [
        v.one ?? '',
        v.other ?? '',
      ]).filter((v) => !!v);
    }
    return map(type?.instances);
  });

  const params = useMemo(() => {
    return sortBy(
      uniq(
        values
          .flatMap((v) => {
            return extractParams(v);
          })
          .filter((v) => !!v),
      ),
    );
  }, [values]);

  return params;
};

const Params = ({
  pathToField,
  form,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const { pathToType } = usePathToTypeFromPathToField({
    pathToField,
    form,
  });

  const currentParams = useStore(form.store, (s) => {
    const type = get(s.values, pathToType) as SchemaStringTemplateNode;
    return type?.params;
  });

  const extractedParams = useExtractParamsFromWordingValues({
    pathToType,
    form,
  });

  // sync
  useEffect(() => {
    const numberParams = Object.fromEntries(
      Object.entries(currentParams || {}).filter(
        ([, param]) => param.type === 'number',
      ),
    );

    if (!extractedParams.length && Object.keys(numberParams).length === 0) {
      if (currentParams) {
        form.setFieldValue(`${pathToType}.params`, undefined);
      }
    } else {
      const allParams = [...extractedParams, ...Object.keys(numberParams)];
      const uniqueParams = [...new Set(allParams)];

      if (
        (Object.keys(currentParams || {}).length ?? 0) !==
          uniqueParams.length ||
        !isEqual(sortBy(Object.keys(currentParams || {})), sortBy(uniqueParams))
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

        form.setFieldValue(`${pathToType}.params`, nextParams);
      }
    }
  }, [currentParams, extractedParams]);

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
  form,
  onDelete,
  wordingEditable,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  onDelete?: (pathToField: PathToField) => void;
  wordingEditable: boolean;
}) => {
  const hasParams = useFieldHasParams({
    pathToField,
    form,
  });

  return (
    <>
      <SchemaBaseField
        pathToField={pathToField}
        form={form}
        expandable={false}
        onDelete={onDelete}
        children={({ fieldName, selectType, deleteButton }) => (
          <div>
            <div className="w-full flex gap-1 group">
              {selectType}
              {fieldName}
              {!!wordingEditable &&
                (hasParams ? (
                  <FieldTemplateWordingDialog
                    form={form}
                    pathToField={pathToField}
                  />
                ) : (
                  <Wording pathToField={pathToField} form={form} />
                ))}
              {deleteButton}
            </div>
            <Params pathToField={pathToField} form={form} />
          </div>
        )}
      />
    </>
  );
};
