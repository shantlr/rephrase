import { useStore } from '@tanstack/react-form';
import {
  PathToType,
  useProjectWordingForm,
} from '../../use-project-wording-form';
import { MinimalistInput } from '../_minimalist-input';
import { get } from 'lodash-es';

export const StringTemplateWordingValueInput = ({
  pathToValue,
  form,
}: {
  pathToValue: string;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const value = useStore(
    form.store,
    (s) => get(s.values, pathToValue) as string | undefined,
  );

  return (
    <MinimalistInput
      type="text"
      value={value ?? ''}
      onChange={(e) => {
        form.setFieldValue(
          pathToValue as `${PathToType}.${string}`,
          e.target.value,
        );
      }}
      placeholder="Wording..."
    />
  );
};
