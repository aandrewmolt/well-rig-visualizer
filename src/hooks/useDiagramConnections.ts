
import { useCallback } from 'react';
import { Connection, Edge, Node, addEdge } from '@xyflow/react';
import { toast } from 'sonner';
import { useInventoryData } from '@/hooks/useInventoryData';

export const useDiagramConnections = (
  selectedCableType: string,
  nodes: Node[],
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void
) => {
  const { data } = useInventoryData();

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      // Check if this is a direct connection (Y adapter to well/wellside gauge)
      const isDirectConnection = sourceNode?.type === 'yAdapter' && 
        (targetNode?.type === 'well' || targetNode?.type === 'wellsideGauge');
      
      if (isDirectConnection) {
        // Create direct connection without cable type validation
        const edge: Edge = {
          ...params,
          id: `edge-${Date.now()}`,
          type: 'direct',
          data: { 
            connectionType: 'direct',
            label: 'Direct'
          },
          style: {
            stroke: '#8b5cf6',
            strokeWidth: 4,
            strokeDasharray: '5,5',
          },
        };
        setEdges((eds) => addEdge(edge, eds));
        toast.success('Direct connection established!');
        return;
      }
      
      // Get cable type information from inventory
      const cableType = data.equipmentTypes.find(type => type.id === selectedCableType);
      if (!cableType) {
        toast.error('Please select a cable type first!');
        return;
      }

      // Handle cable connections - for now, we'll use the cable name to determine connection rules
      // This is a simplified approach - you might want more sophisticated rules based on cable properties
      const cableName = cableType.name.toLowerCase();
      
      // Simple rule: if cable name contains "300ft" or "reel", it can only connect from main box to Y adapter
      if (cableName.includes('300ft') || cableName.includes('reel')) {
        if (sourceNode?.type === 'mainBox' && targetNode?.type !== 'yAdapter') {
          toast.error(`${cableType.name} can only connect from Main Box to Y Adapters!`);
          return;
        }
        if (sourceNode?.type !== 'mainBox' && sourceNode?.type !== 'yAdapter') {
          toast.error(`${cableType.name} must originate from Main Box or Y Adapter!`);
          return;
        }
      }

      // Create cable connection edge with dynamic styling based on cable type
      const getEdgeColor = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('100ft')) return '#ef4444'; // Red
        if (lowerName.includes('200ft')) return '#3b82f6'; // Blue
        if (lowerName.includes('300ft')) return '#10b981'; // Green
        return '#6b7280'; // Default gray
      };

      const edge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'cable',
        data: { 
          cableType: selectedCableType,
          cableTypeId: selectedCableType,
          label: cableType.name,
          connectionType: 'cable'
        },
        style: {
          stroke: getEdgeColor(cableType.name),
          strokeWidth: 3,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
      toast.success(`${cableType.name} connected!`);
    },
    [selectedCableType, setEdges, nodes, data.equipmentTypes]
  );

  return { onConnect };
};
