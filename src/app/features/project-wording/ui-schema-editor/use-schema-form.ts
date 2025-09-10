import { useAppForm } from '@/app/common/hooks/use-app-form';
import { Schema } from './types';

export const useSchemaForm = ({
  initialSchema,
  onSubmit,
}: {
  initialSchema?: Schema;
  onSubmit: (values: Schema) => void;
}) => {
  const form = useAppForm({
    defaultValues: {
      type: initialSchema?.type ?? 'object',
      description: initialSchema?.description ?? '',
      fields: initialSchema?.fields ?? [],
    } as {
      type: string;
      description: string;
      // NOTE: as of now fields typing seems to be too complexe for tanstack form type inference which leads to ts performance issues
      fields: unknown[];
    },
    onSubmit: ({ value }) => {
      onSubmit(value as Schema);
    },
  });

  return {
    form,
  };
};
