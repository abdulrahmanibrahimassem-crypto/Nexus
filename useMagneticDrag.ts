import { useState, useEffect, useRef, MouseEvent } from 'react';

export function useMagneticDrag(initialPos = { x: typeof window !== 'undefined' ? window.innerWidth - 320 : 100, y: typeof window !== 'undefined' ? window.innerHeight - 120 : 100 }) {
  const [pos, setPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newX = e.clientX - offsetRef.current.x;
      let newY = e.clientY - offsetRef.current.y;

      // Magnetic snap threshold (50px from edges)
      const snapThreshold = 50;
      const maxX = window.innerWidth - 180;
      const maxY = window.innerHeight - 100;

      if (newX < snapThreshold) newX = 16;
      else if (newX > maxX - snapThreshold) newX = window.innerWidth - 180 - 16;

      if (newY < snapThreshold) newY = 16;
      else if (newY > maxY - snapThreshold) newY = window.innerHeight - 100 - 16;

      setPos({ 
        x: Math.max(16, Math.min(window.innerWidth - 180, newX)), 
        y: Math.max(16, Math.min(window.innerHeight - 100, newY)) 
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const startDrag = (e: MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  return { pos, isDragging, startDrag };
}
