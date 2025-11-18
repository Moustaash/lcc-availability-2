import React from 'react';
import ReactDOM from 'react-dom';
import { cn } from '../lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  position: { x: number; y: number };
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ content, position, visible }) => {
  if (!visible) return null;

  // Render the tooltip using a portal to avoid z-index and overflow issues
  return ReactDOM.createPortal(
    <div
      className={cn(
        "fixed top-0 left-0 z-50 p-3 text-sm rounded-lg shadow-xl pointer-events-none transition-opacity",
        "bg-popover text-popover-foreground border",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{
        // Position the tooltip with a slight offset from the cursor
        transform: `translate(${position.x + 15}px, ${position.y + 15}px)`,
      }}
      role="tooltip"
    >
      {content}
    </div>,
    document.body
  );
};

export default Tooltip;
