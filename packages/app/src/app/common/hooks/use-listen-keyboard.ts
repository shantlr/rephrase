import { useEffect } from 'react';

import { useValueRef } from './use-value-ref';

type KeyboardListener = (event: KeyboardEvent) => void;
type Key = 'Enter' | 'Escape';
type KeyboardListeners = { [K in Key]?: KeyboardListener };

export const useListenKeyboard = (
  listeners: KeyboardListeners,
  enabled: boolean = true,
) => {
  const listenersRef = useValueRef(listeners);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const listener = listenersRef.current[event.key];
      if (listener) {
        listener(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, listenersRef]);
};
