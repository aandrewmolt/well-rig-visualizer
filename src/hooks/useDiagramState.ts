
import { useState, useCallback } from 'react';
import { Node } from '@xyflow/react';

export interface JobEquipmentAssignment {
  shearstreamBoxIds: string[]; // Changed to support multiple boxes
  starlinkId?: string;
  companyComputerIds: string[];
}

export const useDiagramState = () => {
  // Change selectedCableType to use string instead of hardcoded union
  const [selectedCableType, setSelectedCableType] = useState<string>('');
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [mainBoxName, setMainBoxName] = useState('ShearStream Box');
  const [satelliteName, setSatelliteName] = useState('Starlink');
  const [wellsideGaugeName, setWellsideGaugeName] = useState('Wellside Gauge');
  const [companyComputerNames, setCompanyComputerNames] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [equipmentAssignment, setEquipmentAssignment] = useState<JobEquipmentAssignment>({
    shearstreamBoxIds: [], // Changed to array
    companyComputerIds: [],
  });

  const updateMainBoxName = useCallback((nodeId: string, name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: name } }
          : node
      )
    );
  }, []);

  const updateCompanyComputerName = useCallback((nodeId: string, name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => {
    setCompanyComputerNames(prev => ({ ...prev, [nodeId]: name }));
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: name } }
          : node
      )
    );
  }, []);

  const updateSatelliteName = useCallback((name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => {
    setSatelliteName(name);
    setNodes((nodes) =>
      nodes.map((node) =>
        node.type === 'satellite'
          ? { ...node, data: { ...node.data, label: name } }
          : node
      )
    );
  }, []);

  const updateWellsideGaugeName = useCallback((name: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => {
    setWellsideGaugeName(name);
    setNodes((nodes) =>
      nodes.map((node) =>
        node.type === 'wellsideGauge'
          ? { ...node, data: { ...node.data, label: name } }
          : node
      )
    );
  }, []);

  const syncWithLoadedData = useCallback((jobData: any) => {
    if (jobData.selectedCableType) {
      setSelectedCableType(jobData.selectedCableType);
    }
    if (jobData.equipmentAssignment) {
      setEquipmentAssignment(jobData.equipmentAssignment);
    }
  }, []);

  return {
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
  };
};
