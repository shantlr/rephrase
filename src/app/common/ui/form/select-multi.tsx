import { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/common/ui/select';
import { Label } from '@/app/common/ui/label';
import { useFieldContext } from '../../hooks/use-form-context';
import { useFormError } from '../../hooks/use-form-error';

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  required?: boolean;
  description?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  // Either children or options-based approach
  children?: ReactNode;
  options?: FormSelectOption[];
  renderOption?: (option: FormSelectOption) => ReactNode;
  filterOptions?: (
    options: FormSelectOption[],
    selectedValues?: string[],
  ) => FormSelectOption[];
}

export const FormSelectMulti = ({
  label,
  required = false,
  description,
  placeholder,
  children,
  disabled = false,
  options,
  renderOption,
  filterOptions,
}: FormSelectProps) => {
  const field = useFieldContext<string[]>();
  const error = useFormError(field.state.meta.errors);

  // Process options if provided
  const processedOptions =
    options && filterOptions
      ? filterOptions(options, field.state.value)
      : options;

  const handleValueChange = (value: string) => {
    const currentArray = field.state.value as string[];
    if (value && !currentArray.includes(value)) {
      const newArray = [...currentArray, value];
      field.handleChange(newArray);
      // Reset select to empty value for "add another" behavior
      setTimeout(() => {
        const selectElement = document.querySelector(
          `[data-radix-select-trigger]`,
        ) as HTMLElement;
        if (selectElement) {
          selectElement.focus();
        }
      }, 0);
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Select value="" onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children ||
            processedOptions?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {renderOption ? renderOption(option) : option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export { SelectItem };
