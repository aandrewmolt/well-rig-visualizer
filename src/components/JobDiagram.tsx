import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CableConfigurationPanel from './diagram/CableConfigurationPanel';
import WellConfigurationPanel from './diagram/WellConfigurationPanel';
import JobEquipmentPanel from './diagram/JobEquipmentPanel';
import EquipmentSelectionPanel from './diagram/EquipmentSelectionPanel';
import DiagramCanvas from './diagram/DiagramCanvas';
import ConnectionGuide from './diagram/ConnectionGuide';
import { useJobPersistence } from '@/hooks/useJobPersistence';
import { useEnhancedEquipmentTracking } from '@/hooks/useEnhancedEquipmentTracking';
import { useDiagramState } from '@/hooks/useDiagramState';
import { useDiagramInitialization } from '@/hooks/useDiagramInitialization';
import { useDiagramConnections } from '@/hooks/useDiagramConnections';
import { useDiagramActions } from '@/hooks/useDiagramActions';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useJobStorage } from '@/hooks/useJobStorage';
import { useTrackedEquipment } from '@/hooks/useTrackedEquipment';
import { JobEquipmentAssignment } from '@/types/equipment';
import { useInventoryData } from '@/hooks/useInventoryData';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

interface JobDiagramProps {
  job: Job;
}

