import { ComponentProps, ReactNode } from 'react';
import { Button } from '@/app/common/ui/button';
import { useFormContext } from '../../hooks/use-form-context';
import { useStore } from '@tanstack/react-form';

export const FormSubmitButton = ({
  children,
  loadingText = 'Submitting...',
  ...buttonProps
}: Omit<ComponentProps<typeof Button>, 'onClick' | 'type'> & {
  children: ReactNode;
  loadingText?: ReactNode;
}) => {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      {...buttonProps}
      onClick={() => {
        form.handleSubmit();
      }}
    >
      {isSubmitting ? loadingText : children}
    </Button>
  );
};
