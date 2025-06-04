
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface EdgeLabelProps {
  label: string;
  isInteractive: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  labelX: number;
  labelY: number;
}

const EdgeLabel: React.FC<EdgeLabelProps> = ({
  label,
  isInteractive,
  onToggle,
  onDelete,
  labelX,
  labelY,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-2 py-1 shadow-sm">
        {isInteractive && onToggle ? (
          <button
            onClick={onToggle}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            {label}
          </button>
        ) : (
          <span className="text-xs font-medium text-gray-700">
            {label}
          </span>
        )}
        
        {(isHovered || isInteractive) && onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default EdgeLabel;
