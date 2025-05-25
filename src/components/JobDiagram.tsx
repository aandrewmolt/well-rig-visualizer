import React, { useRef, useEffect, useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CableConfigurationPanel from './diagram/CableConfigurationPanel';
import WellConfigurationPanel from './diagram/WellConfigurationPanel';
import JobEquipmentPanel from './diagram/JobEquipmentPanel';
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
    updateMainBoxName,
    updateCompanyComputerName,
    updateSatelliteName,
    updateWellsideGaugeName,
    syncWithLoadedData,
  } = useDiagramState();

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

  // Calculate proper node ID counter from existing nodes
  const calculateNodeIdCounter = (nodeList: any[]) => {
    let maxId = 0;
    nodeList.forEach(node => {
      const matches = node.id.match(/\d+/g);
      if (matches) {
        const numbers = matches.map(Number);
        maxId = Math.max(maxId, ...numbers);
      }
    });
    return maxId + 1;
  };

  // Restore edge styling and data
  const restoreEdgesStyling = useCallback((edgeList: any[]) => {
    return edgeList.map(edge => ({
      ...edge,
      type: edge.type || 'cable',
      style: edge.style || {
        stroke: edge.data?.cableType === '100ft' ? '#ef4444' : 
               edge.data?.cableType === '200ft' ? '#3b82f6' : 
               edge.data?.cableType === '300ft' ? '#10b981' : '#6b7280',
        strokeWidth: 3,
      },
      data: edge.data || { cableType: '200ft', label: '200ft' }
    }));
  }, []);

  // Save function with comprehensive data
  const performSave = useCallback(() => {
    if (isInitialized && (nodes.length > 0 || edges.length > 0)) {
      console.log('Saving comprehensive job data with equipment tracking');
      
      saveJobData({
        name: job.name,
        wellCount: job.wellCount,
        hasWellsideGauge: job.hasWellsideGauge,
        nodes,
        edges,
        mainBoxName,
        satelliteName,
        wellsideGaugeName,
        companyComputerNames,
      });

      // Update job status to indicate equipment allocation
      updateJob(job.id, { 
        equipmentAllocated: true,
        lastUpdated: new Date() 
      });
    }
  }, [
    nodes, 
    edges, 
    mainBoxName, 
    satelliteName, 
    wellsideGaugeName, 
    companyComputerNames, 
    isInitialized, 
    saveJobData, 
    job,
    updateJob
  ]);

  // Debounced save to prevent excessive saves
  const debouncedSave = useDebouncedSave(performSave, 300);

  // Load persisted data on mount - single effect to prevent conflicts
  useEffect(() => {
    if (jobData && !isInitialized) {
      console.log('Loading persisted job data:', jobData);
      
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
      
      // Calculate proper node ID counter from existing nodes
      const calculatedCounter = calculateNodeIdCounter(jobData.nodes || []);
      setNodeIdCounter(calculatedCounter);
      
      setIsInitialized(true);
    } else if (!jobData && !isInitialized) {
      console.log('No persisted data found, initializing new job');
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
    setNodeIdCounter, 
    setIsInitialized,
    syncWithLoadedData,
    restoreEdgesStyling
  ]);

  // Trigger debounced save whenever relevant data changes
  useEffect(() => {
    if (isInitialized) {
      debouncedSave();
    }
  }, [nodes, edges, mainBoxName, satelliteName, wellsideGaugeName, companyComputerNames, isInitialized, debouncedSave]);

  const wellNodes = nodes.filter(node => node.type === 'well');
  const wellsideGaugeNode = nodes.find(node => node.type === 'wellsideGauge');
  const companyComputerNodes = nodes.filter(node => node.type === 'companyComputer');
  const equipmentUsage = calculateEquipmentUsage();

  return (
    <div className="max-w-7xl mx-auto space-y-2">
      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CableConfigurationPanel
          selectedCableType={selectedCableType}
          setSelectedCableType={setSelectedCableType}
          mainBoxName={mainBoxName}
          updateMainBoxName={(name) => updateMainBoxName(name, setNodes)}
          companyComputerNodes={companyComputerNodes}
          updateCompanyComputerName={(id, name) => updateCompanyComputerName(id, name, setNodes)}
          satelliteName={satelliteName}
          updateSatelliteName={(name) => updateSatelliteName(name, setNodes)}
          wellsideGaugeName={wellsideGaugeName}
          updateWellsideGaugeName={(name) => updateWellsideGaugeName(name, setNodes)}
          hasWellsideGauge={job.hasWellsideGauge}
          addYAdapter={addYAdapter}
          addCompanyComputer={addCompanyComputer}
          clearDiagram={clearDiagram}
          saveDiagram={saveDiagram}
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
