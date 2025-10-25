import { PathToWordingInstanceValue } from '../../use-project-wording-form';
import { MinimalistInput } from '../_minimalist-input';
import { useWordingStudioStore } from '../../ui-wording-studio-context';
import { useReadStoreField } from '../../store';

export const PluralizationWordingValueInput = ({
  pathToValue,
}: {
  pathToValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const value = useReadStoreField(store, pathToValue) as
    | {
        one: string;
        other: string;
      }
    | undefined;

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
            store?.setField(`${pathToValue}.one`, e.target.value);
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
            store?.setField(`${pathToValue}.other`, e.target.value);
          }}
          placeholder="Plural form..."
        />
      </div>
    </div>
  );
};
