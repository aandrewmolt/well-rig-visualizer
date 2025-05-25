
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Monitor } from 'lucide-react';

const CompanyComputerNode = ({ data }: { data: any }) => {
  // Standardize the label format - extract equipment ID if available, otherwise use default format
  const getDisplayLabel = () => {
    if (data.equipmentId) {
      return data.equipmentId;
    }
    // Extract number from label if it exists (e.g., "Company Computer 1" -> "CC-1")
    const match = data.label?.match(/(\d+)/);
    if (match) {
      return `CC-${match[1].padStart(3, '0')}`;
    }
    return data.label || 'Company Computer';
  };

  return (
    <div className="bg-gray-700 text-white rounded-lg p-3 border-2 border-gray-500 min-w-[120px] text-center relative">
      <Handle
        type="source"
        position={Position.Right}
        style={{
          right: -8,
          backgroundColor: '#374151',
          border: '2px solid white',
          width: 12,
          height: 12,
        }}
      />
      
      <div className="flex flex-col items-center gap-1">
        <Monitor className="h-5 w-5" />
        <div>
          <h3 className="font-bold text-sm">{getDisplayLabel()}</h3>
          <p className="text-xs text-gray-300">Computer</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyComputerNode;
