import { ReactNode } from 'react';
import { Button } from '@/app/common/ui/button';
import { useFormContext } from '../../hooks/use-form-context';
import { useStore } from '@tanstack/react-form';

interface FormSubmitButtonProps extends React.ComponentProps<typeof Button> {
  children: ReactNode;
  loadingText?: ReactNode;
}

export const FormSubmitButton = ({
  children,
  loadingText = 'Submitting...',
  ...buttonProps
}: FormSubmitButtonProps) => {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Button type="submit" disabled={isSubmitting} {...buttonProps}>
      {isSubmitting ? loadingText : children}
    </Button>
  );
};
