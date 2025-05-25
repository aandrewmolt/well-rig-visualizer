
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

      // Y Adapters can connect directly to wells without cable type restrictions
      if (sourceNode?.type === 'yAdapter') {
        // Allow direct connection from Y adapter to wells or wellside gauge
        if (targetNode?.type === 'well' || targetNode?.type === 'wellsideGauge') {
          // No cable type validation needed for Y adapter direct connections
        }
      }

      const edge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'cable',
        data: { 
          cableType: selectedCableType,
          label: selectedCableType
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
