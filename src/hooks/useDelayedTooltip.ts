import { useState, useRef, useCallback } from 'react';

export const useDelayedTooltip = (delayMs: number = 5000) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverStartRef = useRef<number | null>(null);

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isClicked) return; // Don't start hover timer if already clicked open
    
    hoverStartRef.current = Date.now();
    clearTimeout();
    
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(true);
    }, delayMs);
  }, [delayMs, clearTimeout, isClicked]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout();
    hoverStartRef.current = null;
    
    // Only close if it was opened by hover (not click)
    if (!isClicked) {
      setIsOpen(false);
    }
  }, [clearTimeout, isClicked]);

  const handleClick = useCallback(() => {
    clearTimeout();
    setIsClicked(true);
    setIsOpen(true);
  }, [clearTimeout]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsClicked(false);
    clearTimeout();
  }, [clearTimeout]);

  // Reset when component unmounts or dependencies change
  const reset = useCallback(() => {
    clearTimeout();
    setIsOpen(false);
    setIsClicked(false);
    hoverStartRef.current = null;
  }, [clearTimeout]);

  return {
    isOpen,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleClose,
    reset
  };
};