
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
  validateEquipmentAvailability?: (equipmentId: string, jobId: string) => Promise<boolean>;
  allocateEquipment?: (equipmentId: string, jobId: string, jobName: string) => Promise<void>;
  releaseEquipment?: (equipmentId: string, jobId: string) => Promise<void>;
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
  validateEquipmentAvailability,
  allocateEquipment,
  releaseEquipment,
}: UseEquipmentSelectionProps) => {
  const { data } = useInventory();
  const { deployEquipment, returnEquipment } = useEquipmentDeployment();
  const { 
    updateShearstreamBoxNode, 
    updateStarlinkNode, 
    updateCustomerComputerNode,
    updateAllNodes 
  } = useEquipmentNodeUpdater();

  const handleEquipmentSelect = useCallback(async (
    type: 'shearstream-box' | 'starlink' | 'customer-computer', 
    equipmentId: string, 
    index?: number
  ) => {
    const equipment = data.individualEquipment.find(eq => eq.id === equipmentId);
    if (!equipment) return;

    // Use sync validation if available
    if (validateEquipmentAvailability) {
      const isAvailable = await validateEquipmentAvailability(equipmentId, job.id);
      if (!isAvailable) {
        // Validation failed, equipment is not available
        return;
      }
    }

    if (type === 'shearstream-box' && index !== undefined) {
      const newBoxes = [...selectedShearstreamBoxes];
      const previousEquipment = newBoxes[index];
      
      // Release previous equipment
      if (previousEquipment) {
        if (releaseEquipment) {
          await releaseEquipment(previousEquipment, job.id);
        } else {
          returnEquipment(previousEquipment);
        }
      }
      
      // Allocate new equipment
      newBoxes[index] = equipmentId;
      setSelectedShearstreamBoxes(newBoxes);
      
      if (allocateEquipment) {
        await allocateEquipment(equipmentId, job.id, job.name);
      } else {
        deployEquipment(equipmentId, job.id);
      }
      
      setNodes(nodes => updateShearstreamBoxNode(nodes, index, equipmentId));
    } else if (type === 'starlink') {
      // Release previous equipment
      if (selectedStarlink) {
        if (releaseEquipment) {
          await releaseEquipment(selectedStarlink, job.id);
        } else {
          returnEquipment(selectedStarlink);
        }
      }
      
      // Allocate new equipment
      setSelectedStarlink(equipmentId);
      
      if (allocateEquipment) {
        await allocateEquipment(equipmentId, job.id, job.name);
      } else {
        deployEquipment(equipmentId, job.id);
      }
      
      setNodes(nodes => updateStarlinkNode(nodes, equipmentId));
    } else if (type === 'customer-computer' && index !== undefined) {
      const newComputers = [...selectedCustomerComputers];
      const previousEquipment = newComputers[index];
      
      // Release previous equipment
      if (previousEquipment) {
        if (releaseEquipment) {
          await releaseEquipment(previousEquipment, job.id);
        } else {
          returnEquipment(previousEquipment);
        }
      }
      
      // Allocate new equipment
      newComputers[index] = equipmentId;
      setSelectedCustomerComputers(newComputers);
      
      if (allocateEquipment) {
        await allocateEquipment(equipmentId, job.id, job.name);
      } else {
        deployEquipment(equipmentId, job.id);
      }
      
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
    job.name,
    setNodes,
    setSelectedShearstreamBoxes,
    setSelectedStarlink,
    setSelectedCustomerComputers,
    updateShearstreamBoxNode,
    updateStarlinkNode,
    updateCustomerComputerNode,
    validateEquipmentAvailability,
    allocateEquipment,
    releaseEquipment
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
