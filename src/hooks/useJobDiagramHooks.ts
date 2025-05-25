
import { useRobustEquipmentTracking } from '@/hooks/useRobustEquipmentTracking';
import { useJobDiagramCore } from '@/hooks/useJobDiagramCore';
import { useJobDiagramActions } from '@/hooks/useJobDiagramActions';
import { useJobDiagramEquipmentHandlers } from '@/hooks/useJobDiagramEquipmentHandlers';
import { useJobDiagramSave } from '@/hooks/useJobDiagramSave';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

export const useJobDiagramHooks = (job: Job) => {
  // Core state and initialization
  const coreData = useJobDiagramCore(job);

  // Equipment tracking
  const {
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
  } = useRobustEquipmentTracking(job.id, coreData.nodes, coreData.edges);

  // Actions
  const actions = useJobDiagramActions({
    job,
    nodeIdCounter: coreData.nodeIdCounter,
    setNodeIdCounter: coreData.setNodeIdCounter,
    setNodes: coreData.setNodes,
    setEdges: coreData.setEdges,
    setIsInitialized: coreData.setIsInitialized,
    initializeJob: coreData.initializeJob,
    reactFlowWrapper: coreData.reactFlowWrapper,
  });

  // Equipment handlers
  const equipmentHandlers = useJobDiagramEquipmentHandlers({
    job,
    selectedShearstreamBoxes: coreData.selectedShearstreamBoxes,
    selectedStarlink: coreData.selectedStarlink,
    selectedCompanyComputers: coreData.selectedCompanyComputers,
    setSelectedShearstreamBoxes: coreData.setSelectedShearstreamBoxes,
    setSelectedStarlink: coreData.setSelectedStarlink,
    setSelectedCompanyComputers: coreData.setSelectedCompanyComputers,
    setNodes: coreData.setNodes,
    updateMainBoxName: coreData.updateMainBoxName,
    updateSatelliteName: coreData.updateSatelliteName,
    updateCompanyComputerName: coreData.updateCompanyComputerName,
    addShearstreamBox: actions.addShearstreamBox,
    removeShearstreamBox: actions.removeShearstreamBox,
  });

  // Save functionality
  useJobDiagramSave({
    job,
    nodes: coreData.nodes,
    edges: coreData.edges,
    isInitialized: coreData.isInitialized,
    mainBoxName: coreData.mainBoxName,
    satelliteName: coreData.satelliteName,
    wellsideGaugeName: coreData.wellsideGaugeName,
    companyComputerNames: coreData.companyComputerNames,
    selectedCableType: coreData.selectedCableType,
    selectedShearstreamBoxes: coreData.selectedShearstreamBoxes,
    selectedStarlink: coreData.selectedStarlink,
    selectedCompanyComputers: coreData.selectedCompanyComputers,
  });

  return {
    reactFlowWrapper: coreData.reactFlowWrapper,
    // State
    nodes: coreData.nodes,
    edges: coreData.edges,
    onNodesChange: coreData.onNodesChange,
    onEdgesChange: coreData.onEdgesChange,
    onConnect: coreData.onConnect,
    selectedCableType: coreData.selectedCableType,
    setSelectedCableType: coreData.setSelectedCableType,
    selectedShearstreamBoxes: coreData.selectedShearstreamBoxes,
    selectedStarlink: coreData.selectedStarlink,
    selectedCompanyComputers: coreData.selectedCompanyComputers,
    // Actions
    handleEquipmentSelect: equipmentHandlers.handleEquipmentSelect,
    handleAddShearstreamBox: equipmentHandlers.handleAddShearstreamBox,
    handleRemoveShearstreamBox: equipmentHandlers.handleRemoveShearstreamBox,
    addYAdapter: actions.addYAdapter,
    addCompanyComputer: actions.addCompanyComputer,
    clearDiagram: actions.clearDiagram,
    saveDiagram: actions.saveDiagram,
    updateWellName: actions.updateWellName,
    updateWellColor: actions.updateWellColor,
    updateWellsideGaugeName: actions.updateWellsideGaugeName,
    updateWellsideGaugeColor: actions.updateWellsideGaugeColor,
  };
};
