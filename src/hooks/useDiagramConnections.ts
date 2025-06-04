
import { useCallback } from 'react';
import { Connection, addEdge, Node } from '@xyflow/react';
import { useInventoryData } from './useInventoryData';
import { useCableTypeService } from './cables/useCableTypeService';
import { useCableConnectionValidator } from './equipment/useCableConnectionValidator';
import { migrateCableTypeId } from '@/utils/cableTypeMigration';
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

      console.log('Connecting:', {
        source: sourceNode.type,
        target: targetNode.type,
        sourceId: params.source,
        targetId: params.target,
        selectedCableType
      });

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
          type: 'direct',
          label: 'Direct Connection',
          data: {
            connectionType: 'direct',
            label: 'Direct Connection'
          },
          style: {
            stroke: '#10b981',
            strokeWidth: 3,
            strokeDasharray: '5,5',
          },
          animated: true,
        };

        console.log('Creating direct connection:', newEdge);
        setEdges((eds) => addEdge(newEdge, eds));
        toast.success('Direct connection established');
        return;
      }

      // For cable connections, migrate cable type ID first
      const migratedCableType = selectedCableType ? migrateCableTypeId(selectedCableType) : '';
      
      // Validate connection
      const validation = validateConnection(sourceNode, targetNode, migratedCableType);
      
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

      // Determine cable type and label
      let cableLabel = 'Cable';
      let cableColor = '#374151';
      
      if (migratedCableType && migratedCableType !== '') {
        cableLabel = getCableDisplayName(migratedCableType);
        cableColor = getCableColor(migratedCableType);
      } else {
        // Default cable types based on connection
        if (sourceNode.type === 'mainBox' || targetNode.type === 'mainBox') {
          if (targetNode.type === 'yAdapter' || sourceNode.type === 'yAdapter') {
            cableLabel = '300ft Cable (Old)';
            cableColor = '#6b7280';
          } else if (targetNode.type === 'wellsideGauge' || sourceNode.type === 'wellsideGauge') {
            cableLabel = '200ft Cable';
            cableColor = '#f59e0b';
          }
        } else if (sourceNode.type === 'yAdapter' || targetNode.type === 'yAdapter') {
          cableLabel = '100ft Cable';
          cableColor = '#3b82f6';
        }
      }

      // Create valid cable connection
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'cable',
        label: cableLabel,
        data: {
          cableTypeId: migratedCableType, // Store the migrated cable type ID
          label: cableLabel,
          connectionType: 'cable'
        },
        style: {
          stroke: cableColor,
          strokeWidth: 3,
        },
      };

      console.log('Creating cable connection:', newEdge);
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success(`Connected with ${cableLabel}`);
    },
    [selectedCableType, nodes, setEdges, getCableColor, getCableDisplayName, validateConnection, getValidCablesForConnection]
  );

  return { onConnect };
};
