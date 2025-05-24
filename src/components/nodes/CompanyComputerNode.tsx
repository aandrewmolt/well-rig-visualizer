
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Monitor } from 'lucide-react';

const CompanyComputerNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-gray-700 text-white rounded-lg p-4 border-2 border-gray-500 min-w-[150px] text-center relative">
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
      
      <div className="flex flex-col items-center gap-2">
        <Monitor className="h-6 w-6" />
        <div>
          <h3 className="font-bold">{data.label}</h3>
          <p className="text-xs text-gray-300">Computer</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyComputerNode;
