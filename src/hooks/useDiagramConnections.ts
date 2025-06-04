
import { useCallback } from 'react';
import { Connection, addEdge, Node } from '@xyflow/react';
import { useInventoryData } from './useInventoryData';
import { useCableTypeService } from './cables/useCableTypeService';

export const useDiagramConnections = (
  selectedCableType: string,
  nodes: Node[],
  setEdges: (updater: (edges: any[]) => any[]) => void
) => {
  const { data } = useInventoryData();
  const { getCableColor, getCableDisplayName } = useCableTypeService(data.equipmentTypes);

  const onConnect = useCallback(
    (params: Connection) => {
      // Get source and target nodes
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (!sourceNode || !targetNode) return;

      // Determine connection type
      let connectionType = 'cable';
      let edgeData: any = {
        cableTypeId: selectedCableType,
        label: getCableDisplayName(selectedCableType),
        connectionType: 'cable'
      };

      // Check for direct connections (satellite to shearstream box)
      const isDirectConnection = (
        (sourceNode.type === 'satellite' && targetNode.type === 'mainBox') ||
        (sourceNode.type === 'mainBox' && targetNode.type === 'satellite') ||
        (sourceNode.type === 'satellite' && targetNode.type === 'shearstreamBox') ||
        (sourceNode.type === 'shearstreamBox' && targetNode.type === 'satellite')
      );

      if (isDirectConnection) {
        connectionType = 'direct';
        edgeData = {
          connectionType: 'direct',
          label: 'Direct Connection'
        };
      }

      // Create edge with proper styling
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: connectionType === 'direct' ? 'smoothstep' : 'cable',
        data: edgeData,
        style: {
          stroke: connectionType === 'direct' ? '#10b981' : getCableColor(selectedCableType),
          strokeWidth: 3,
        },
        animated: connectionType === 'direct',
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [selectedCableType, nodes, setEdges, getCableColor, getCableDisplayName]
  );

  return { onConnect };
};
