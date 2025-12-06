import { Checkbox } from '@/app/common/ui/checkbox';
import { Label } from '@/app/common/ui/label';
import { useFieldContext } from '../../hooks/use-form-context';
import { useFormError } from '../../hooks/use-form-error';

type Option = {
  value: string;
  label: string;
};

type FormCheckboxGroupProps = {
  label: string;
  options: Option[];
};

export const FormCheckboxGroup = ({ label, options }: FormCheckboxGroupProps) => {
  const field = useFieldContext<string[]>();
  const error = useFormError(field.state.meta.errors);
  const current = new Set(field.state.value ?? []);

  const toggle = (value: string, checked: boolean) => {
    const next = new Set(current);
    if (checked) {
      next.add(value);
    } else {
      next.delete(value);
    }
    field.handleChange(Array.from(next));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm"
          >
            <Checkbox
              checked={current.has(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked === true)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

