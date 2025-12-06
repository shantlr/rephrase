import { TypeIcon } from 'lucide-react';
import { PathToField, PathToType } from '../../types';
import { BaseField } from '../ui-base-field';

const StringTemplatePreview = () => {
  return null;
};

export const SchemaStringTemplateField = ({
  fieldPath,
  typePath,
}: {
  fieldPath: PathToField;
  typePath: PathToType;
}) => {
  return (
    <BaseField
      icon={<TypeIcon className="text-gray-500" size={16} />}
      fieldPath={fieldPath}
      valuesPreview={<StringTemplatePreview type={typePath} />}
    />
  );
};
