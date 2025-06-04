
import React, { useState } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import ConnectionEditorDialog from '../diagram/ConnectionEditorDialog';
import DirectEdgeLabel from './DirectEdgeLabel';
import { useDirectEdgeLogic } from '@/hooks/edges/useDirectEdgeLogic';

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
  const { getNodes } = useReactFlow();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { handleDelete, handleDirectClick, handleUpdateConnection } = useDirectEdgeLogic(id);
  
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
        <DirectEdgeLabel
          labelX={labelX}
          labelY={labelY}
          selected={selected}
          onDirectClick={handleDirectClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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
