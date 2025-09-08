import { useMemo } from 'react';
import * as z from 'zod';

/**
 * Hook to format form field errors into readable messages.
 * Only returns the first error if multiple exist.
 *
 * @param errors - Array of error messages from form field state
 * @returns The first formatted error message or undefined if no errors
 */
export const useFormError = (errors: unknown[]): string | null => {
  return useMemo(() => {
    for (const error of errors) {
      const e = error as z.core.$ZodIssue;
      if (e && typeof e.message === 'string') {
        return e.message;
      }
    }
    return null;
  }, [errors]);
};
