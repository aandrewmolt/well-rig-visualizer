
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
  const { getNodes, getEdges } = useReactFlow();
  
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

  // Get current label with enhanced fallback logic
  const currentLabel = getCurrentLabel(data, currentEdge);

  // Convert label to string for debugging (handle ReactNode case)
  const labelForDebugging = typeof currentLabel === 'string' ? currentLabel : undefined;

  // Log debugging information
  logEdgeDebugging(
    id,
    currentEdge.source,
    currentEdge.target,
    sourceNode?.type,
    targetNode?.type,
    currentEdge.type,
    data?.connectionType || currentEdge.data?.connectionType,
    labelForDebugging
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

  console.log('Edge label:', currentLabel);

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <EdgeLabel
          label={currentLabel}
          isInteractive={isYToWellConnection}
          onToggle={handleEdgeToggle}
          labelX={labelX}
          labelY={labelY}
        />
      </EdgeLabelRenderer>
    </>
  );
};

export default InteractiveCableEdge;
