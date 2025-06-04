
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useTrackedEquipment } from './useTrackedEquipment';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

interface UseJobDiagramEquipmentProps {
  job: Job;
  selectedShearstreamBoxes: string[];
  selectedStarlink: string;
  selectedCustomerComputers: string[];
  setSelectedShearstreamBoxes: (boxes: string[]) => void;
  setSelectedStarlink: (starlink: string) => void;
  setSelectedCustomerComputers: (computers: string[]) => void;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  updateMainBoxName: (nodeId: string, name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => void;
  updateSatelliteName: (name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => void;
  updateCustomerComputerName: (nodeId: string, name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => void;
  addShearstreamBox: () => void;
  removeShearstreamBox: (boxId: string) => void;
}

export const useJobDiagramEquipment = ({
  job,
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCustomerComputers,
  setSelectedShearstreamBoxes,
  setSelectedStarlink,
  setSelectedCustomerComputers,
  setNodes,
  updateMainBoxName,
  updateSatelliteName,
  updateCustomerComputerName,
  addShearstreamBox,
  removeShearstreamBox,
}: UseJobDiagramEquipmentProps) => {
  const { trackedEquipment, deployEquipment, returnEquipment } = useTrackedEquipment();

  // Handle equipment selection - updated for customer computers
  const handleEquipmentSelect = useCallback((type: 'shearstream-box' | 'starlink' | 'customer-computer', equipmentId: string, index?: number) => {
    const equipment = trackedEquipment.find(eq => eq.id === equipmentId);
    if (!equipment) return;

    if (type === 'shearstream-box' && index !== undefined) {
      const newBoxes = [...selectedShearstreamBoxes];
      if (newBoxes[index]) {
        returnEquipment(newBoxes[index]);
      }
      newBoxes[index] = equipmentId;
      setSelectedShearstreamBoxes(newBoxes);
      deployEquipment(equipmentId, job.id, job.name, equipment.name);
      
      // Update the specific SS box node with standardized format
      const boxNodeId = index === 0 ? 'main-box' : `main-box-${index + 1}`;
      const standardizedId = `SS-${equipment.equipmentId.padStart(3, '0')}`;
      updateMainBoxName(boxNodeId, standardizedId, setNodes);
    } else if (type === 'starlink') {
      if (selectedStarlink) {
        returnEquipment(selectedStarlink);
      }
      setSelectedStarlink(equipmentId);
      deployEquipment(equipmentId, job.id, job.name, equipment.name);
      updateSatelliteName(equipment.equipmentId, setNodes);
    } else if (type === 'customer-computer' && index !== undefined) {
      const newComputers = [...selectedCustomerComputers];
      if (newComputers[index]) {
        returnEquipment(newComputers[index]);
      }
      newComputers[index] = equipmentId;
      setSelectedCustomerComputers(newComputers);
      deployEquipment(equipmentId, job.id, job.name, equipment.name);
      
      // Keep the original ID prefix (CC or CT)
      const prefix = equipment.equipmentId.startsWith('CT') ? 'CT' : 'CC';
      const equipmentNumber = equipment.equipmentId.replace(/^\D+/g, '');
      const standardizedId = `${prefix}-${equipmentNumber.padStart(3, '0')}`;
      
      // Pass isTablet info to the node
      updateCustomerComputerName(`customer-computer-${index + 1}`, standardizedId, setNodes);
      
      // Update the node data to include isTablet flag
      setNodes(nodes => 
        nodes.map(node => 
          node.id === `customer-computer-${index + 1}`
            ? { ...node, data: { ...node.data, isTablet: prefix === 'CT', equipmentId: standardizedId }}
            : node
        )
      );
    }
  }, [
    trackedEquipment, 
    selectedShearstreamBoxes, 
    selectedStarlink, 
    selectedCustomerComputers, 
    returnEquipment, 
    deployEquipment, 
    job, 
    updateMainBoxName, 
    updateSatelliteName, 
    updateCustomerComputerName, 
    setNodes,
    setSelectedShearstreamBoxes,
    setSelectedStarlink,
    setSelectedCustomerComputers
  ]);

  // Handle adding/removing SS boxes
  const handleAddShearstreamBox = useCallback(() => {
    addShearstreamBox();
    const newBoxes = [...selectedShearstreamBoxes, ''];
    setSelectedShearstreamBoxes(newBoxes);
  }, [addShearstreamBox, selectedShearstreamBoxes, setSelectedShearstreamBoxes]);

  const handleRemoveShearstreamBox = useCallback((index: number) => {
    // Return equipment if assigned
    if (selectedShearstreamBoxes[index]) {
      returnEquipment(selectedShearstreamBoxes[index]);
    }
    
    // Remove the node
    const boxNodeId = index === 0 ? 'main-box' : `main-box-${index + 1}`;
    removeShearstreamBox(boxNodeId);
    
    // Update selected boxes array
    const newBoxes = selectedShearstreamBoxes.filter((_, i) => i !== index);
    setSelectedShearstreamBoxes(newBoxes);
  }, [selectedShearstreamBoxes, returnEquipment, removeShearstreamBox, setSelectedShearstreamBoxes]);

  return {
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
  };
};
