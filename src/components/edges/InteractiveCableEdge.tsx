
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
    sourceHandle?: string;
    targetHandle?: string;
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
  const { setEdges, getNodes, getEdges } = useReactFlow();
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get the actual edge to find source and target
  const edges = getEdges();
  const currentEdge = edges.find(edge => edge.id === id);
  
  if (!currentEdge) return null;

  const nodes = getNodes();
  const sourceNode = nodes.find(n => n.id === currentEdge.source);
  const targetNode = nodes.find(n => n.id === currentEdge.target);

  console.log('InteractiveCableEdge - Edge info:', {
    id,
    sourceId: currentEdge.source,
    targetId: currentEdge.target,
    sourceNodeType: sourceNode?.type,
    targetNodeType: targetNode?.type,
    edgeType: currentEdge.type,
    connectionType: data?.connectionType,
    label: data?.label,
    currentEdgeData: currentEdge.data
  });

  // Check if this is a Y to Well connection (can toggle between 100ft and direct)
  const isYToWellConnection = 
    (sourceNode?.type === 'yAdapter' && targetNode?.type === 'well') ||
    (sourceNode?.type === 'well' && targetNode?.type === 'yAdapter');

  console.log('InteractiveCableEdge - Is Y to Well connection:', isYToWellConnection);

  const handleEdgeClick = () => {
    console.log('InteractiveCableEdge - Edge clicked:', { id, isYToWellConnection, currentEdge });
    
    if (isYToWellConnection) {
      // Determine current type from multiple sources
      const currentType = data?.connectionType || currentEdge.type || 'cable';
      const newType = currentType === 'direct' ? 'cable' : 'direct';
      
      console.log('InteractiveCableEdge - Toggling connection type from', currentType, 'to', newType);
      
      setEdges((edges: Edge[]) => 
        edges.map((edge: Edge) => {
          if (edge.id === id) {
            const updatedEdge = {
              ...edge,
              // Preserve all edge properties
              source: edge.source,
              target: edge.target,
              sourceHandle: edge.sourceHandle || data?.sourceHandle,
              targetHandle: edge.targetHandle || data?.targetHandle,
            };

            if (newType === 'direct') {
              return {
                ...updatedEdge,
                type: 'direct',
                label: 'Direct Connection',
                data: {
                  ...edge.data,
                  connectionType: 'direct',
                  label: 'Direct Connection',
                  sourceHandle: updatedEdge.sourceHandle,
                  targetHandle: updatedEdge.targetHandle,
                  // Clear cable-specific data
                  cableTypeId: undefined,
                },
                style: {
                  stroke: '#10b981',
                  strokeWidth: 3,
                  strokeDasharray: '5,5',
                },
                animated: true,
              };
            } else {
              return {
                ...updatedEdge,
                type: 'cable',
                label: '100ft Cable',
                data: {
                  ...edge.data,
                  connectionType: 'cable',
                  label: '100ft Cable',
                  cableTypeId: '1', // 100ft cable type ID
                  sourceHandle: updatedEdge.sourceHandle,
                  targetHandle: updatedEdge.targetHandle,
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

  // Get current label with fallback logic
  const getCurrentLabel = () => {
    // First check data.label, then currentEdge.label, then default
    if (data?.label) return data.label;
    if (currentEdge.label) return typeof currentEdge.label === 'string' ? currentEdge.label : 'Cable';
    
    // Determine label based on connection type
    const connectionType = data?.connectionType || currentEdge.type || 'cable';
    if (connectionType === 'direct') return 'Direct Connection';
    if (data?.cableTypeId === '1') return '100ft Cable';
    return 'Cable';
  };

  const currentLabel = getCurrentLabel();

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
