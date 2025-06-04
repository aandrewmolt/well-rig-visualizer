
import React from 'react';
import { Edit } from 'lucide-react';

interface DirectEdgeLabelProps {
  labelX: number;
  labelY: number;
  selected: boolean;
  onDirectClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DirectEdgeLabel: React.FC<DirectEdgeLabelProps> = ({
  labelX,
  labelY,
  selected,
  onDirectClick,
  onEdit,
  onDelete
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        background: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        border: '2px solid #8b5cf6',
        color: '#8b5cf6',
        pointerEvents: 'all',
      }}
      className="nodrag nopan"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onDirectClick}
          className="text-purple-600 hover:text-purple-800 cursor-pointer"
          title="Click to switch to cable"
        >
          Direct
        </button>
        {selected && (
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="text-blue-500 hover:text-blue-700 font-bold text-sm flex items-center"
              title="Edit connection"
            >
              <Edit className="h-3 w-3" />
            </button>
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 font-bold text-sm"
              title="Delete connection"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectEdgeLabel;
