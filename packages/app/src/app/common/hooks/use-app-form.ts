import { createFormHook } from '@tanstack/react-form';
import { FormInput } from '../ui/form/input';
import { FormTextarea } from '../ui/form/textarea';
import { FormSelectMulti } from '../ui/form/select-multi';
import { FormSubmitButton } from '../ui/form/submit-button';
import { fieldContext, formContext } from './use-form-context';

// Create the global form hook with composition
export const { useAppForm } = createFormHook({
  fieldComponents: {
    FormInput,
    FormTextarea,
    FormSelectMulti,
  },
  formComponents: {
    FormSubmitButton,
  },
  fieldContext,
  formContext,
});
