import React, { useEffect, useRef, useCallback } from 'react';

interface UseModalDismissOptions {
  isOpen: boolean;
  onClose: () => void;
  /** If true, prompts confirmation before closing if user clicks outside or presses ESC */
  hasUnsavedChanges?: boolean;
  /** Custom warning message for unsaved changes confirmation */
  unsavedMessage?: string;
  /** Disable ESC key closing (default: false) */
  disableEscape?: boolean;
  /** Disable clicking outside backdrop closing (default: false) */
  disableClickOutside?: boolean;
  /** Prevent body scrolling when open (default: true) */
  preventScroll?: boolean;
}

/**
 * Global hook to handle modal dismiss via ESC key, Click Outside (backdrop),
 * and unsaved changes confirmation.
 */
export function useModalDismiss({
  isOpen,
  onClose,
  hasUnsavedChanges = false,
  unsavedMessage = 'You have unsaved changes. Are you sure you want to close without saving?',
  disableEscape = false,
  disableClickOutside = false,
  preventScroll = true,
}: UseModalDismissOptions) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleDismissRequest = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(unsavedMessage);
      if (!confirmClose) return;
    }
    onClose();
  }, [hasUnsavedChanges, unsavedMessage, onClose]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || disableEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleDismissRequest();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen, disableEscape, handleDismissRequest]);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (!isOpen || !preventScroll) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, preventScroll]);

  // Backdrop click handler to be attached to the backdrop wrapper element
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (disableClickOutside) return;
      // If clicked element is the backdrop itself (or not inside contentRef)
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        handleDismissRequest();
      }
    },
    [disableClickOutside, handleDismissRequest]
  );

  return {
    contentRef,
    handleBackdropClick,
    handleDismissRequest,
  };
}
