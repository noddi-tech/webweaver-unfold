import { useCallback, useEffect, RefObject } from "react";

/**
 * Hook for managing focus in dialogs and forms
 * Provides utilities for auto-focusing first input and keyboard shortcuts
 */
export function useFocusManagement() {
  /**
   * Focus the first focusable input element in a container
   */
  const focusFirstInput = useCallback((containerRef: RefObject<HTMLElement>) => {
    if (!containerRef.current) return;
    
    const firstInput = containerRef.current.querySelector<HTMLElement>(
      'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (firstInput) {
      // Small delay to ensure the dialog is fully mounted
      setTimeout(() => firstInput.focus(), 50);
    }
  }, []);

  /**
   * Get all focusable elements within a container
   */
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'a[href]',
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  }, []);

  /**
   * Trap focus within a container (for modals)
   */
  const trapFocus = useCallback((e: KeyboardEvent, containerRef: RefObject<HTMLElement>) => {
    if (!containerRef.current || e.key !== 'Tab') return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, [getFocusableElements]);

  return { focusFirstInput, trapFocus, getFocusableElements };
}

/**
 * Hook for adding Ctrl/Cmd+S save shortcut to dialogs
 */
export function useSaveShortcut(
  isOpen: boolean,
  onSave: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!isOpen || !enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSave, enabled]);
}

/**
 * Hook for handling Enter key submission in forms
 */
export function useEnterSubmit(
  onSubmit: () => void,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (enabled && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit, enabled]);

  return handleKeyDown;
}
