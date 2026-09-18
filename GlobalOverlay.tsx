import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface GlobalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRect: DOMRect | null;
  children: React.ReactNode;
  align?: 'right' | 'left';
}

export const GlobalOverlay: React.FC<GlobalOverlayProps> = ({
  isOpen,
  onClose,
  triggerRect,
  children,
  align = 'right',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const top = triggerRect ? triggerRect.bottom + 8 : 80;
  const right = triggerRect && align === 'right' ? window.innerWidth - triggerRect.right : undefined;
  const left = triggerRect && align === 'left' ? triggerRect.left : undefined;

  const overlayContent = (
    <div className="fixed inset-0 z-[999999] isolate overflow-hidden">
      {/* Transparent backdrop overlay covering the entire viewport */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Detached Dropdown Container */}
      <div
        style={{
          position: 'fixed',
          top: `${top}px`,
          ...(align === 'right' ? { right: `${right}px` } : { left: `${left}px` }),
        }}
        className="w-64 rounded-2xl bg-slate-950/98 border border-cyan-500/60 shadow-[0_30px_90px_rgba(0,0,0,0.98),0_0_50px_rgba(6,182,212,0.45)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlayContent, document.body);
};

export default GlobalOverlay;
