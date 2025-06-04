
import { useJobDiagramEquipment } from '@/hooks/useJobDiagramEquipment';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

interface UseJobDiagramEquipmentHandlersProps {
  job: Job;
  selectedShearstreamBoxes: string[];
  selectedStarlink: string;
  selectedCustomerComputers: string[];
  setSelectedShearstreamBoxes: (boxes: string[]) => void;
  setSelectedStarlink: (starlink: string) => void;
  setSelectedCustomerComputers: (computers: string[]) => void;
  setNodes: (updater: (nodes: any[]) => any[]) => void;
  updateMainBoxName: (nodeId: string, name: string, setNodes: (updater: (nodes: any[]) => any[]) => void) => void;
  updateSatelliteName: (name: string, setNodes: (updater: (nodes: any[]) => any[]) => void) => void;
  updateCustomerComputerName: (nodeId: string, name: string, setNodes: (updater: (nodes: any[]) => any[]) => void) => void;
  addShearstreamBox: () => void;
  removeShearstreamBox: (boxId: string) => void;
}

export const useJobDiagramEquipmentHandlers = ({
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
}: UseJobDiagramEquipmentHandlersProps) => {
  const {
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
  } = useJobDiagramEquipment({
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
  });

  return {
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
  };
};
