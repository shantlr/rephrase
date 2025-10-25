import {
  PathToField,
  useObjectFieldNamePossibilities,
} from '../use-project-wording-form';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { memo } from 'react';
import { Badge } from '@/app/common/ui/badge';
import { WordingObjectFieldInput } from './wording-values';
import { useWordingStudioStore } from '../ui-wording-studio-context';
import { useReadStoreField, useSelectStoreField } from '../store';

/**
 * Wording values dialog when field name contain params
 */
export const FieldTemplateWordingDialog = memo(
  ({ pathToField }: { pathToField: PathToField }) => {
    const store = useWordingStudioStore();
    const possibleFieldNames = useObjectFieldNamePossibilities({
      store,
      pathToField,
    });

    const selectedLocale = useReadStoreField(store, 'selectedLocale');
    const values = useSelectStoreField(
      store,
      `${pathToField}.instances.${selectedLocale}`,
      (v) => {
        if (!v) {
          return null;
        }

        const result = possibleFieldNames.filter((fieldName) => fieldName in v);
        if (!result.length) {
          return null;
        }
        return result;
      },
    );

    return (
      <BaseWordingValuesDialog
        trigger={
          <>
            {!values ? (
              <Badge variant="outline">{`<empty>`}</Badge>
            ) : (
              values.map((v) => (
                <Badge key={v} variant="secondary">
                  {v}
                </Badge>
              ))
            )}
          </>
        }
        children={
          <BaseEditLocales
            children={(locale) => (
              <WordingObjectFieldInput
                pathToField={pathToField}
                pathToParentValue={`${pathToField}.instances.${locale}`}
              />
            )}
          />
        }
      />
    );
  },
);
FieldTemplateWordingDialog.displayName = 'FieldTemplateWordingDialog';
