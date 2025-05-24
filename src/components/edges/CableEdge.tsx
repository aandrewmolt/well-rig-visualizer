
import React from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

const CableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getCableColor = (cableType: string) => {
    switch (cableType) {
      case '100ft': return '#ef4444';
      case '200ft': return '#3b82f6';
      case '300ft': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: getCableColor(data?.cableType),
          strokeWidth: 4,
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
            border: `2px solid ${getCableColor(data?.cableType)}`,
            color: getCableColor(data?.cableType),
          }}
          className="nodrag nopan"
        >
          {data?.label || 'Cable'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CableEdge;
