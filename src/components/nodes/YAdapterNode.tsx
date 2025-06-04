
import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const YAdapterNode = ({ data }: { data: any }) => {
  const [topPortNumber, setTopPortNumber] = useState<string>(data.topPortNumber || '1');
  const [bottomPortNumber, setBottomPortNumber] = useState<string>(data.bottomPortNumber || '2');

  const swapPortNumbers = () => {
    const tempTop = topPortNumber;
    setTopPortNumber(bottomPortNumber);
    setBottomPortNumber(tempTop);
  };

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

      {/* Swap button */}
      <Button
        onClick={swapPortNumbers}
        size="sm"
        variant="ghost"
        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white hover:bg-gray-100 border border-gray-300 rounded-full"
        title="Swap port numbers"
      >
        <RotateCw className="h-3 w-3" />
      </Button>
      
      {/* Output 1 - Top port */}
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
        className="absolute text-lg font-bold"
        style={{
          right: -25,
          top: '25%',
          transform: 'translateY(-50%)',
          color: '#374151',
          fontSize: '18px'
        }}
      >
        {topPortNumber}
      </div>
      
      {/* Output 2 - Bottom port */}
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
        className="absolute text-lg font-bold"
        style={{
          right: -25,
          top: '65%',
          transform: 'translateY(-50%)',
          color: '#374151',
          fontSize: '18px'
        }}
      >
        {bottomPortNumber}
      </div>
      
      {/* Connection capability indicator */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
        <span className="bg-white px-1 rounded text-[8px]">Switch: Direct/100ft</span>
      </div>
    </div>
  );
};

export default YAdapterNode;
