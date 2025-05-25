
import React, { useState } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import { Edit } from 'lucide-react';
import ConnectionEditorDialog from '../diagram/ConnectionEditorDialog';

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

  const handleUpdateConnection = (newSourceId: string, newTargetId: string, newSourceHandle?: string, newTargetHandle?: string) => {
    setEdges((edges) => 
      edges.map((edge) => 
        edge.id === id 
          ? {
              ...edge,
              source: newSourceId,
              target: newTargetId,
              sourceHandle: newSourceHandle,
              targetHandle: newTargetHandle,
            }
          : edge
      )
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
            Direct
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
