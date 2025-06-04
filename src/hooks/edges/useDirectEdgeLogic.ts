import { useReactFlow } from '@xyflow/react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useCableTypeService } from '@/hooks/cables/useCableTypeService';

export const useDirectEdgeLogic = (id: string) => {
  const { setEdges } = useReactFlow();
  const { data: inventoryData } = useInventoryData();
  const { getCableColor, getCableDisplayName } = useCableTypeService(inventoryData.equipmentTypes);

  const handleDelete = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const handleDirectClick = () => {
    // Find the first available cable (prioritize shorter ones first)
    const availableCables = inventoryData.equipmentTypes.filter(type => 
      type.category === 'cables'
    );

    // Sort by preference: 100ft first, then 200ft, then 300ft, then others
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
      // Switch to cable connection with the first available cable
      setEdges((edges) => 
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              type: 'cable',
              data: {
                ...edge.data,
                connectionType: 'cable',
                cableTypeId: firstAvailableCable.id,
                label: getCableDisplayName(firstAvailableCable.id)
              },
              style: {
                stroke: getCableColor(firstAvailableCable.id),
                strokeWidth: 3,
                strokeDasharray: undefined,
              }
            };
          }
          return edge;
        })
      );
    }
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
                label: 'Cable'
              },
              style: {
                stroke: getCableColor(cableTypeId),
                strokeWidth: 3,
                strokeDasharray: undefined,
              }
            };
          } else {
            // Keep as direct connection
            return {
              ...edge,
              source: newSourceId,
              target: newTargetId,
              sourceHandle: newSourceHandle,
              targetHandle: newTargetHandle,
              data: {
                ...edge.data,
                connectionType: 'direct'
              }
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
