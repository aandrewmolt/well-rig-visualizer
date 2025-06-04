
import React, { useState } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import ConnectionEditorDialog from '../diagram/ConnectionEditorDialog';
import EdgeLabel from './EdgeLabel';
import { useDirectEdgeLogic } from '@/hooks/edges/useDirectEdgeLogic';

interface DirectEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  style?: React.CSSProperties;
  markerEnd?: string;
  selected?: boolean;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: {
    connectionType?: string;
    label?: string;
    immediateSave?: () => void;
  };
}

const DirectEdge: React.FC<DirectEdgeProps> = ({
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
}) => {
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

  // Handle edge deletion with immediate save
  const handleEdgeDelete = () => {
    console.log('Deleting direct edge:', id);
    handleDelete();
    
    // Trigger immediate save if available
    if (data?.immediateSave) {
      console.log('Triggering immediate save after direct edge deletion');
      setTimeout(() => data.immediateSave!(), 50);
    }
  };

  // Get current label
  const currentLabel = data?.label || 'Direct Connection';

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: '#10b981',
          strokeWidth: selected ? 6 : 3,
          strokeDasharray: '5,5',
        }} 
      />
      <EdgeLabelRenderer>
        <EdgeLabel
          label={currentLabel}
          isInteractive={true}
          onToggle={handleDirectClick}
          onDelete={handleEdgeDelete}
          labelX={labelX}
          labelY={labelY}
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
