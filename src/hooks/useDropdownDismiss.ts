import { useEffect, useRef, useCallback } from 'react';

interface UseDropdownDismissOptions {
  isOpen: boolean;
  onClose: () => void;
  /** Optional secondary trigger element ref that shouldn't trigger close when clicked */
  triggerRef?: React.RefObject<HTMLElement | null>;
  disableEscape?: boolean;
}

/**
 * Global hook to handle popover/dropdown dismiss when clicking outside or pressing ESC.
 */
export function useDropdownDismiss<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  triggerRef,
  disableEscape = false,
}: UseDropdownDismissOptions) {
  const containerRef = useRef<T | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscape) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [disableEscape, onClose]
  );

  const handlePointerDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (!target) return;

      // If clicked inside the dropdown container, do not close
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }

      // If clicked inside the trigger button, do not close (trigger handles toggling)
      if (triggerRef?.current && triggerRef.current.contains(target)) {
        return;
      }

      onClose();
    },
    [onClose, triggerRef]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handlePointerDown, handleEscape]);

  return { containerRef };
}
