import { Label } from '@/app/common/ui/label';
import { useFieldContext } from '../../hooks/use-form-context';
import { useFormError } from '../../hooks/use-form-error';

type Option = {
  value: string;
  label: string;
};

type FormSelectProps = {
  label: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

export const FormSelect = ({
  label,
  options,
  placeholder,
  required,
  disabled,
}: FormSelectProps) => {
  const field = useFieldContext<string | null>();
  const error = useFormError(field.state.meta.errors);

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <select
        className="w-full border rounded-md px-3 py-2 text-sm disabled:cursor-not-allowed"
        value={field.state.value ?? ''}
        onChange={(e) =>
          field.handleChange(e.target.value === '' ? null : e.target.value)
        }
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
