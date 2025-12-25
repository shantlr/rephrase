import { useEffect, useRef, useState } from 'react';

import { useValueRef } from './use-value-ref';
import { flushSync } from 'react-dom';

type PresenceState = 'initial' | 'entering' | 'entered' | 'leaving' | 'left';

interface PresenceOptions {
  delay?: number;
  onEnter?: () => void;
  onEntered?: () => void;
  onLeave?: () => void;
  onLeft?: () => void;
}

export const usePresenceState = (
  open: boolean,
  options: PresenceOptions = {},
) => {
  const { delay = 300 } = options;
  const [state, setState] = useState<PresenceState>(
    open ? 'entered' : 'initial',
  );
  const optionsRef = useValueRef(options);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;

    if (open && !wasOpen) {
      setState('entering');
      optionsRef.current.onEnter?.();

      const timer = setTimeout(() => {
        setState('entered');
        optionsRef.current.onEntered?.();
      }, delay);

      return () => clearTimeout(timer);
    }

    if (!open && wasOpen) {
      setState('leaving');
      optionsRef.current.onLeave?.();

      const timer = setTimeout(() => {
        flushSync(() => {
          setState('left');
          optionsRef.current.onLeft?.();
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [open, delay, optionsRef]);

  return state;
};
