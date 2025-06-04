
import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { useDiagramState } from './useDiagramState';
import { useInventoryData } from './useInventoryData';

export const useJobDiagramState = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { data: inventoryData } = useInventoryData();

  // Equipment assignment state - updated for multiple SS boxes
  const [selectedShearstreamBoxes, setSelectedShearstreamBoxes] = useState<string[]>([]);
  const [selectedStarlink, setSelectedStarlink] = useState<string>('');
  const [selectedCustomerComputers, setSelectedCustomerComputers] = useState<string[]>([]);

  const diagramState = useDiagramState();

  // Initialize selectedCableType with first available cable if not set
  const initializeCableType = useCallback(() => {
    if (!diagramState.selectedCableType && inventoryData.equipmentTypes.length > 0) {
      const firstAvailableCable = inventoryData.equipmentTypes
        .filter(type => type.category === 'cables')
        .find(cableType => {
          const availableItems = inventoryData.equipmentItems
            .filter(item => 
              item.typeId === cableType.id && 
              item.status === 'available' && 
              item.quantity > 0
            );
          return availableItems.length > 0;
        });
      
      if (firstAvailableCable) {
        diagramState.setSelectedCableType(firstAvailableCable.id);
      }
    }
  }, [diagramState.selectedCableType, diagramState.setSelectedCableType, inventoryData]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    selectedShearstreamBoxes,
    setSelectedShearstreamBoxes,
    selectedStarlink,
    setSelectedStarlink,
    selectedCustomerComputers,
    setSelectedCustomerComputers,
    initializeCableType,
    ...diagramState,
  };
};
