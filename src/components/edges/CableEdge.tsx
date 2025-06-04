
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

  const handleQuickToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const sourceNode = getNodes().find(node => node.id === source);
    const targetNode = getNodes().find(node => node.id === target);
    
    // Check if this connection can be toggled between direct and cable
    const canToggle = (
      (sourceNode?.type === 'satellite' && targetNode?.type === 'mainBox') ||
      (sourceNode?.type === 'mainBox' && targetNode?.type === 'satellite') ||
      (sourceNode?.type === 'satellite' && targetNode?.type === 'shearstreamBox') ||
      (sourceNode?.type === 'shearstreamBox' && targetNode?.type === 'satellite') ||
      (sourceNode?.type === 'yAdapter' && (targetNode?.type === 'well' || targetNode?.type === 'wellsideGauge' || targetNode?.type === 'companyComputer'))
    );

    if (!canToggle) {
      // If can't toggle, open the edit dialog
      setIsEditDialogOpen(true);
      return;
    }

    const currentConnectionType = data?.connectionType || 'cable';
    
    if (currentConnectionType === 'cable') {
      // Switch to direct connection
      setEdges((edges) => 
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              type: 'direct',
              data: {
                ...edge.data,
                connectionType: 'direct',
                label: 'Direct Connection'
              },
              style: {
                stroke: '#10b981',
                strokeWidth: 3,
                strokeDasharray: '5,5',
              },
              animated: true,
            };
          }
          return edge;
        })
      );
    } else {
      // Switch to cable connection - find the first available cable type
      const availableCables = inventoryData.equipmentTypes.filter(type => 
        type.category === 'cables'
      );
      
      // Sort by preference: 100ft first, then 200ft, then 300ft
      const sortedCables = availableCables.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        if (aName.includes('100ft')) return -1;
        if (bName.includes('100ft')) return 1;
        if (aName.includes('200ft')) return -1;
        if (bName.includes('200ft')) return 1;
        if (aName.includes('300ft')) return -1;
        if (bName.includes('300ft')) return 1;
        
        return 0;
      });

      const defaultCable = sortedCables[0];
      
      if (defaultCable) {
        setEdges((edges) => 
          edges.map((edge) => {
            if (edge.id === id) {
              return {
                ...edge,
                type: 'cable',
                data: {
                  ...edge.data,
                  connectionType: 'cable',
                  cableTypeId: defaultCable.id,
                  label: getCableDisplayName(defaultCable.id)
                },
                style: {
                  stroke: getCableColor(defaultCable.id),
                  strokeWidth: 3,
                  strokeDasharray: undefined,
                },
                animated: false,
              };
            }
            return edge;
          })
        );
      }
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
                stroke: '#10b981',
                strokeWidth: 3,
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
          onClick={handleQuickToggle}
          onContextMenu={handleRightClick}
          className="nodrag nopan hover:bg-gray-50"
          title="Left click to toggle connection type, right click for advanced options"
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
