
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

  // Equipment tracking using Supabase data
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
    selectedCustomerComputers: coreData.selectedCustomerComputers,
    setSelectedShearstreamBoxes: coreData.setSelectedShearstreamBoxes,
    setSelectedStarlink: coreData.setSelectedStarlink,
    setSelectedCustomerComputers: coreData.setSelectedCustomerComputers,
    setNodes: coreData.setNodes,
    updateMainBoxName: coreData.updateMainBoxName,
    updateSatelliteName: coreData.updateSatelliteName,
    updateCustomerComputerName: coreData.updateCustomerComputerName,
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
    customerComputerNames: coreData.customerComputerNames,
    selectedCableType: coreData.selectedCableType,
    selectedShearstreamBoxes: coreData.selectedShearstreamBoxes,
    selectedStarlink: coreData.selectedStarlink,
    selectedCustomerComputers: coreData.selectedCustomerComputers,
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
    selectedCustomerComputers: coreData.selectedCustomerComputers,
    // Actions
    handleEquipmentSelect: equipmentHandlers.handleEquipmentSelect,
    handleAddShearstreamBox: equipmentHandlers.handleAddShearstreamBox,
    handleRemoveShearstreamBox: equipmentHandlers.handleRemoveShearstreamBox,
    addYAdapter: actions.addYAdapter,
    addCustomerComputer: actions.addCustomerComputer,
    clearDiagram: actions.clearDiagram,
    saveDiagram: actions.saveDiagram,
    updateWellName: actions.updateWellName,
    updateWellColor: actions.updateWellColor,
    updateWellsideGaugeName: actions.updateWellsideGaugeName,
    updateWellsideGaugeColor: actions.updateWellsideGaugeColor,
    
    // Equipment tracking functions
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
  };
};
