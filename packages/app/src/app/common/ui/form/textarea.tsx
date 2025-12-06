import { ReactNode } from 'react';
import { Textarea } from '@/app/common/ui/textarea';
import { Label } from '@/app/common/ui/label';
import { useFieldContext } from '../../hooks/use-form-context';
import { useFormError } from '../../hooks/use-form-error';

interface FormTextareaProps
  extends Omit<React.ComponentProps<'textarea'>, 'value' | 'onChange'> {
  label: string;
  required?: boolean;
  description?: ReactNode;
}

export const FormTextarea = ({
  label,
  required = false,
  description,
  id,
  ...textareaProps
}: FormTextareaProps) => {
  const field = useFieldContext<string>();
  const textareaId = id || field.name;
  const error = useFormError(field.state.meta.errors);

  return (
    <div className="space-y-2">
      <Label htmlFor={textareaId}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Textarea
        id={textareaId}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        {...textareaProps}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