const JobDiagram: React.FC<JobDiagramProps> = ({ job }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { updateJob } = useJobStorage();
  const { trackedEquipment, deployEquipment, returnEquipment } = useTrackedEquipment();
  const { data: inventoryData } = useInventoryData();

  // Equipment assignment state
  const [selectedShearstreamBox, setSelectedShearstreamBox] = useState<string>('');
  const [selectedStarlink, setSelectedStarlink] = useState<string>('');
  const [selectedCompanyComputers, setSelectedCompanyComputers] = useState<string[]>([]);

  // ... keep existing code (useDiagramState hook call)
  const {
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
  } = useDiagramState();

  // Initialize selectedCableType with first available cable if not set
  React.useEffect(() => {
    if (!selectedCableType && inventoryData.equipmentTypes.length > 0) {
      const firstAvailableCable = inventoryData.equipmentTypes
        .filter(type => type.category === 'cables')
        .find(cableType => {
          const availableItems = inventoryData.equipmentItems
            .filter(item => 
              item.typeId === cableType.id && 
              item.status === 'available' && 
              item.quantity > 0
            );
          return availableItems.length > 0;
        });
      
      if (firstAvailableCable) {
        setSelectedCableType(firstAvailableCable.id);
      }
    }
  }, [selectedCableType, setSelectedCableType, inventoryData]);

  const { jobData, saveJobData } = useJobPersistence(job.id);
  
  const { 
    calculateEquipmentUsage,
    autoAllocateEquipment,
    returnEquipmentToLocation,
    isAutoSyncEnabled,
    setIsAutoSyncEnabled,
  } = useEnhancedEquipmentTracking(job.id, nodes, edges);

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

  const { onConnect } = useDiagramConnections(selectedCableType, nodes, setEdges);

  const {
    addYAdapter,
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

  // Handle equipment selection
  const handleEquipmentSelect = useCallback((type: 'shearstream-box' | 'starlink' | 'company-computer', equipmentId: string, index?: number) => {
    const equipment = trackedEquipment.find(eq => eq.id === equipmentId);
    if (!equipment) return;

    if (type === 'shearstream-box') {
      if (selectedShearstreamBox) {
        returnEquipment(selectedShearstreamBox);
      }
      setSelectedShearstreamBox(equipmentId);
      deployEquipment(equipmentId, job.id, job.name, equipment.name);
      updateMainBoxName(equipment.equipmentId, setNodes);
    } else if (type === 'starlink') {
      if (selectedStarlink) {
        returnEquipment(selectedStarlink);
      }
      setSelectedStarlink(equipmentId);
      deployEquipment(equipmentId, job.id, job.name, equipment.name);
      updateSatelliteName(equipment.equipmentId, setNodes);
    } else if (type === 'company-computer' && index !== undefined) {
      const newComputers = [...selectedCompanyComputers];
      if (newComputers[index]) {
        returnEquipment(newComputers[index]);
      }
      newComputers[index] = equipmentId;
      setSelectedCompanyComputers(newComputers);
      deployEquipment(equipmentId, job.id, job.name, equipment.name);
      updateCompanyComputerName(`company-computer-${index + 1}`, equipment.equipmentId, setNodes);
    }
  }, [trackedEquipment, selectedShearstreamBox, selectedStarlink, selectedCompanyComputers, returnEquipment, deployEquipment, job, updateMainBoxName, updateSatelliteName, updateCompanyComputerName, setNodes]);

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

  // Fix: Restore edge styling and data - remove reference to undefined 'edge'
  const restoreEdgesStyling = useCallback((edgeList: any[]) => {
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
  }, [inventoryData.equipmentTypes, selectedCableType]);

  // Memoized save data
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
    selectedCableType, // Save the selected cable type ID
    equipmentAssignment: {
      shearstreamBoxId: selectedShearstreamBox || undefined,
      starlinkId: selectedStarlink || undefined,
      companyComputerIds: selectedCompanyComputers.filter(Boolean),
    } as JobEquipmentAssignment,
  }), [job, nodes, edges, mainBoxName, satelliteName, wellsideGaugeName, companyComputerNames, selectedCableType, selectedShearstreamBox, selectedStarlink, selectedCompanyComputers]);

  // Save function with comprehensive data
  const performSave = useCallback(() => {
    if (isInitialized && (nodes.length > 0 || edges.length > 0)) {
      saveJobData(saveDataMemo);
      updateJob(job.id, { 
        equipmentAllocated: true,
        lastUpdated: new Date() 
      });
    }
  }, [isInitialized, nodes.length, edges.length, saveJobData, saveDataMemo, updateJob, job.id]);

  // Debounced save to prevent excessive saves
  const { debouncedSave, cleanup } = useDebouncedSave(performSave, 300);

  // Load persisted data on mount - single effect to prevent conflicts
  useEffect(() => {
    if (jobData && !isInitialized) {
      // Sync state with loaded data first
      syncWithLoadedData(jobData);
      
      // Restore nodes and edges with proper styling
      const restoredEdges = restoreEdgesStyling(jobData.edges || []);
      setNodes(jobData.nodes || []);
      setEdges(restoredEdges);
      
      // Update state variables
      setMainBoxName(jobData.mainBoxName || 'ShearStream Box');
      setSatelliteName(jobData.satelliteName || 'Starlink');
      setWellsideGaugeName(jobData.wellsideGaugeName || 'Wellside Gauge');
      setCompanyComputerNames(jobData.companyComputerNames || {});
      
      // Fix: Load selected cable type with fallback
      if (jobData.selectedCableType) {
        setSelectedCableType(jobData.selectedCableType);
      }
      
      // Load equipment assignment
      if (jobData.equipmentAssignment) {
        setSelectedShearstreamBox(jobData.equipmentAssignment.shearstreamBoxId || '');
        setSelectedStarlink(jobData.equipmentAssignment.starlinkId || '');
        setSelectedCompanyComputers(jobData.equipmentAssignment.companyComputerIds || []);
        setEquipmentAssignment(jobData.equipmentAssignment);
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
    setCompanyComputerNames, 
    setSelectedCableType,
    setNodeIdCounter, 
    setIsInitialized,
    syncWithLoadedData,
    restoreEdgesStyling,
    setEquipmentAssignment,
    calculateNodeIdCounter
  ]);

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

  // ... keep existing code (wellNodes, wellsideGaugeNode, companyComputerNodes, equipmentUsage calculations)
  const wellNodes = nodes.filter(node => node.type === 'well');
  const wellsideGaugeNode = nodes.find(node => node.type === 'wellsideGauge');
  const companyComputerNodes = nodes.filter(node => node.type === 'companyComputer');
  const equipmentUsage = calculateEquipmentUsage();

  return (
    <div className="max-w-7xl mx-auto space-y-2">
      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <CableConfigurationPanel
          selectedCableType={selectedCableType}
          setSelectedCableType={setSelectedCableType}
          addYAdapter={addYAdapter}
          addCompanyComputer={addCompanyComputer}
          clearDiagram={clearDiagram}
          saveDiagram={saveDiagram}
        />

        <EquipmentSelectionPanel
          selectedShearstreamBox={selectedShearstreamBox}
          selectedStarlink={selectedStarlink}
          selectedCompanyComputers={selectedCompanyComputers}
          companyComputerCount={companyComputerNodes.length}
          onEquipmentSelect={handleEquipmentSelect}
          hasWellsideGauge={job.hasWellsideGauge}
        />

        <WellConfigurationPanel
          wellNodes={wellNodes}
          wellsideGaugeNode={wellsideGaugeNode}
          updateWellName={updateWellName}
          updateWellColor={updateWellColor}
          updateWellsideGaugeName={(name) => updateWellsideGaugeName(name, setNodes)}
          updateWellsideGaugeColor={updateWellsideGaugeColor}
        />

        <JobEquipmentPanel
          jobId={job.id}
          jobName={job.name}
          equipmentUsage={equipmentUsage}
          extrasOnLocation={[]}
          onAutoAllocate={autoAllocateEquipment}
          onAddExtra={() => {}}
          onRemoveExtra={() => {}}
          isAutoSyncEnabled={isAutoSyncEnabled}
          onToggleAutoSync={setIsAutoSyncEnabled}
        />
      </div>

      {/* Diagram Section */}
      <DiagramCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        reactFlowWrapper={reactFlowWrapper}
      />

      {/* Connection Guide */}
      <ConnectionGuide />
    </div>
  );
};

export default JobDiagram;
