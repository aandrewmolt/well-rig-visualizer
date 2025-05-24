
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Circle } from 'lucide-react';

const WellNode = ({ data }: { data: any }) => {
  const backgroundColor = data.color || '#3b82f6';
  const borderColor = data.color === '#3b82f6' ? '#2563eb' : data.color;
  
  return (
    <div 
      className="text-white rounded-lg p-4 border-2 min-w-[120px] text-center relative"
      style={{ 
        backgroundColor,
        borderColor,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          left: -8,
          backgroundColor: borderColor,
          border: '2px solid white',
          width: 12,
          height: 12,
        }}
      />
      
      <div className="flex flex-col items-center gap-2">
        <Circle className="h-6 w-6" />
        <div>
          <h3 className="font-bold">{data.label}</h3>
          <p className="text-xs opacity-80">Well #{data.wellNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default WellNode;
