import { PackageIcon } from 'lucide-react';
import { PathToField } from '../../types';
import { BaseField } from '../ui-base-field';
import { SchemaFieldList } from '../ui-schema-field-list';

export const SchemaObjectField = ({
  fieldPath,
  valuePath,
  depth = 0,
}: {
  fieldPath: PathToField;
  valuePath: string;
  depth?: number;
}) => {
  return (
    <BaseField
      icon={<PackageIcon size={16} className="text-gray-500" />}
      fieldPath={fieldPath}
      valuePath={valuePath}
      depth={depth}
    >
      {({ fieldPath, valuePath, depth }) => (
        <SchemaFieldList
          schemaPath={`${fieldPath}.type.fields`}
          valuePath={valuePath}
          depth={depth}
        />
      )}
    </BaseField>
  );
};
