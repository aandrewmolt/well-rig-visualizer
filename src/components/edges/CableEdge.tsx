
import React, { useState } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import ConnectionEditorDialog from '../diagram/ConnectionEditorDialog';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCableTypeService } from '@/hooks/cables/useCableTypeService';

const CableEdge = ({
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
  label,
}: any) => {
  const { getNodes, setEdges } = useReactFlow();
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

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleUpdateConnection = (
    newSourceId: string, 
    newTargetId: string, 
    newSourceHandle?: string, 
    newTargetHandle?: string,
    connectionType?: string,
    cableTypeId?: string
  ) => {
    console.log('Updating cable connection:', { newSourceId, newTargetId, connectionType, cableTypeId });
    
    setEdges((edges) => 
      edges.map((edge) => {
        if (edge.id === id) {
          if (connectionType === 'direct') {
            // Convert to direct connection
            return {
              ...edge,
              source: newSourceId,
              target: newTargetId,
              sourceHandle: newSourceHandle,
              targetHandle: newTargetHandle,
              type: 'direct',
              data: {
                ...edge.data,
                connectionType: 'direct',
                label: 'Direct Connection'
              },
              style: {
                stroke: '#8b5cf6',
                strokeWidth: 4,
                strokeDasharray: '5,5',
              },
              animated: true,
            };
          } else if (connectionType === 'cable' && cableTypeId) {
            // Update cable connection
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
                label: getCableDisplayName(cableTypeId)
              },
              style: {
                stroke: getCableColor(cableTypeId),
                strokeWidth: 3,
                strokeDasharray: undefined,
              },
              animated: false,
            };
          }
        }
        return edge;
      })
    );
    
    setIsEditDialogOpen(false);
  };

  const currentEdge = {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    data,
  };

  // Get the cable label from data or fallback to default
  const cableLabel = data?.label || label || 'Cable';
  
  // Use the style provided or default cable styling
  const edgeStyle = {
    stroke: style.stroke || '#374151',
    strokeWidth: selected ? 4 : 3,
    ...style,
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={edgeStyle}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            fontWeight: 600,
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            pointerEvents: 'all',
            cursor: 'pointer',
            color: '#374151',
            whiteSpace: 'nowrap',
          }}
          onClick={handleEdit}
          className="nodrag nopan hover:bg-gray-50"
        >
          {cableLabel}
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

export default CableEdge;
