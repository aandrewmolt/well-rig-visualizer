import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';

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
  const { data, updateIndividualEquipment } = useInventory();

  // Get available equipment from inventory
  const getAvailableEquipment = useCallback((typePrefix: string) => {
    return data.individualEquipment.filter(eq => 
      eq.equipmentId.startsWith(typePrefix) && 
      eq.status === 'available'
    );
  }, [data.individualEquipment]);

  const deployEquipment = useCallback(async (equipmentId: string, jobId: string) => {
    try {
      await updateIndividualEquipment(equipmentId, { 
        status: 'deployed',
        jobId: jobId
      });
      toast.success(`Equipment ${equipmentId} deployed to job`);
    } catch (error) {
      console.error('Failed to deploy equipment:', error);
      toast.error('Failed to deploy equipment');
    }
  }, [updateIndividualEquipment]);

  const returnEquipment = useCallback(async (equipmentId: string) => {
    try {
      await updateIndividualEquipment(equipmentId, { 
        status: 'available',
        jobId: null
      });
      toast.success(`Equipment ${equipmentId} returned to inventory`);
    } catch (error) {
      console.error('Failed to return equipment:', error);
      toast.error('Failed to return equipment');
    }
  }, [updateIndividualEquipment]);

  // Handle equipment selection - updated for customer computers
  const handleEquipmentSelect = useCallback((type: 'shearstream-box' | 'starlink' | 'customer-computer', equipmentId: string, index?: number) => {
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
      
      // Update the specific SS box node with standardized format
      const boxNodeId = index === 0 ? 'main-box' : `main-box-${index + 1}`;
      updateMainBoxName(boxNodeId, equipment.equipmentId, setNodes);
    } else if (type === 'starlink') {
      if (selectedStarlink) {
        returnEquipment(selectedStarlink);
      }
      setSelectedStarlink(equipmentId);
      deployEquipment(equipmentId, job.id);
      updateSatelliteName(equipment.equipmentId, setNodes);
    } else if (type === 'customer-computer' && index !== undefined) {
      const newComputers = [...selectedCustomerComputers];
      if (newComputers[index]) {
        returnEquipment(newComputers[index]);
      }
      newComputers[index] = equipmentId;
      setSelectedCustomerComputers(newComputers);
      deployEquipment(equipmentId, job.id);
      
      // Keep the original ID format
      updateCustomerComputerName(`customer-computer-${index + 1}`, equipment.equipmentId, setNodes);
      
      // Update the node data to include isTablet flag
      const isTablet = equipment.equipmentId.startsWith('CT');
      setNodes(nodes => 
        nodes.map(node => 
          node.id === `customer-computer-${index + 1}`
            ? { ...node, data: { ...node.data, isTablet, equipmentId: equipment.equipmentId }}
            : node
        )
      );
    }
  }, [
    data.individualEquipment,
    selectedShearstreamBoxes, 
    selectedStarlink, 
    selectedCustomerComputers, 
    returnEquipment, 
    deployEquipment, 
    job.id, 
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
    getAvailableEquipment,
    deployEquipment,
    returnEquipment,
  };
};
