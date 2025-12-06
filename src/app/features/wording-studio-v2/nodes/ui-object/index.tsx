import { PackageIcon } from 'lucide-react';
import { PathToField, PathToType } from '../../types';
import { BaseField } from '../ui-base-field';
import { SchemaFieldList } from '../ui-schema-field-list';

export const SchemaObjectField = ({
  fieldPath,
  typePath,
}: {
  fieldPath: PathToField;
  typePath: PathToType;
}) => {
  return (
    <BaseField
      icon={<PackageIcon size={16} className="text-gray-500" />}
      fieldPath={fieldPath}
    >
      <div className="ml-4">
        <SchemaFieldList schemaPath={`${typePath}.fields`} />
      </div>
    </BaseField>
  );
};
