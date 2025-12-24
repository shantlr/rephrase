import {
  cloneElement,
  isValidElement,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';

import { Overlay } from './context/overlay/index';

interface DropdownChildProps {
  ref: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
}

interface DropdownTriggerProps {
  ref: RefObject<HTMLDivElement | null>;
  onClick: () => void;
}

type DropdownChildren =
  | ReactElement<{ style?: CSSProperties }>
  | ((props: DropdownChildProps) => ReactNode);

type DropdownTrigger =
  | ReactElement<{ onClick?: () => void }>
  | ((props: DropdownTriggerProps) => ReactNode);

interface DropdownProps {
  trigger: DropdownTrigger;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: DropdownChildren;
  sideOffset?: number;
}

export function Dropdown({
  trigger,
  open,
  onOpenChange,
  children,
  sideOffset = 4,
}: DropdownProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const style: CSSProperties = { marginTop: sideOffset };

  const handleToggle = () => {
    onOpenChange(!open);
  };

  const renderTrigger = () => {
    if (typeof trigger === 'function') {
      return trigger({ ref: triggerRef, onClick: handleToggle });
    }

    if (isValidElement(trigger)) {
      return cloneElement(trigger, {
        ref: triggerRef,
        onClick: trigger.props.onClick ?? handleToggle,
      } as Record<string, unknown>);
    }

    return null;
  };

  const renderContent = () => {
    if (typeof children === 'function') {
      return children({ ref: contentRef, style });
    }

    if (isValidElement(children)) {
      return cloneElement(children, {
        ref: contentRef,
        style: { ...children.props.style, ...style },
      } as Record<string, unknown>);
    }

    return null;
  };

  return (
    <Overlay
      open={open}
      elements={[triggerRef, contentRef]}
      onClickOutside={() => onOpenChange(false)}
    >
      {renderTrigger()}
      {open && renderContent()}
    </Overlay>
  );
}
