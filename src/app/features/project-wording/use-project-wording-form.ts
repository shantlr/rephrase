import { useAppForm } from '@/app/common/hooks/use-app-form';
import { SchemaNode, WordingData } from '@/server/data/wording.types';
import { useStore } from '@tanstack/react-form';
import { get } from 'lodash-es';

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
