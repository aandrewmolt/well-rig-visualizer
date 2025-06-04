
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

  console.log('InteractiveCableEdge debugging:', {
    id,
    sourceId: currentEdge.source,
    targetId: currentEdge.target,
    sourceNodeType: sourceNode?.type,
    targetNodeType: targetNode?.type,
    edgeType: currentEdge.type,
    connectionType: data?.connectionType || currentEdge.data?.connectionType,
    label: data?.label || currentEdge.label,
  });

  // Check if this is a Y to Well connection (can toggle between 100ft and direct)
  const isYToWellConnection = 
    (sourceNode?.type === 'yAdapter' && targetNode?.type === 'well') ||
    (sourceNode?.type === 'well' && targetNode?.type === 'yAdapter');

  console.log('Y to Well connection check:', { 
    isYToWellConnection, 
    sourceType: sourceNode?.type, 
    targetType: targetNode?.type 
  });

  const handleEdgeClick = () => {
    console.log('Edge click triggered:', { 
      id, 
      isYToWellConnection, 
      currentEdge 
    });
    
    if (isYToWellConnection) {
      // Determine current type - check multiple sources
      const currentType = data?.connectionType || currentEdge.data?.connectionType || currentEdge.type || 'cable';
      const newType = currentType === 'direct' ? 'cable' : 'direct';
      
      console.log('Connection type toggle:', {
        from: currentType,
        to: newType,
        edgeId: id
      });
      
      setEdges((prevEdges: Edge[]) => {
        return prevEdges.map((edge: Edge) => {
          if (edge.id === id) {
            if (newType === 'direct') {
              // Create direct connection
              const directEdge = {
                ...edge,
                type: 'direct',
                label: 'Direct Connection',
                data: {
                  ...edge.data,
                  connectionType: 'direct',
                  label: 'Direct Connection',
                  sourceHandle: edge.sourceHandle || data?.sourceHandle,
                  targetHandle: edge.targetHandle || data?.targetHandle,
                  cableTypeId: undefined, // Clear cable-specific data
                },
                style: {
                  stroke: '#10b981',
                  strokeWidth: 3,
                  strokeDasharray: '5,5',
                },
                animated: true,
              };
              console.log('Created direct edge:', directEdge);
              return directEdge;
            } else {
              // Create cable connection
              const cableEdge = {
                ...edge,
                type: 'cable',
                label: '100ft Cable',
                data: {
                  ...edge.data,
                  connectionType: 'cable',
                  label: '100ft Cable',
                  cableTypeId: '1', // 100ft cable type ID
                  sourceHandle: edge.sourceHandle || data?.sourceHandle,
                  targetHandle: edge.targetHandle || data?.targetHandle,
                },
                style: {
                  stroke: '#3b82f6',
                  strokeWidth: 3,
                  strokeDasharray: undefined,
                },
                animated: false,
              };
              console.log('Created cable edge:', cableEdge);
              return cableEdge;
            }
          }
          return edge;
        });
      });

      console.log('Edge toggle completed');
    }
  };

  // Get current label with enhanced fallback logic
  const getCurrentLabel = () => {
    if (data?.label) {
      return data.label;
    }
    if (currentEdge.label) {
      const label = typeof currentEdge.label === 'string' ? currentEdge.label : 'Cable';
      return label;
    }
    
    // Determine label based on connection type
    const connectionType = data?.connectionType || currentEdge.data?.connectionType || currentEdge.type || 'cable';
    
    if (connectionType === 'direct') return 'Direct Connection';
    if (data?.cableTypeId === '1' || currentEdge.data?.cableTypeId === '1') return '100ft Cable';
    return 'Cable';
  };

  const currentLabel = getCurrentLabel();
  console.log('Edge label:', currentLabel);

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
