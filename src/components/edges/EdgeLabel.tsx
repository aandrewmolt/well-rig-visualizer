
import React from 'react';
import { Button } from '@/components/ui/button';

interface EdgeLabelProps {
  label: string;
  isInteractive: boolean;
  onToggle?: () => void;
  labelX: number;
  labelY: number;
}

const EdgeLabel: React.FC<EdgeLabelProps> = ({
  label,
  isInteractive,
  onToggle,
  labelX,
  labelY,
}) => {
  return (
    <div
      className="absolute pointer-events-all transform -translate-x-1/2 -translate-y-1/2"
      style={{
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
      }}
    >
      {isInteractive ? (
        <Button
          onClick={onToggle}
          size="sm"
          variant="outline"
          className="bg-white text-xs px-2 py-1 h-auto border shadow-sm hover:bg-gray-50"
        >
          {label}
        </Button>
      ) : (
        <div className="bg-white text-xs px-2 py-1 border rounded shadow-sm pointer-events-none">
          {label}
        </div>
      )}
    </div>
  );
};

export default EdgeLabel;
