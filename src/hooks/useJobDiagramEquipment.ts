
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
  selectedCompanyComputers: string[];
  setSelectedShearstreamBoxes: (boxes: string[]) => void;
  setSelectedStarlink: (starlink: string) => void;
  setSelectedCompanyComputers: (computers: string[]) => void;
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  updateMainBoxName: (nodeId: string, name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => void;
  updateSatelliteName: (name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => void;
  updateCompanyComputerName: (nodeId: string, name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => void;
  addShearstreamBox: () => void;
  removeShearstreamBox: (boxId: string) => void;
}

export const useJobDiagramEquipment = ({
  job,
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCompanyComputers,
  setSelectedShearstreamBoxes,
  setSelectedStarlink,
  setSelectedCompanyComputers,
  setNodes,
  updateMainBoxName,
  updateSatelliteName,
  updateCompanyComputerName,
  addShearstreamBox,
  removeShearstreamBox,
}: UseJobDiagramEquipmentProps) => {
  const { trackedEquipment, deployEquipment, returnEquipment } = useTrackedEquipment();

  // Handle equipment selection - updated for multiple SS boxes
  const handleEquipmentSelect = useCallback((type: 'shearstream-box' | 'starlink' | 'company-computer', equipmentId: string, index?: number) => {
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
    } else if (type === 'company-computer' && index !== undefined) {
      const newComputers = [...selectedCompanyComputers];
      if (newComputers[index]) {
        returnEquipment(newComputers[index]);
      }
      newComputers[index] = equipmentId;
      setSelectedCompanyComputers(newComputers);
      deployEquipment(equipmentId, job.id, job.name, equipment.name);
      
      // Update computer node with standardized CC format
      const standardizedId = `CC-${equipment.equipmentId.padStart(3, '0')}`;
      updateCompanyComputerName(`company-computer-${index + 1}`, standardizedId, setNodes);
    }
  }, [
    trackedEquipment, 
    selectedShearstreamBoxes, 
    selectedStarlink, 
    selectedCompanyComputers, 
    returnEquipment, 
    deployEquipment, 
    job, 
    updateMainBoxName, 
    updateSatelliteName, 
    updateCompanyComputerName, 
    setNodes,
    setSelectedShearstreamBoxes,
    setSelectedStarlink,
    setSelectedCompanyComputers
  ]);

  // Handle adding/removing SS boxes
  const handleAddShearstreamBox = useCallback(() => {
    addShearstreamBox();
    setSelectedShearstreamBoxes(prev => [...prev, '']);
  }, [addShearstreamBox, setSelectedShearstreamBoxes]);

  const handleRemoveShearstreamBox = useCallback((index: number) => {
    // Return equipment if assigned
    if (selectedShearstreamBoxes[index]) {
      returnEquipment(selectedShearstreamBoxes[index]);
    }
    
    // Remove the node
    const boxNodeId = index === 0 ? 'main-box' : `main-box-${index + 1}`;
    removeShearstreamBox(boxNodeId);
    
    // Update selected boxes array
    setSelectedShearstreamBoxes(prev => prev.filter((_, i) => i !== index));
  }, [selectedShearstreamBoxes, returnEquipment, removeShearstreamBox, setSelectedShearstreamBoxes]);

  return {
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
  };
};
