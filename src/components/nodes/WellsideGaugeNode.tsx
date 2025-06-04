
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Gauge } from 'lucide-react';

const WellsideGaugeNode = ({ data }: { data: any }) => {
  const backgroundColor = data.color || '#f59e0b';
  const borderColor = data.color === '#f59e0b' ? '#d97706' : data.color;
  
  return (
    <div 
      className="text-white rounded-lg p-3 border-2 min-w-[100px] text-center relative"
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
      
      <div className="flex flex-col items-center gap-1">
        <Gauge className="h-5 w-5" />
        <div>
          <h3 className="font-bold text-sm">{data.label || 'Wellside Gauge'}</h3>
          <p className="text-xs opacity-80">1502 Pressure Gauge</p>
        </div>
      </div>
    </div>
  );
};

export default WellsideGaugeNode;
