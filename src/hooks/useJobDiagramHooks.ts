
import React, { useRef, useEffect, useMemo } from 'react';
import { useJobStorage } from '@/hooks/useJobStorage';
import { useRobustEquipmentTracking } from '@/hooks/useRobustEquipmentTracking';
import { useDiagramConnections } from '@/hooks/useDiagramConnections';
import { useDiagramActions } from '@/hooks/useDiagramActions';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useJobPersistence } from '@/hooks/useJobPersistence';
import { useJobDiagramState } from '@/hooks/useJobDiagramState';
import { useJobDiagramInitialization } from '@/hooks/useJobDiagramInitialization';
import { useJobDiagramEquipment } from '@/hooks/useJobDiagramEquipment';
import { JobEquipmentAssignment } from '@/types/equipment';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

export const useJobDiagramHooks = (job: Job) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { updateJob } = useJobStorage();
  const { saveJobData } = useJobPersistence(job.id);

  // State management
  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    selectedShearstreamBoxes,
    setSelectedShearstreamBoxes,
    selectedStarlink,
    setSelectedStarlink,
    selectedCompanyComputers,
    setSelectedCompanyComputers,
    initializeCableType,
    selectedCableType,
    setSelectedCableType,
    nodeIdCounter,
    setNodeIdCounter,
    mainBoxName,
    setMainBoxName,
    satelliteName,
    setSatelliteName,
    wellsideGaugeName,
    setWellsideGaugeName,
    companyComputerNames,
    setCompanyComputerNames,
    isInitialized,
    setIsInitialized,
    equipmentAssignment,
    setEquipmentAssignment,
    updateMainBoxName,
    updateCompanyComputerName,
    updateSatelliteName,
    updateWellsideGaugeName,
    syncWithLoadedData,
  } = useJobDiagramState();

  // Initialize cable type
  React.useEffect(() => {
    initializeCableType();
  }, [initializeCableType]);

  // Hooks for functionality
  const {
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
  } = useRobustEquipmentTracking(job.id, nodes, edges);

  const { initializeJob } = useJobDiagramInitialization({
    job,
    nodes,
    edges,
    isInitialized,
    setNodes,
    setEdges,
    setNodeIdCounter,
    setIsInitialized,
    setMainBoxName,
    setSatelliteName,
    setWellsideGaugeName,
    setCompanyComputerNames,
    setSelectedCableType,
    setSelectedShearstreamBoxes,
    setSelectedStarlink,
    setSelectedCompanyComputers,
    setEquipmentAssignment,
    syncWithLoadedData,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
  });

  const { onConnect } = useDiagramConnections(selectedCableType, nodes, setEdges);

  const {
    addYAdapter,
    addShearstreamBox,
    removeShearstreamBox,
    addCompanyComputer,
    updateWellName,
    updateWellColor,
    updateWellsideGaugeColor,
    clearDiagram,
    saveDiagram,
  } = useDiagramActions(
    job,
    nodeIdCounter,
    setNodeIdCounter,
    setNodes,
    setEdges,
    setIsInitialized,
    initializeJob,
    reactFlowWrapper
  );

  // Equipment handling
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

  // Save data preparation
  const saveDataMemo = useMemo(() => ({
    name: job.name,
    wellCount: job.wellCount,
    hasWellsideGauge: job.hasWellsideGauge,
    nodes,
    edges,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
    companyComputerNames,
    selectedCableType,
    equipmentAssignment: {
      shearstreamBoxIds: selectedShearstreamBoxes.filter(Boolean),
      starlinkId: selectedStarlink || undefined,
      companyComputerIds: selectedCompanyComputers.filter(Boolean),
    } as JobEquipmentAssignment,
  }), [job, nodes, edges, mainBoxName, satelliteName, wellsideGaugeName, companyComputerNames, selectedCableType, selectedShearstreamBoxes, selectedStarlink, selectedCompanyComputers]);

  const performSave = React.useCallback(() => {
    if (isInitialized && (nodes.length > 0 || edges.length > 0)) {
      saveJobData(saveDataMemo);
      updateJob(job.id, { 
        equipmentAllocated: true,
        lastUpdated: new Date() 
      });
    }
  }, [isInitialized, nodes.length, edges.length, saveJobData, saveDataMemo, updateJob, job.id]);

  const { debouncedSave, cleanup } = useDebouncedSave(performSave, 300);

  // Trigger debounced save whenever relevant data changes
  useEffect(() => {
    if (isInitialized) {
      debouncedSave();
    }
  }, [saveDataMemo, isInitialized, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    reactFlowWrapper,
    // State
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedCableType,
    setSelectedCableType,
    selectedShearstreamBoxes,
    selectedStarlink,
    selectedCompanyComputers,
    // Actions
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
    addYAdapter,
    addCompanyComputer,
    clearDiagram,
    saveDiagram,
    updateWellName,
    updateWellColor,
    updateWellsideGaugeName: (name: string) => updateWellsideGaugeName(name, setNodes),
    updateWellsideGaugeColor,
  };
};
