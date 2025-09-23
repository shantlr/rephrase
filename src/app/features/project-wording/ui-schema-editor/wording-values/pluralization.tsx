import { useStore } from '@tanstack/react-form';
import {
  PathToType,
  useProjectWordingForm,
} from '../../use-project-wording-form';
import { MinimalistInput } from '../_minimalist-input';
import { get } from 'lodash-es';

export const PluralizationWordingValueInput = ({
  pathToValue,
  form,
}: {
  pathToValue: string;
  form: ReturnType<typeof useProjectWordingForm>['form'];
}) => {
  const value = useStore(
    form.store,
    (s) =>
      get(s.values, pathToValue) as { one: string; other: string } | undefined,
  );

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm text-gray-600 block mb-1">
          Singular (one):
        </label>
        <MinimalistInput
          type="text"
          value={value?.one ?? ''}
          onChange={(e) => {
            form.setFieldValue(
              `${pathToValue}.one` as `${PathToType}.${string}`,
              e.target.value,
            );
          }}
          placeholder="Singular form..."
        />
      </div>
      <div>
        <label className="text-sm text-gray-600 block mb-1">
          Plural (other):
        </label>
        <MinimalistInput
          type="text"
          value={value?.other ?? ''}
          onChange={(e) => {
            form.setFieldValue(
              `${pathToValue}.other` as `${PathToType}.${string}`,
              e.target.value,
            );
          }}
          placeholder="Plural form..."
        />
      </div>
    </div>
  );
};
