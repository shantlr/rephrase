import { createFormHook } from '@tanstack/react-form';
import { FormInput } from '../ui/form/input';
import { FormTextarea } from '../ui/form/textarea';
import { FormSelectMulti } from '../ui/form/select-multi';
import { FormCheckboxGroup } from '../ui/form/checkbox-group';
import { FormDateInput } from '../ui/form/date-input';
import { FormSelect } from '../ui/form/select';
import { FormSubmitButton } from '../ui/form/submit-button';
import { fieldContext, formContext } from './use-form-context';

// Create the global form hook with composition
export const { useAppForm } = createFormHook({
  fieldComponents: {
    FormInput,
    FormTextarea,
    FormSelectMulti,
    FormSelect,
    FormCheckboxGroup,
    FormDateInput,
  },
  formComponents: {
    FormSubmitButton,
  },
  fieldContext,
  formContext,
});
