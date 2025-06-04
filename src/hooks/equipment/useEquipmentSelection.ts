
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useEquipmentDeployment } from './useEquipmentDeployment';
import { useEquipmentNodeUpdater } from './useEquipmentNodeUpdater';
import { useInventory } from '@/contexts/InventoryContext';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

interface UseEquipmentSelectionProps {
  job: Job;
  selectedShearstreamBoxes: string[];
  selectedStarlink: string;
  selectedCustomerComputers: string[];
  setSelectedShearstreamBoxes: (boxes: string[]) => void;
  setSelectedStarlink: (starlink: string) => void;
  setSelectedCustomerComputers: (computers: string[]) => void;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
}

export const useEquipmentSelection = ({
  job,
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCustomerComputers,
  setSelectedShearstreamBoxes,
  setSelectedStarlink,
  setSelectedCustomerComputers,
  setNodes,
}: UseEquipmentSelectionProps) => {
  const { data } = useInventory();
  const { deployEquipment, returnEquipment } = useEquipmentDeployment();
  const { 
    updateShearstreamBoxNode, 
    updateStarlinkNode, 
    updateCustomerComputerNode,
    updateAllNodes 
  } = useEquipmentNodeUpdater();

  const handleEquipmentSelect = useCallback((
    type: 'shearstream-box' | 'starlink' | 'customer-computer', 
    equipmentId: string, 
    index?: number
  ) => {
    const equipment = data.individualEquipment.find(eq => eq.id === equipmentId);
    if (!equipment) return;

    if (type === 'shearstream-box' && index !== undefined) {
      const newBoxes = [...selectedShearstreamBoxes];
      if (newBoxes[index]) {
        returnEquipment(newBoxes[index]);
      }
      newBoxes[index] = equipmentId;
      setSelectedShearstreamBoxes(newBoxes);
      deployEquipment(equipmentId, job.id);
      
      setNodes(nodes => updateShearstreamBoxNode(nodes, index, equipmentId));
    } else if (type === 'starlink') {
      if (selectedStarlink) {
        returnEquipment(selectedStarlink);
      }
      setSelectedStarlink(equipmentId);
      deployEquipment(equipmentId, job.id);
      setNodes(nodes => updateStarlinkNode(nodes, equipmentId));
    } else if (type === 'customer-computer' && index !== undefined) {
      const newComputers = [...selectedCustomerComputers];
      if (newComputers[index]) {
        returnEquipment(newComputers[index]);
      }
      newComputers[index] = equipmentId;
      setSelectedCustomerComputers(newComputers);
      deployEquipment(equipmentId, job.id);
      
      setNodes(nodes => updateCustomerComputerNode(nodes, index, equipmentId));
    }
  }, [
    data.individualEquipment,
    selectedShearstreamBoxes, 
    selectedStarlink, 
    selectedCustomerComputers, 
    returnEquipment, 
    deployEquipment, 
    job.id, 
    setNodes,
    setSelectedShearstreamBoxes,
    setSelectedStarlink,
    setSelectedCustomerComputers,
    updateShearstreamBoxNode,
    updateStarlinkNode,
    updateCustomerComputerNode
  ]);

  const handleEquipmentAssignment = useCallback((assignments: {
    shearstreamBoxes: string[];
    starlink?: string;
    customerComputers: string[];
  }) => {
    // Deploy all selected equipment
    [...assignments.shearstreamBoxes, ...(assignments.starlink ? [assignments.starlink] : []), ...assignments.customerComputers]
      .forEach(equipmentId => {
        if (equipmentId) {
          deployEquipment(equipmentId, job.id);
        }
      });

    // Update state
    setSelectedShearstreamBoxes(assignments.shearstreamBoxes);
    if (assignments.starlink) {
      setSelectedStarlink(assignments.starlink);
    }
    setSelectedCustomerComputers(assignments.customerComputers);

    // Update node labels with equipment IDs
    setNodes(nodes => updateAllNodes(nodes, assignments));
  }, [
    job.id, 
    deployEquipment, 
    setSelectedShearstreamBoxes, 
    setSelectedStarlink, 
    setSelectedCustomerComputers, 
    setNodes, 
    updateAllNodes
  ]);

  return {
    handleEquipmentSelect,
    handleEquipmentAssignment,
  };
};
