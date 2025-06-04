
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
      <div className={`
        flex items-center gap-1 rounded-md px-2 py-1 shadow-sm transition-all duration-200
        ${isHovered 
          ? 'bg-blue-50 border border-blue-300 shadow-md' 
          : 'bg-white border border-gray-300'
        }
      `}>
        {isInteractive && onToggle ? (
          <button
            onClick={onToggle}
            className={`
              text-xs font-medium cursor-pointer transition-colors duration-200
              ${isHovered 
                ? 'text-blue-700 hover:text-blue-900' 
                : 'text-blue-600 hover:text-blue-800'
              }
            `}
            title={isInteractive ? "Click to toggle connection type" : undefined}
          >
            {label}
          </button>
        ) : (
          <span className={`
            text-xs font-medium transition-colors duration-200
            ${isHovered ? 'text-gray-800' : 'text-gray-700'}
          `}>
            {label}
          </span>
        )}
        
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className={`
              h-4 w-4 p-0 transition-all duration-200
              ${isHovered 
                ? 'opacity-100 hover:bg-red-100 hover:text-red-600' 
                : 'opacity-70 hover:bg-red-100 hover:text-red-600'
              }
            `}
            title="Delete connection"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default EdgeLabel;
