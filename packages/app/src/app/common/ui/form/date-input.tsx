import { Label } from '@/app/common/ui/label';
import { Input } from '@/app/common/ui/input';
import { useFieldContext } from '../../hooks/use-form-context';
import { useFormError } from '../../hooks/use-form-error';

type FormDateInputProps = {
  label: string;
  min?: Date;
  max?: Date;
  required?: boolean;
};

export const FormDateInput = ({
  label,
  min,
  max,
  required,
}: FormDateInputProps) => {
  const field = useFieldContext<Date>();
  const error = useFormError(field.state.meta.errors);

  const toInputValue = (d?: Date) =>
    d ? d.toISOString().slice(0, 10) : undefined;

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        type="date"
        value={toInputValue(field.state.value)}
        min={toInputValue(min)}
        max={toInputValue(max)}
        onChange={(e) => field.handleChange(new Date(e.target.value))}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
