import { PathToWordingInstanceValue } from '../../use-project-wording-form';
import { MinimalistInput } from '../_minimalist-input';
import { useWordingStudioStore } from '../../ui-wording-studio-context';
import { useReadStoreField } from '../../store';

export const StringTemplateWordingValueInput = ({
  pathToValue,
}: {
  pathToValue: PathToWordingInstanceValue;
}) => {
  const store = useWordingStudioStore();
  const value = useReadStoreField(store, pathToValue) as string | undefined;

  return (
    <MinimalistInput
      type="text"
      value={value ?? ''}
      onChange={(e) => {
        store?.setField(pathToValue, e.target.value);
      }}
      placeholder="Wording..."
    />
  );
};
