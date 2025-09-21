import { useAppForm } from '@/app/common/hooks/use-app-form';
import {
  SchemaNode,
  SchemaObjectNode,
  WordingData,
} from '@/server/data/wording.types';
import { useStore } from '@tanstack/react-form';
import { get, map } from 'lodash-es';
import { useMemo } from 'react';

export type PathToType = `schema.nodes.${string}`;

export type PathToField =
  | `schema.root.fields[${number}]`
  | `${PathToType}.fields[${number}]`;

type FormValues = {
  constants: WordingData['constants'];
  schema: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodes: any;
    root: WordingData['schema']['root'];
  };
  selectedLocale: string | null;
  locales: string[];
};

export const useProjectWordingForm = ({
  initialValues: inputInitialValues,
  onSubmit,
}: {
  initialValues?: Partial<FormValues>;
  onSubmit: (values: Pick<WordingData, 'constants' | 'schema'>) => void;
}) => {
  const form = useAppForm({
    defaultValues: {
      constants: inputInitialValues?.constants ?? [],
      schema: inputInitialValues?.schema ?? {},
      locales: inputInitialValues?.locales ?? [],
      selectedLocale: inputInitialValues?.locales?.[0] ?? null,
    } as FormValues,
    onSubmit: ({ value }) => {
      onSubmit({
        constants: value.constants,
        schema: value.schema,
      });
    },
  });

  return {
    form,
  };
};

export const useTypePath = (fieldId: string): PathToType => {
  return `schema.nodes.${fieldId}` as const;
};

export const useFieldType = ({
  pathToType,
  form,
}: {
  pathToType: PathToType;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  return useStore(
    form.store,
    (s) => (get(s.values, pathToType) as SchemaNode)?.type,
  );
};

export const useFormSelectedLocale = (
  form: ReturnType<typeof useProjectWordingForm>['form'],
) => {
  return useStore(form.store, (s) => s.values.selectedLocale);
};

export function useStoreObjectField<T>({
  pathToField,
  form,
  select,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
  select: (field: SchemaObjectNode['fields'][number]) => T;
}) {
  return useStore(form.store, (s) => {
    return select?.(get(s.values, pathToField));
  });
}

export const useStoreObjectFieldName = ({
  pathToField,
  form,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  return useStoreObjectField({
    pathToField,
    form,
    select: (field) => {
      return field?.name;
    },
  });
};

/**
 * Handle field name that contains params
 * Compute all possible field name
 */
export const useObjectFieldNamePossibilities = ({
  pathToField,
  form,
}: {
  pathToField: PathToField;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const template = useStoreObjectFieldName({
    pathToField,
    form,
  });
  const params = useStoreObjectField({
    pathToField,
    form,
    select: (field) => field?.params,
  });

  const constants = useStore(form.store, (s) => s.values.constants);

  return useMemo(() => {
    const compute = (
      temp: string,
      leftParams: {
        name: string;
        def: NonNullable<typeof params>[string];
      }[],
    ): string[] => {
      if (!leftParams.length) {
        return [temp];
      }

      const [p, ...others] = leftParams;
      if (p.def.type === 'constant') {
        const constant = constants.find((c) => c.name === p.def.name);
        if (!constant) {
          // not found, should not trigger warn in that case
          return [];
        }

        if (constant?.type === 'enum') {
          return constant.options.flatMap((option) => {
            const nextTemp = template.replaceAll(`{${p.name}}`, option);
            return compute(nextTemp, others);
          });
        }
      }
      console.warn(`Unhandled param`, p);
      return [];
    };

    return compute(
      template,
      map(params, (p, name) => ({
        name,
        def: p,
      })),
    );
  }, [constants, template, params]);
};
