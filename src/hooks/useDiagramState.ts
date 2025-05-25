
import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';

export const useDiagramState = () => {
  const [selectedCableType, setSelectedCableType] = useState<'100ft' | '200ft' | '300ft'>('200ft');
  const [nodeIdCounter, setNodeIdCounter] = useState(0);
  const [mainBoxName, setMainBoxName] = useState('ShearStream Box');
  const [satelliteName, setSatelliteName] = useState('Starlink');
  const [wellsideGaugeName, setWellsideGaugeName] = useState('Wellside Gauge');
  const [companyComputerNames, setCompanyComputerNames] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync state with loaded data
  const syncWithLoadedData = useCallback((jobData: any) => {
    if (jobData) {
      setMainBoxName(jobData.mainBoxName || 'ShearStream Box');
      setSatelliteName(jobData.satelliteName || 'Starlink');
      setWellsideGaugeName(jobData.wellsideGaugeName || 'Wellside Gauge');
      setCompanyComputerNames(jobData.companyComputerNames || {});
    }
  }, []);

  const updateMainBoxName = useCallback((newName: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => {
    setMainBoxName(newName);
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'main-box' 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  }, []);

  const updateCompanyComputerName = useCallback((computerId: string, newName: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => {
    setCompanyComputerNames(prev => ({ ...prev, [computerId]: newName }));
    setNodes((nds) => 
      nds.map((node) => 
        node.id === computerId 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  }, []);

  const updateSatelliteName = useCallback((newName: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => {
    setSatelliteName(newName);
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'satellite' 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  }, []);

  const updateWellsideGaugeName = useCallback((newName: string, setNodes: (updater: (nodes: Node[]) => Node[]) => void) => {
    setWellsideGaugeName(newName);
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'wellside-gauge' 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
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
    updateMainBoxName,
    updateCompanyComputerName,
    updateSatelliteName,
    updateWellsideGaugeName,
    syncWithLoadedData,
  };
};
