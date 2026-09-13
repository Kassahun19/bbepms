import { useEffect, useRef, useCallback } from "react";
export function useDropdownDismiss({
  isOpen,
  onClose,
  triggerRef,
  disableEscape = false
}) {
  const containerRef = useRef(null);
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape" && !disableEscape) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [disableEscape, onClose]
  );
  const handlePointerDown = useCallback(
    (e) => {
      const target = e.target;
      if (!target) return;
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      if (triggerRef?.current && triggerRef.current.contains(target)) {
        return;
      }
      onClose();
    },
    [onClose, triggerRef]
  );
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handlePointerDown, handleEscape]);
  return { containerRef };
}
