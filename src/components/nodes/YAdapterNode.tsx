
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';

const YAdapterNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-yellow-500 text-gray-900 rounded-lg p-3 border-2 border-yellow-400 min-w-[100px] text-center relative">
      <Handle
        type="target"
        position={Position.Left}
        style={{
          left: -8,
          backgroundColor: '#eab308',
          border: '2px solid white',
          width: 12,
          height: 12,
        }}
      />
      
      <div className="flex flex-col items-center gap-1">
        <Square className="h-5 w-5 rotate-45" />
        <h3 className="font-bold text-sm">{data.label}</h3>
      </div>
      
      {/* Two output handles for Y functionality */}
      <Handle
        type="source"
        position={Position.Right}
        id="output1"
        style={{
          right: -8,
          top: '30%',
          backgroundColor: '#eab308',
          border: '2px solid white',
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output2"
        style={{
          right: -8,
          top: '70%',
          backgroundColor: '#eab308',
          border: '2px solid white',
          width: 10,
          height: 10,
        }}
      />
    </div>
  );
};

export default YAdapterNode;
