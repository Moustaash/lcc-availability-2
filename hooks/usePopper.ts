
import { useState, useRef, useEffect, useCallback } from 'react';

export function usePopper<T extends HTMLElement, P extends HTMLElement>() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<T>(null);
  const popperRef = useRef<P>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        popperRef.current && !popperRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  return { isOpen, open, close, toggle, triggerRef, popperRef };
}
