import { ReactNode } from 'react';
import { Input } from '@/app/common/ui/input';
import { Label } from '@/app/common/ui/label';
import { useFieldContext } from '../../hooks/use-form-context';
import { useFormError } from '../../hooks/use-form-error';

interface FormInputProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  label: string;
  required?: boolean;
  description?: ReactNode;
}

export const FormInput = ({
  label,
  required = false,
  description,
  id,
  ...inputProps
}: FormInputProps) => {
  const field = useFieldContext<string>();
  const inputId = id || field.name;
  const error = useFormError(field.state.meta.errors);

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Input
        id={inputId}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        {...inputProps}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
