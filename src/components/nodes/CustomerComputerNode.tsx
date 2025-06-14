
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Monitor, Tablet } from 'lucide-react';

const CustomerComputerNode = ({ data }: { data: any }) => {
  const isTablet = data.isTablet || data.equipmentId?.startsWith('CT');
  const isAssigned = data.assigned && data.equipmentId;

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
        {isTablet ? (
          <Tablet className="h-5 w-5" />
        ) : (
          <Monitor className="h-5 w-5" />
        )}
        <div>
          <h3 className="font-bold text-sm">Customer Computer</h3>
          {isAssigned && data.equipmentId && (
            <p className="text-xs text-green-300">{data.equipmentId}</p>
          )}
          <p className="text-xs text-gray-300">{isTablet ? 'Tablet' : 'Computer'}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerComputerNode;
