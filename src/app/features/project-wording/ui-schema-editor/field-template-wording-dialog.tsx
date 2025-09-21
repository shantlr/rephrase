import {
  PathToField,
  useFormSelectedLocale,
  useObjectFieldNamePossibilities,
  useProjectWordingForm,
  useStoreObjectField,
} from '../use-project-wording-form';
import { BaseWordingValuesDialog } from './_base-wording-values-dialog';
import { BaseEditLocales } from './wording-values/_base-edit-locales';
import { memo } from 'react';
import { Badge } from '@/app/common/ui/badge';
import { WordingObjectFieldInput } from './wording-values';

/**
 * Wording values dialog when field name contain params
 */
export const FieldTemplateWordingDialog = memo(
  ({
    pathToField,
    form,
  }: {
    pathToField: PathToField;
    form: ReturnType<typeof useProjectWordingForm>['form'];
  }) => {
    const possibleFieldNames = useObjectFieldNamePossibilities({
      pathToField,
      form,
    });

    const selectedLocale = useFormSelectedLocale(form);
    const values = useStoreObjectField({
      pathToField,
      form,
      select: (field) => {
        const localeInstances = field.instances?.[selectedLocale!];

        if (!localeInstances) {
          return null;
        }

        const result = possibleFieldNames.filter(
          (fieldName) => fieldName in localeInstances!,
        );
        if (!result.length) {
          return null;
        }
        return result;
      },
    });

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
            form={form}
            children={(locale) => (
              <WordingObjectFieldInput
                pathToField={pathToField}
                form={form}
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
