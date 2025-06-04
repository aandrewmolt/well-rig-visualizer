import { useReactFlow } from '@xyflow/react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCableTypeService } from '@/hooks/cables/useCableTypeService';

export const useDirectEdgeLogic = (id: string) => {
  const { setEdges, getNodes } = useReactFlow();
  const { data: inventoryData } = useInventoryData();
  const { getCableColor, getCableDisplayName } = useCableTypeService(inventoryData.equipmentTypes);

  const handleDelete = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const handleDirectClick = () => {
    const nodes = getNodes();
    const currentEdge = null; // We'll get this from the edges in setEdges
    
    setEdges((edges) => {
      const edge = edges.find(e => e.id === id);
      if (!edge) return edges;

      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      // Check if this is a Y adapter to well connection
      const isYToWellConnection = (
        (sourceNode?.type === 'yAdapter' && targetNode?.type === 'well') ||
        (sourceNode?.type === 'well' && targetNode?.type === 'yAdapter')
      );

      if (isYToWellConnection) {
        // For Y→Well connections, toggle between Direct and 100ft cable
        const is100ftCable = inventoryData.equipmentTypes.find(type => 
          type.id === edge.data?.cableTypeId && type.name.toLowerCase().includes('100ft')
        );

        if (edge.data?.connectionType === 'direct' || (!edge.data?.cableTypeId && edge.type === 'direct')) {
          // Switch from Direct to 100ft cable
          const cable100ft = inventoryData.equipmentTypes.find(type => 
            type.category === 'cables' && type.name.toLowerCase().includes('100ft')
          );

          if (cable100ft) {
            return edges.map((e) => {
              if (e.id === id) {
                return {
                  ...e,
                  type: 'cable',
                  data: {
                    ...e.data,
                    connectionType: 'cable',
                    cableTypeId: cable100ft.id,
                    label: getCableDisplayName(cable100ft.id)
                  },
                  style: {
                    stroke: getCableColor(cable100ft.id),
                    strokeWidth: 3,
                    strokeDasharray: undefined,
                  },
                  animated: false,
                };
              }
              return e;
            });
          }
        } else if (is100ftCable) {
          // Switch from 100ft cable to Direct
          return edges.map((e) => {
            if (e.id === id) {
              return {
                ...e,
                type: 'direct',
                data: {
                  ...e.data,
                  connectionType: 'direct',
                  cableTypeId: undefined,
                  label: 'Direct Connection'
                },
                style: {
                  stroke: '#8b5cf6',
                  strokeWidth: 4,
                  strokeDasharray: '5,5',
                },
                animated: true,
              };
            }
            return e;
          });
        }
      } else {
        // For other connections, use the first available cable
        const availableCables = inventoryData.equipmentTypes.filter(type => 
          type.category === 'cables'
        );

        const sortedCables = availableCables.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          if (aName.includes('100ft')) return -1;
          if (bName.includes('100ft')) return 1;
          if (aName.includes('200ft')) return -1;
          if (bName.includes('200ft')) return 1;
          if (aName.includes('300ft')) return -1;
          if (bName.includes('300ft')) return 1;
          
          return 0;
        });

        const firstAvailableCable = sortedCables[0];

        if (firstAvailableCable) {
          return edges.map((e) => {
            if (e.id === id) {
              return {
                ...e,
                type: 'cable',
                data: {
                  ...e.data,
                  connectionType: 'cable',
                  cableTypeId: firstAvailableCable.id,
                  label: getCableDisplayName(firstAvailableCable.id)
                },
                style: {
                  stroke: getCableColor(firstAvailableCable.id),
                  strokeWidth: 3,
                  strokeDasharray: undefined,
                },
                animated: false,
              };
            }
            return e;
          });
        }
      }

      return edges;
    });
  };

  const handleUpdateConnection = (
    newSourceId: string, 
    newTargetId: string, 
    newSourceHandle?: string, 
    newTargetHandle?: string,
    connectionType?: string,
    cableTypeId?: string
  ) => {
    setEdges((edges) => 
      edges.map((edge) => {
        if (edge.id === id) {
          if (connectionType === 'cable' && cableTypeId) {
            // Convert to cable edge
            return {
              ...edge,
              source: newSourceId,
              target: newTargetId,
              sourceHandle: newSourceHandle,
              targetHandle: newTargetHandle,
              type: 'cable',
              data: {
                ...edge.data,
                connectionType: 'cable',
                cableTypeId,
                label: getCableDisplayName(cableTypeId)
              },
              style: {
                stroke: getCableColor(cableTypeId),
                strokeWidth: 3,
                strokeDasharray: undefined,
              },
              animated: false,
            };
          } else {
            // Keep as direct connection
            return {
              ...edge,
              source: newSourceId,
              target: newTargetId,
              sourceHandle: newSourceHandle,
              targetHandle: newTargetHandle,
              type: 'direct',
              data: {
                ...edge.data,
                connectionType: 'direct',
                label: 'Direct Connection'
              },
              style: {
                stroke: '#8b5cf6',
                strokeWidth: 4,
                strokeDasharray: '5,5',
              },
              animated: true,
            };
          }
        }
        return edge;
      })
    );
  };

  return {
    handleDelete,
    handleDirectClick,
    handleUpdateConnection
  };
};
