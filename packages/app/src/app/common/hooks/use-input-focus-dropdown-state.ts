import { useCallback, useRef, useState } from 'react';

import { usePresenceState } from './use-presence-state';

interface UseInputFocusDropdownStateOptions {
  delay?: number;
}

export const useInputFocusDropdownState = (
  initialOpen: boolean = false,
  options: UseInputFocusDropdownStateOptions = {},
) => {
  const { delay = 150 } = options;
  const [open, setOpen] = useState(initialOpen);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldOpenOnFocusRef = useRef(true);
  const shouldFocusBackToInputRef = useRef(false);

  const presenceState = usePresenceState(open, {
    delay,
    onLeft: () => {
      if (shouldFocusBackToInputRef.current) {
        inputRef.current?.focus();
        shouldFocusBackToInputRef.current = false;
      }
    },
  });

  const handleFocus = useCallback(() => {
    if (!shouldOpenOnFocusRef.current) {
      shouldOpenOnFocusRef.current = true;
      return;
    }

    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const closeWithFocusBackToInput = useCallback(() => {
    setOpen(false);
    shouldFocusBackToInputRef.current = true;
    shouldOpenOnFocusRef.current = false;
  }, []);

  return {
    open,
    setOpen,
    presenceState,
    close: handleClose,
    closeWithFocusBackToInput,
    inputProps: {
      ref: inputRef,
      onFocus: handleFocus,
    },
    dropdownProps: {
      open,
      onOpenChange: setOpen,
    },
  };
};
