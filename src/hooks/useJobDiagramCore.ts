
import React, { useRef, useEffect } from 'react';
import { useJobDiagramState } from '@/hooks/useJobDiagramState';
import { useJobDiagramInitialization } from '@/hooks/useJobDiagramInitialization';
import { useDiagramConnections } from '@/hooks/useDiagramConnections';
import { JobDiagram } from '@/hooks/useSupabaseJobs';

export const useJobDiagramCore = (job: JobDiagram) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
    selectedCustomerComputers,
    setSelectedCustomerComputers,
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
    customerComputerNames,
    setCustomerComputerNames,
    isInitialized,
    setIsInitialized,
    equipmentAssignment,
    setEquipmentAssignment,
    updateMainBoxName,
    updateCustomerComputerName,
    updateSatelliteName,
    updateWellsideGaugeName,
    syncWithLoadedData,
  } = useJobDiagramState();

  // Initialize cable type
  React.useEffect(() => {
    initializeCableType();
  }, [initializeCableType]);

  // Job initialization
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
    setCustomerComputerNames,
    setSelectedCableType,
    setSelectedShearstreamBoxes,
    setSelectedStarlink,
    setSelectedCustomerComputers,
    setEquipmentAssignment,
    syncWithLoadedData,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
  });

  // Diagram connections
  const { onConnect } = useDiagramConnections(selectedCableType, nodes, setEdges);

  return {
    reactFlowWrapper,
    // State
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    selectedCableType,
    setSelectedCableType,
    selectedShearstreamBoxes,
    setSelectedShearstreamBoxes,
    selectedStarlink,
    setSelectedStarlink,
    selectedCustomerComputers,
    setSelectedCustomerComputers,
    nodeIdCounter,
    setNodeIdCounter,
    isInitialized,
    setIsInitialized,
    equipmentAssignment,
    setEquipmentAssignment,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
    customerComputerNames,
    // Functions
    onConnect,
    initializeJob,
    updateMainBoxName,
    updateCustomerComputerName,
    updateSatelliteName,
    updateWellsideGaugeName,
  };
};
