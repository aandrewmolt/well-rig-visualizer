
import { useCallback } from 'react';
import { Connection, Edge, Node, addEdge } from '@xyflow/react';
import { toast } from 'sonner';

export const useDiagramConnections = (
  selectedCableType: '100ft' | '200ft' | '300ft',
  nodes: Node[],
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void
) => {
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
      
      // Handle cable connections with existing validation
      if (selectedCableType === '300ft') {
        // 300ft cables can only connect from main box to Y adapter
        if (sourceNode?.type === 'mainBox' && targetNode?.type !== 'yAdapter') {
          toast.error('300ft cables can only connect from Main Box to Y Adapters!');
          return;
        }
        if (sourceNode?.type !== 'mainBox' && sourceNode?.type !== 'yAdapter') {
          toast.error('300ft cables must originate from Main Box or Y Adapter!');
          return;
        }
      }

      const edge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'cable',
        data: { 
          cableType: selectedCableType,
          label: selectedCableType,
          connectionType: 'cable'
        },
        style: {
          stroke: selectedCableType === '100ft' ? '#ef4444' : 
                 selectedCableType === '200ft' ? '#3b82f6' : '#10b981',
          strokeWidth: 3,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
      toast.success(`${selectedCableType} cable connected!`);
    },
    [selectedCableType, setEdges, nodes]
  );

  return { onConnect };
};
