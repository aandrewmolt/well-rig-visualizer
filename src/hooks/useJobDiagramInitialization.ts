
import { useEffect, useCallback, useMemo } from 'react';
import { Node } from '@xyflow/react';
import { useJobPersistence } from './useJobPersistence';
import { useInventoryData } from './useInventoryData';
import { useDiagramInitialization } from './useDiagramInitialization';
import { JobEquipmentAssignment } from '@/types/equipment';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

interface UseJobDiagramInitializationProps {
  job: Job;
  nodes: Node[];
  edges: any[];
  isInitialized: boolean;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: any[]) => void;
  setNodeIdCounter: (counter: number) => void;
  setIsInitialized: (initialized: boolean) => void;
  setMainBoxName: (name: string) => void;
  setSatelliteName: (name: string) => void;
  setWellsideGaugeName: (name: string) => void;
  setCustomerComputerNames: (names: Record<string, string>) => void;
  setSelectedCableType: (type: string) => void;
  setSelectedShearstreamBoxes: (boxes: string[]) => void;
  setSelectedStarlink: (starlink: string) => void;
  setSelectedCustomerComputers: (computers: string[]) => void;
  setEquipmentAssignment: (assignment: JobEquipmentAssignment) => void;
  syncWithLoadedData: (data: any) => void;
  mainBoxName: string;
  satelliteName: string;
  wellsideGaugeName: string;
}

export const useJobDiagramInitialization = ({
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
}: UseJobDiagramInitializationProps) => {
  const { data: inventoryData } = useInventoryData();
  const { jobData } = useJobPersistence(job.id);

  const { initializeJob } = useDiagramInitialization(
    job,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
    isInitialized,
    setNodes,
    setEdges,
    setNodeIdCounter,
    setIsInitialized
  );

  // Calculate proper node ID counter from existing nodes
  const calculateNodeIdCounter = useCallback((nodeList: any[]) => {
    let maxId = 0;
    nodeList.forEach(node => {
      const matches = node.id.match(/\d+/g);
      if (matches) {
        const numbers = matches.map(Number);
        maxId = Math.max(maxId, ...numbers);
      }
    });
    return maxId + 1;
  }, []);

  const restoreEdgesStyling = useCallback((edgeList: any[], selectedCableType: string) => {
    const getEdgeColor = (cableTypeId: string) => {
      const cableType = inventoryData.equipmentTypes.find(type => type.id === cableTypeId);
      const cableName = cableType?.name || '';
      const lowerName = cableName.toLowerCase();
      if (lowerName.includes('100ft')) return '#ef4444';
      if (lowerName.includes('200ft')) return '#3b82f6';
      if (lowerName.includes('300ft')) return '#10b981';
      return '#6b7280';
    };

    return edgeList.map(edgeItem => {
      return {
        ...edgeItem,
        type: edgeItem.type || 'cable',
        style: edgeItem.style || {
          stroke: getEdgeColor(edgeItem.data?.cableTypeId || selectedCableType),
          strokeWidth: 3,
        },
        data: edgeItem.data || { cableTypeId: selectedCableType, label: 'Cable' }
      };
    });
  }, [inventoryData.equipmentTypes]);

  // Load persisted data on mount - single effect to prevent conflicts
  useEffect(() => {
    if (jobData && !isInitialized) {
      // Sync state with loaded data first
      syncWithLoadedData(jobData);
      
      // Restore nodes and edges with proper styling
      const restoredEdges = restoreEdgesStyling(jobData.edges || [], jobData.selectedCableType || '');
      setNodes(jobData.nodes || []);
      setEdges(restoredEdges);
      
      // Update state variables
      setMainBoxName(jobData.mainBoxName || 'ShearStream Box');
      setSatelliteName(jobData.satelliteName || 'Starlink');
      setWellsideGaugeName(jobData.wellsideGaugeName || 'Wellside Gauge');
      // Support both old and new property names for backward compatibility
      setCustomerComputerNames(jobData.customerComputerNames || jobData.companyComputerNames || {});
      
      // Fix: Load selected cable type with fallback
      if (jobData.selectedCableType) {
        setSelectedCableType(jobData.selectedCableType);
      }
      
      // Load equipment assignment - updated for multiple SS boxes with migration support
      if (jobData.equipmentAssignment) {
        const assignment = jobData.equipmentAssignment;
        setSelectedShearstreamBoxes(assignment.shearstreamBoxIds || []);
        setSelectedStarlink(assignment.starlinkId || '');
        // Support migration from old companyComputerIds to new customerComputerIds
        setSelectedCustomerComputers(assignment.customerComputerIds || assignment.companyComputerIds || []);
        setEquipmentAssignment({
          shearstreamBoxIds: assignment.shearstreamBoxIds || [],
          starlinkId: assignment.starlinkId,
          customerComputerIds: assignment.customerComputerIds || assignment.companyComputerIds || []
        });
      }
      
      // Calculate proper node ID counter from existing nodes
      const calculatedCounter = calculateNodeIdCounter(jobData.nodes || []);
      setNodeIdCounter(calculatedCounter);
      
      setIsInitialized(true);
    } else if (!jobData && !isInitialized) {
      initializeJob();
    }
  }, [
    jobData, 
    isInitialized, 
    initializeJob, 
    setNodes, 
    setEdges, 
    setMainBoxName, 
    setSatelliteName, 
    setWellsideGaugeName, 
    setCustomerComputerNames, 
    setSelectedCableType,
    setNodeIdCounter, 
    setIsInitialized,
    syncWithLoadedData,
    restoreEdgesStyling,
    setEquipmentAssignment,
    calculateNodeIdCounter,
    setSelectedShearstreamBoxes,
    setSelectedStarlink,
    setSelectedCustomerComputers
  ]);

  return {
    initializeJob,
  };
};
