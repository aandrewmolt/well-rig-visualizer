
import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  Edge,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';

interface InteractiveCableEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  style?: React.CSSProperties;
  markerEnd?: string;
  data?: {
    connectionType?: string;
    label?: string;
    cableTypeId?: string;
  };
}

const InteractiveCableEdge: React.FC<InteractiveCableEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const { setEdges, getNodes } = useReactFlow();
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const nodes = getNodes();
  const sourceNode = nodes.find(n => n.id === id.split('-')[1]);
  const targetNode = nodes.find(n => n.id === id.split('-')[2]);

  // Check if this is a Y to Well connection (can toggle between 100ft and direct)
  const isYToWellConnection = 
    (sourceNode?.type === 'yAdapter' && targetNode?.type === 'well') ||
    (sourceNode?.type === 'well' && targetNode?.type === 'yAdapter');

  const handleEdgeClick = () => {
    if (isYToWellConnection) {
      const currentType = data?.connectionType || 'cable';
      const newType = currentType === 'direct' ? 'cable' : 'direct';
      
      setEdges((edges: Edge[]) => 
        edges.map((edge: Edge) => {
          if (edge.id === id) {
            if (newType === 'direct') {
              return {
                ...edge,
                type: 'direct',
                label: 'Direct Connection',
                data: {
                  ...edge.data,
                  connectionType: 'direct',
                  label: 'Direct Connection',
                },
                style: {
                  stroke: '#8b5cf6',
                  strokeWidth: 4,
                  strokeDasharray: '5,5',
                },
                animated: true,
              };
            } else {
              return {
                ...edge,
                type: 'cable',
                label: '100ft Cable',
                data: {
                  ...edge.data,
                  connectionType: 'cable',
                  label: '100ft Cable',
                  cableTypeId: '100ft-cable',
                },
                style: {
                  stroke: '#3b82f6',
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
    }
  };

  const currentLabel = data?.label || 'Cable';

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-all transform -translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {isYToWellConnection ? (
            <Button
              onClick={handleEdgeClick}
              size="sm"
              variant="outline"
              className="bg-white text-xs px-2 py-1 h-auto border shadow-sm hover:bg-gray-50"
            >
              {currentLabel}
            </Button>
          ) : (
            <div className="bg-white text-xs px-2 py-1 border rounded shadow-sm pointer-events-none">
              {currentLabel}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default InteractiveCableEdge;
