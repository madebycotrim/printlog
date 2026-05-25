import { useRef, useState, useCallback, MouseEvent as ReactMouseEvent } from 'react';

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hasDragged = useRef(false);

  const onMouseDown = useCallback((e: ReactMouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    hasDragged.current = false;
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    // setTimeout(() => { hasDragged.current = false; }, 50); // optional cleanup
  }, []);

  const onMouseMove = useCallback((e: ReactMouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    ref.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  return {
    ref,
    isDragging,
    hasDragged,
    events: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove
    }
  };
}
