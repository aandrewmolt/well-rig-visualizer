
import { useCallback } from 'react';
import { Connection, addEdge, Node } from '@xyflow/react';
import { useInventoryData } from './useInventoryData';
import { useCableTypeService } from './cables/useCableTypeService';
import { useCableConnectionValidator } from './equipment/useCableConnectionValidator';
import { toast } from 'sonner';

export const useDiagramConnections = (
  selectedCableType: string,
  nodes: Node[],
  setEdges: (updater: (edges: any[]) => any[]) => void
) => {
  const { data } = useInventoryData();
  const { getCableColor, getCableDisplayName } = useCableTypeService(data.equipmentTypes);
  const { validateConnection, getValidCablesForConnection } = useCableConnectionValidator();

  const onConnect = useCallback(
    (params: Connection) => {
      // Get source and target nodes
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (!sourceNode || !targetNode) return;

      // Check for direct connections (satellite to shearstream box)
      const isDirectConnection = (
        (sourceNode.type === 'satellite' && targetNode.type === 'mainBox') ||
        (sourceNode.type === 'mainBox' && targetNode.type === 'satellite') ||
        (sourceNode.type === 'satellite' && targetNode.type === 'shearstreamBox') ||
        (sourceNode.type === 'shearstreamBox' && targetNode.type === 'satellite')
      );

      if (isDirectConnection) {
        // Create direct connection
        const newEdge = {
          ...params,
          id: `edge-${params.source}-${params.target}-${Date.now()}`,
          type: 'smoothstep',
          data: {
            connectionType: 'direct',
            label: 'Direct Connection'
          },
          style: {
            stroke: '#10b981',
            strokeWidth: 3,
          },
          animated: true,
        };

        setEdges((eds) => addEdge(newEdge, eds));
        return;
      }

      // For cable connections, validate first
      const validation = validateConnection(sourceNode, targetNode, selectedCableType);
      
      if (!validation.isValid) {
        toast.error(`Invalid connection: ${validation.reason}`);
        
        // Show valid alternatives if available
        const validCables = getValidCablesForConnection(sourceNode, targetNode);
        if (validCables.length > 0) {
          const validNames = validCables.map(c => c.cableName).join(', ');
          toast.info(`Valid cables for this connection: ${validNames}`);
        }
        return;
      }

      // Create valid cable connection
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'cable',
        data: {
          cableTypeId: selectedCableType,
          label: getCableDisplayName(selectedCableType),
          connectionType: 'cable'
        },
        style: {
          stroke: getCableColor(selectedCableType),
          strokeWidth: 3,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      toast.success(`Connected with ${getCableDisplayName(selectedCableType)}`);
    },
    [selectedCableType, nodes, setEdges, getCableColor, getCableDisplayName, validateConnection, getValidCablesForConnection]
  );

  return { onConnect };
};
