
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
  selectedCompanyComputers: string[];
  setSelectedShearstreamBoxes: (boxes: string[]) => void;
  setSelectedStarlink: (starlink: string) => void;
  setSelectedCompanyComputers: (computers: string[]) => void;
  setNodes: (updater: (nodes: any[]) => any[]) => void;
  updateMainBoxName: (nodeId: string, name: string, setNodes: (updater: (nodes: any[]) => any[]) => void) => void;
  updateSatelliteName: (name: string, setNodes: (updater: (nodes: any[]) => any[]) => void) => void;
  updateCompanyComputerName: (nodeId: string, name: string, setNodes: (updater: (nodes: any[]) => any[]) => void) => void;
  addShearstreamBox: () => void;
  removeShearstreamBox: (boxId: string) => void;
}

export const useJobDiagramEquipmentHandlers = ({
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
}: UseJobDiagramEquipmentHandlersProps) => {
  const {
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
  } = useJobDiagramEquipment({
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
  });

  return {
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
  };
};
