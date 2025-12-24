import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';

import { useValueRef } from '@/app/common/hooks/use-value-ref';

type OverlayCallback = (event: MouseEvent) => boolean | void;

interface OverlayContextValue {
  register: (callback: OverlayCallback) => () => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

interface RootOverlayContextProps {
  children: ReactNode;
}

export function RootOverlayContext({ children }: RootOverlayContextProps) {
  const callbacksRef = useRef<Set<OverlayCallback>>(new Set());

  const register = useCallback((callback: OverlayCallback) => {
    callbacksRef.current.add(callback);
    return () => {
      callbacksRef.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      for (const callback of callbacksRef.current) {
        const handled = callback(event);
        if (handled) {
          break;
        }
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const value = useMemo<OverlayContextValue>(
    () => ({
      register,
    }),
    [register],
  );

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
}

export function useOverlayContext() {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlayContext must be used within RootOverlayContext');
  }
  return context;
}

type ElementRef = RefObject<HTMLElement | null>;

interface OverlayProps {
  open: boolean;
  elements: ElementRef | ElementRef[];
  onClickOutside: () => void;
  children: ReactNode;
}

export function Overlay({
  open,
  elements,
  onClickOutside,
  children,
}: OverlayProps) {
  const { register } = useOverlayContext();
  const propsRef = useValueRef({ elements, onClickOutside });

  useEffect(() => {
    if (!open) {
      return;
    }

    const callback: OverlayCallback = (event) => {
      const target = event.target as Node;
      const elementRefs = Array.isArray(propsRef.current.elements)
        ? propsRef.current.elements
        : [propsRef.current.elements];

      const hasElems = elementRefs.some((e) => !!e.current);
      if (!hasElems) {
        return false;
      }

      const isInsideAnyElement = elementRefs.some((ref) => {
        return ref.current?.contains(target);
      });

      if (!isInsideAnyElement) {
        propsRef.current.onClickOutside();
        return true;
      }

      return false;
    };

    return register(callback);
  }, [open, propsRef, register]);

  return <>{children}</>;
}
