
import React, { useState } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import { Edit } from 'lucide-react';
import ConnectionEditorDialog from '../diagram/ConnectionEditorDialog';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCableTypeService } from '@/hooks/cables/useCableTypeService';

const DirectEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  source,
  target,
  sourceHandle,
  targetHandle,
  data,
}: any) => {
  const { setEdges, getNodes } = useReactFlow();
  const { data: inventoryData } = useInventoryData();
  const { getCableColor, getCableDisplayName } = useCableTypeService(inventoryData.equipmentTypes);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDirectClick = () => {
    // Find the first available 100ft cable
    const cable100ft = inventoryData.equipmentTypes.find(type => 
      type.category === 'cables' && 
      type.name.toLowerCase().includes('100ft')
    );

    if (cable100ft) {
      // Switch to cable connection with 100ft cable
      setEdges((edges) => 
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              type: 'cable',
              data: {
                ...edge.data,
                connectionType: 'cable',
                cableTypeId: cable100ft.id,
                label: getCableDisplayName(cable100ft.id)
              },
              style: {
                stroke: getCableColor(cable100ft.id),
                strokeWidth: 3,
                strokeDasharray: undefined,
              }
            };
          }
          return edge;
        })
      );
    }
  };

  const handleUpdateConnection = (
    newSourceId: string, 
    newTargetId: string, 
    newSourceHandle?: string, 
    newTargetHandle?: string,
    connectionType?: string,
    cableTypeId?: string
  ) => {
    setEdges((edges) => 
      edges.map((edge) => {
        if (edge.id === id) {
          if (connectionType === 'cable' && cableTypeId) {
            // Convert to cable edge
            return {
              ...edge,
              source: newSourceId,
              target: newTargetId,
              sourceHandle: newSourceHandle,
              targetHandle: newTargetHandle,
              type: 'cable',
              data: {
                ...edge.data,
                connectionType: 'cable',
                cableTypeId,
                label: 'Cable'
              },
              style: {
                stroke: '#ef4444', // Red for 100ft cables
                strokeWidth: 3,
                strokeDasharray: undefined,
              }
            };
          } else {
            // Keep as direct connection
            return {
              ...edge,
              source: newSourceId,
              target: newTargetId,
              sourceHandle: newSourceHandle,
              targetHandle: newTargetHandle,
              data: {
                ...edge.data,
                connectionType: 'direct'
              }
            };
          }
        }
        return edge;
      })
    );
  };

  const currentEdge = {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    data,
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: '#8b5cf6',
          strokeWidth: selected ? 6 : 4,
          strokeDasharray: '5,5',
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid #8b5cf6',
            color: '#8b5cf6',
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectClick}
              className="text-purple-600 hover:text-purple-800 cursor-pointer"
              title="Click to switch to 100ft cable"
            >
              Direct
            </button>
            {selected && (
              <div className="flex gap-1">
                <button
                  onClick={handleEdit}
                  className="text-blue-500 hover:text-blue-700 font-bold text-sm flex items-center"
                  title="Edit connection"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700 font-bold text-sm"
                  title="Delete connection"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>

      <ConnectionEditorDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdateConnection={handleUpdateConnection}
        currentEdge={currentEdge}
        nodes={getNodes()}
      />
    </>
  );
};

export default DirectEdge;
