
import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { useEdgeToggleLogic } from '@/hooks/edges/useEdgeToggleLogic';
import { getCurrentLabel, checkIsYToWellConnection, logEdgeDebugging } from '@/utils/edgeUtils';
import EdgeLabel from './EdgeLabel';

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
    immediateSave?: () => void;
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
  const { getNodes, getEdges, setEdges } = useReactFlow();
  
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

  // Get current label and ensure it's a string with type guard
  const labelResult = getCurrentLabel(data, currentEdge);
  const currentLabel: string = typeof labelResult === 'string' ? labelResult : 'Cable';

  // Safely extract connectionType with proper type conversion
  const getConnectionType = (): string => {
    if (data?.connectionType) return data.connectionType;
    if (currentEdge.data?.connectionType) {
      // Safely convert unknown to string
      return String(currentEdge.data.connectionType);
    }
    return '';
  };

  // Log debugging information with properly typed parameters
  logEdgeDebugging(
    id,
    currentEdge.source,
    currentEdge.target,
    sourceNode?.type || '',
    targetNode?.type || '',
    currentEdge.type || '',
    getConnectionType(),
    currentLabel
  );

  // Check if this is a Y to Well connection (can toggle between 100ft and direct)
  const isYToWellConnection = checkIsYToWellConnection(sourceNode?.type, targetNode?.type);

  console.log('Y to Well connection check:', { 
    isYToWellConnection, 
    sourceType: sourceNode?.type, 
    targetType: targetNode?.type 
  });

  // Use the edge toggle logic hook
  const { handleEdgeToggle } = useEdgeToggleLogic({ id, data, currentEdge });

  // Handle edge deletion
  const handleEdgeDelete = () => {
    console.log('Deleting edge:', id);
    setEdges((edges) => edges.filter(edge => edge.id !== id));
    
    // Trigger immediate save if available
    if (data?.immediateSave) {
      console.log('Triggering immediate save after edge deletion');
      setTimeout(() => data.immediateSave!(), 50);
    }
  };

  console.log('Edge label:', currentLabel);

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <EdgeLabel
          label={currentLabel}
          isInteractive={isYToWellConnection}
          onToggle={handleEdgeToggle}
          onDelete={handleEdgeDelete}
          labelX={labelX}
          labelY={labelY}
        />
      </EdgeLabelRenderer>
    </>
  );
};

export default InteractiveCableEdge;
