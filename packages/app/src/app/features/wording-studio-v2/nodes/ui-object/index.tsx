import { PackageIcon } from 'lucide-react';
import { PathToField } from '../../types';
import { BaseField } from '../ui-base-field';
import { SchemaFieldList } from '../ui-schema-field-list';

export const SchemaObjectField = ({
  fieldPath,
  valuePath,
}: {
  fieldPath: PathToField;
  valuePath: string;
}) => {
  return (
    <BaseField
      icon={<PackageIcon size={16} className="text-gray-500" />}
      fieldPath={fieldPath}
      valuePath={valuePath}
    >
      {({ fieldPath, valuePath }) => (
        <div className="ml-4">
          <SchemaFieldList
            schemaPath={`${fieldPath}.type.fields`}
            valuePath={valuePath}
          />
        </div>
      )}
    </BaseField>
  );
};
