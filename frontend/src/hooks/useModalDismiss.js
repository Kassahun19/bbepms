import { useEffect, useRef, useCallback } from "react";
export function useModalDismiss({
  isOpen,
  onClose,
  hasUnsavedChanges = false,
  unsavedMessage = "You have unsaved changes. Are you sure you want to close without saving?",
  disableEscape = false,
  disableClickOutside = false,
  preventScroll = true
}) {
  const contentRef = useRef(null);
  const handleDismissRequest = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(unsavedMessage);
      if (!confirmClose) return;
    }
    onClose();
  }, [hasUnsavedChanges, unsavedMessage, onClose]);
  useEffect(() => {
    if (!isOpen || disableEscape) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleDismissRequest();
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isOpen, disableEscape, handleDismissRequest]);
  useEffect(() => {
    if (!isOpen || !preventScroll) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, preventScroll]);
  const handleBackdropClick = useCallback(
    (e) => {
      if (disableClickOutside) return;
      if (contentRef.current && !contentRef.current.contains(e.target)) {
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
    handleDismissRequest
  };
}
