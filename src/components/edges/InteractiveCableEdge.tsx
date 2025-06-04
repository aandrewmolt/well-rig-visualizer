
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

  console.log('Enhanced InteractiveCableEdge debugging:', {
    id,
    sourceId: currentEdge.source,
    targetId: currentEdge.target,
    sourceNodeType: sourceNode?.type,
    targetNodeType: targetNode?.type,
    edgeType: currentEdge.type,
    connectionType: data?.connectionType,
    label: data?.label,
    currentEdgeData: currentEdge.data,
    currentEdgeStyle: currentEdge.style
  });

  // Check if this is a Y to Well connection (can toggle between 100ft and direct)
  const isYToWellConnection = 
    (sourceNode?.type === 'yAdapter' && targetNode?.type === 'well') ||
    (sourceNode?.type === 'well' && targetNode?.type === 'yAdapter');

  console.log('Enhanced Y to Well connection check:', { 
    isYToWellConnection, 
    sourceType: sourceNode?.type, 
    targetType: targetNode?.type 
  });

  const handleEdgeClick = () => {
    console.log('Enhanced edge click debugging:', { 
      id, 
      isYToWellConnection, 
      currentEdge,
      currentType: data?.connectionType || currentEdge.type || 'cable'
    });
    
    if (isYToWellConnection) {
      // Determine current type from multiple sources with enhanced logic
      const currentType = data?.connectionType || currentEdge.type || 'cable';
      const newType = currentType === 'direct' ? 'cable' : 'direct';
      
      console.log('Enhanced connection type toggle:', {
        from: currentType,
        to: newType,
        edgeId: id,
        originalEdge: currentEdge
      });
      
      setEdges((edges: Edge[]) => {
        const updatedEdges = edges.map((edge: Edge) => {
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
              const directEdge = {
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
              console.log('Created direct edge:', directEdge);
              return directEdge;
            } else {
              const cableEdge = {
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
              console.log('Created cable edge:', cableEdge);
              return cableEdge;
            }
          }
          return edge;
        });
        
        console.log('Updated edges after toggle:', updatedEdges.filter(e => e.id === id));
        return updatedEdges;
      });

      // Trigger immediate save for this critical user action
      // Note: This will be handled by the parent component's save logic
      console.log('Edge toggle completed, triggering save...');
    }
  };

  // Get current label with enhanced fallback logic
  const getCurrentLabel = () => {
    // Enhanced label detection with debugging
    if (data?.label) {
      console.log('Using data.label:', data.label);
      return data.label;
    }
    if (currentEdge.label) {
      const label = typeof currentEdge.label === 'string' ? currentEdge.label : 'Cable';
      console.log('Using currentEdge.label:', label);
      return label;
    }
    
    // Determine label based on connection type with enhanced logic
    const connectionType = data?.connectionType || currentEdge.type || 'cable';
    console.log('Determining label from connectionType:', connectionType);
    
    if (connectionType === 'direct') return 'Direct Connection';
    if (data?.cableTypeId === '1') return '100ft Cable';
    return 'Cable';
  };

  const currentLabel = getCurrentLabel();
  console.log('Final edge label:', currentLabel);

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
