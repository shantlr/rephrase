import { useAppForm } from '@/app/common/hooks/use-app-form';
import { WordingData } from '@/server/data/wording.types';

export type ProjectWordingConfig = WordingData['config'];

export const useProjectWordingForm = ({
  initialConfig,
  onSubmit,
}: {
  initialConfig?: ProjectWordingConfig;
  onSubmit: (values: ProjectWordingConfig) => void;
}) => {
  const form = useAppForm({
    defaultValues: {
      enums: Array.isArray(initialConfig?.enums) ? initialConfig.enums : [],
      schema: {
        type: initialConfig?.schema?.type ?? 'object',
        description: initialConfig?.schema?.description ?? '',
        fields: initialConfig?.schema?.fields ?? [],
      },
    } as {
      enums: Array<{ name: string; values: string[]; description: string }>;
      schema: {
        type: string;
        description: string;
        // NOTE: as of now fields typing seems to be too complex for tanstack form type inference which leads to ts performance issues
        fields: unknown[];
      };
    },
    onSubmit: ({ value }) => {
      onSubmit(value as ProjectWordingConfig);
    },
  });

  return {
    form,
  };
};
