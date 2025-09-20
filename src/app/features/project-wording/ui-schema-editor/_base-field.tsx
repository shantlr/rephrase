import { useField, useStore } from '@tanstack/react-form';
import {
  PathToField,
  useProjectWordingForm,
  useTypePath,
} from '../use-project-wording-form';
import { useFormError } from '@/app/common/hooks/use-form-error';
import { MinimalistInput } from './_minimalist-input';
import { memo, ReactNode, useEffect, useMemo, useState } from 'react';
import { forEach, get, isEqual, map, sortBy } from 'lodash-es';
import { SchemaObjectNode } from '@/server/data/wording.types';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/app/common/lib/utils';
import { DeleteButton } from '../ui-delete-button';
import { SelectFieldType } from './_select-field-type';
import { extractParams } from './_util-extract-params';

export const usePathToTypeFromPathToField = ({
  pathToField,
  form,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const typeId = useStore(
    form.store,
    (s) =>
      (get(s.values, pathToField) as SchemaObjectNode['fields'][number])
        ?.typeId,
  );

  return {
    typeId,
    pathToType: useTypePath(typeId),
  };
};

const SchemaNameTemplateExemple = ({
  form,
  pathToField,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const template = useStore(form.store, (s) => {
    const field = get(
      s.values,
      pathToField,
    ) as SchemaObjectNode['fields'][number];
    return field.name;
  });
  const params = useStore(form.store, (s) => {
    const field = get(
      s.values,
      pathToField,
    ) as SchemaObjectNode['fields'][number];
    return field.params;
  });
  const constants = useStore(form.store, (s) => s.values.constants);

  const example = useMemo(() => {
    let res = template;
    forEach(params, (param, name) => {
      if (param.type === 'constant') {
        const constant = constants.find((c) => c.name === param.name);
        if (constant && constant.type === 'enum') {
          res = res.replaceAll(`{${name}}`, constant.options[0] ?? '<never>');
        }
      }
    });
    return res;
  }, [constants, params, template]);

  return <div className="text-xs text-gray-500">eg: `{example}`</div>;
};
export const SchemaFieldName = ({
  pathToField,
  form,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const nameField = useField({
    form,
    name: `${pathToField}.name`,
  });

  const paramField = useField({
    form,
    name: `${pathToField}.params`,
    validators: {
      onChangeListenTo: ['constants'],
      onChange: () => {
        const fieldParams = form.getFieldValue(
          `${pathToField}.params`,
        ) as SchemaObjectNode['fields'][number]['params'];

        const constants = form.getFieldValue('constants');

        if (fieldParams) {
          // Ensure that constants does exists
          const errors = map(fieldParams, (param) => {
            if (param.type === 'constant') {
              const existing = constants.find((c) => c.name === param.name);
              if (!existing) {
                return param.name;
              }
            }
          }).filter((v) => !!v);

          if (errors.length > 0) {
            return `Undefined constants: ${errors.join(', ')}`;
          }
          return '';
        }
      },
    },
  });

  const error = useFormError(paramField.state.meta.errors);

  const currentParams = useStore(form.store, (s) => {
    const field = get(
      s.values,
      pathToField,
    ) as SchemaObjectNode['fields'][number];
    return field?.params;
  });
  const extractedParams = useMemo(() => {
    const res = extractParams(nameField.state.value as string);
    if (!res.length) {
      return null;
    }
    return res;
  }, [nameField.state.value]);

  // sync inferred params with field params
  useEffect(() => {
    if (!extractedParams?.length) {
      if (currentParams) {
        form.setFieldValue(`${pathToField}.params`, undefined);
        form.setFieldValue(`${pathToField}.instances`, undefined);
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
        nextParams[p] = currentParams?.[p] ?? { type: 'constant', name: p };
      });

      paramField.setValue(nextParams);
    }
  }, [extractedParams, currentParams]);

  return (
    <>
      <div className="w-full relative shrink">
        <MinimalistInput
          value={nameField.state.value as string}
          onChange={(e) => {
            nameField.setValue(e.target.value);
          }}
        />
        {error && (
          <div className="absolute top-[20px] left-2 bg-rose-400 text-white px-2 rounded z-1 text-sm mt-1">
            {error}
          </div>
        )}
        {!!currentParams && (
          <SchemaNameTemplateExemple pathToField={pathToField} form={form} />
        )}
      </div>
    </>
  );
};

export const SchemaBaseField = memo(
  ({
    pathToField,
    expandable = false,
    form,
    onDelete,

    children = ({ expandButton, selectType, fieldName, deleteButton }) => (
      <div className="group flex gap-1 items-center">
        {expandButton}
        {selectType}
        {fieldName}
        {deleteButton}
      </div>
    ),
  }: {
    pathToField: PathToField;
    expandable?: boolean;
    form: ReturnType<typeof useProjectWordingForm>['form'];
    onDelete?: (pathToField: PathToField) => void;

    children?: (arg: {
      expandButton: ReactNode;
      expanded: boolean;
      selectType: ReactNode;
      fieldName: ReactNode;
      deleteButton: ReactNode;
    }) => ReactNode;
  }) => {
    const { pathToType } = usePathToTypeFromPathToField({
      pathToField,
      form,
    });

    const fieldName = useStore(form.store, (s) =>
      get(s.values, `${pathToField}.name`),
    );

    const [showDetails, setShowDetails] = useState(true);

    return children({
      expanded: showDetails,
      expandButton: expandable && (
        <button
          type="button"
          className={cn('cursor-pointer transition-all', {
            'rotate-180': showDetails,
          })}
          onClick={() => setShowDetails((v) => !v)}
        >
          <ChevronDownIcon />
        </button>
      ),
      selectType: <SelectFieldType pathToType={pathToType} form={form} />,
      fieldName: <SchemaFieldName pathToField={pathToField} form={form} />,
      deleteButton: !!onDelete && (
        <DeleteButton
          onDelete={() => onDelete(pathToField)}
          requireConfirmation={!!fieldName}
          itemName={fieldName}
          itemType="field"
        />
      ),
    });
  },
);
SchemaBaseField.displayName = 'SchemaBaseField';
