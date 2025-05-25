
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';

const MainBoxNode = ({ data }: { data: any }) => {
  const ports = [
    { id: 'p1', label: 'P1', coms: 'COM1,2' },
    { id: 'p2', label: 'P2', coms: 'COM3,4' },
    { id: 'p3', label: 'P3', coms: 'COM5,6' },
    { id: 'p4', label: 'P4', coms: 'COM7,8' },
  ];

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 border-2 border-gray-600 min-w-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <Square className="h-5 w-5" />
        <h3 className="font-bold text-lg">{data.label || 'ShearStream Box'}</h3>
      </div>
      
      <div className="space-y-2">
        {ports.map((port, index) => (
          <div key={port.id} className="flex items-center justify-between bg-gray-700 rounded p-2 relative">
            <div>
              <span className="font-semibold">{port.label}</span>
              <span className="text-xs text-gray-300 ml-2">({port.coms})</span>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              style={{
                right: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: '#3b82f6',
                border: '2px solid white',
                width: 12,
                height: 12,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainBoxNode;
