
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Gauge } from 'lucide-react';

const WellsideGaugeNode = ({ data }: { data: any }) => {
  const backgroundColor = data.color || '#f59e0b';
  const borderColor = data.color === '#f59e0b' ? '#d97706' : data.color;
  
  return (
    <div 
      className="text-white rounded-lg p-4 border-2 min-w-[140px] text-center relative"
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
        <Gauge className="h-6 w-6" />
        <div>
          <h3 className="font-bold">{data.label}</h3>
          <p className="text-xs opacity-80">Wellside Gauge</p>
        </div>
      </div>
    </div>
  );
};

export default WellsideGaugeNode;
