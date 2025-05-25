
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
      
      {/* Output 1 - Primary output for wells */}
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
      <div
        className="absolute text-xs font-bold"
        style={{
          right: -25,
          top: '25%',
          transform: 'translateY(-50%)',
          color: '#374151',
          fontSize: '8px'
        }}
      >
        1
      </div>
      
      {/* Output 2 - Switchable output */}
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
      <div
        className="absolute text-xs font-bold"
        style={{
          right: -25,
          top: '65%',
          transform: 'translateY(-50%)',
          color: '#374151',
          fontSize: '8px'
        }}
      >
        2
      </div>
      
      {/* Connection capability indicator */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
        <span className="bg-white px-1 rounded text-[8px]">Switch: Direct/100ft</span>
      </div>
    </div>
  );
};

export default YAdapterNode;
