
import React from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';

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
}: any) => {
  const { setEdges } = useReactFlow();
  
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
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 font-bold text-sm"
                title="Delete connection"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default DirectEdge;
