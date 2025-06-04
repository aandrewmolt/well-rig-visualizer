
import { Node } from '@xyflow/react';
import { useEquipmentSelection } from './equipment/useEquipmentSelection';
import { useShearstreamBoxManagement } from './equipment/useShearstreamBoxManagement';
import { useEquipmentDeployment } from './equipment/useEquipmentDeployment';

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
  const { deployEquipment, returnEquipment } = useEquipmentDeployment();

  const {
    handleEquipmentSelect,
    handleEquipmentAssignment,
  } = useEquipmentSelection({
    job,
    selectedShearstreamBoxes,
    selectedStarlink,
    selectedCustomerComputers,
    setSelectedShearstreamBoxes,
    setSelectedStarlink,
    setSelectedCustomerComputers,
    setNodes,
  });

  const {
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
  } = useShearstreamBoxManagement({
    selectedShearstreamBoxes,
    setSelectedShearstreamBoxes,
    addShearstreamBox,
    removeShearstreamBox,
    returnEquipment,
  });

  return {
    handleEquipmentSelect,
    handleEquipmentAssignment,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
    deployEquipment,
    returnEquipment,
  };
};
