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
import { get, isEqual, map, sortBy, uniq } from 'lodash-es';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { StringTemplateWordingValueInput } from './wording-values/string-template';
import { SchemaStringTemplateNode } from '@/server/data/wording.types';
import { useEffect, useMemo } from 'react';
import { Badge } from '@/app/common/ui/badge';
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

  const value = useStore(form.store, (s) =>
    get(s.values, `${pathToType}.instances.${selectedLocale}`),
  );
  return (
    <BaseWordingValuesDialog
      trigger={value || ''}
      children={
        <BaseEditLocales
          form={form}
          children={(locale) => (
            <StringTemplateWordingValueInput
              form={form}
              pathToValue={`${pathToType}.instances.${locale}`}
            />
          )}
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
    if (!extractedParams.length) {
      if (currentParams) {
        form.setFieldValue(`${pathToType}.params`, undefined);
      }
    } else if (
      (Object.keys(currentParams || {}).length ?? 0) !==
        extractedParams.length ||
      !isEqual(
        sortBy(Object.keys(currentParams || {})),
        sortBy(extractedParams),
      )
    ) {
      const nextParams: typeof currentParams = {};
      extractedParams.forEach((p) => {
        nextParams[p] = currentParams?.[p] ?? { type: 'string' };
      });

      form.setFieldValue(`${pathToType}.params`, nextParams);
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
          {name}
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
