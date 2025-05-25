
import React, { useRef, useEffect } from 'react';
import { useJobDiagramState } from '@/hooks/useJobDiagramState';
import { useJobDiagramInitialization } from '@/hooks/useJobDiagramInitialization';
import { useDiagramConnections } from '@/hooks/useDiagramConnections';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

export const useJobDiagramCore = (job: Job) => {
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
    selectedCompanyComputers,
    setSelectedCompanyComputers,
    nodeIdCounter,
    setNodeIdCounter,
    isInitialized,
    setIsInitialized,
    equipmentAssignment,
    setEquipmentAssignment,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
    companyComputerNames,
    // Functions
    onConnect,
    initializeJob,
    updateMainBoxName,
    updateCompanyComputerName,
    updateSatelliteName,
    updateWellsideGaugeName,
  };
};
