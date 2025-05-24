
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Circle } from 'lucide-react';

const WellNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-blue-600 text-white rounded-lg p-4 border-2 border-blue-400 min-w-[120px] text-center relative">
      <Handle
        type="target"
        position={Position.Left}
        style={{
          left: -8,
          backgroundColor: '#1e40af',
          border: '2px solid white',
          width: 12,
          height: 12,
        }}
      />
      
      <div className="flex flex-col items-center gap-2">
        <Circle className="h-6 w-6" />
        <div>
          <h3 className="font-bold">{data.label}</h3>
          <p className="text-xs text-blue-100">Well #{data.wellNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default WellNode;
