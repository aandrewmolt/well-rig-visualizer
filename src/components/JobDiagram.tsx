
import React, { useRef, useEffect } from 'react';
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
import { useEquipmentTracking } from '@/hooks/useEquipmentTracking';
import { useDiagramState } from '@/hooks/useDiagramState';
import { useDiagramInitialization } from '@/hooks/useDiagramInitialization';
import { useDiagramConnections } from '@/hooks/useDiagramConnections';
import { useDiagramActions } from '@/hooks/useDiagramActions';

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
  } = useDiagramState();

  const { jobData, saveJobData } = useJobPersistence(job.id);
  
  const { 
    usage, 
    extrasOnLocation,
    autoAllocateEquipment,
    addExtraEquipment,
    removeExtraEquipment,
    transferEquipment 
  } = useEquipmentTracking(job.id, nodes, edges);

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

  // Load persisted data on mount
  useEffect(() => {
    if (jobData && !isInitialized) {
      setNodes(jobData.nodes || []);
      setEdges(jobData.edges || []);
      setMainBoxName(jobData.mainBoxName || 'ShearStream Box');
      setSatelliteName(jobData.satelliteName || 'Starlink');
      setWellsideGaugeName(jobData.wellsideGaugeName || 'Wellside Gauge');
      setCompanyComputerNames(jobData.companyComputerNames || {});
      setNodeIdCounter(jobData.nodes?.length || 0);
      setIsInitialized(true);
    } else if (!jobData && !isInitialized) {
      initializeJob();
    }
  }, [jobData, isInitialized]);

  // Save data whenever it changes
  useEffect(() => {
    if (isInitialized) {
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
    }
  }, [nodes, edges, mainBoxName, satelliteName, wellsideGaugeName, companyComputerNames, isInitialized]);

  // Initialize the diagram only once when component mounts
  React.useEffect(() => {
    if (!isInitialized) {
      initializeJob();
    }
  }, [initializeJob, isInitialized]);

  const wellNodes = nodes.filter(node => node.type === 'well');
  const wellsideGaugeNode = nodes.find(node => node.type === 'wellsideGauge');
  const companyComputerNodes = nodes.filter(node => node.type === 'companyComputer');

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
          equipmentUsage={usage}
          extrasOnLocation={extrasOnLocation}
          onAutoAllocate={autoAllocateEquipment}
          onAddExtra={addExtraEquipment}
          onRemoveExtra={removeExtraEquipment}
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
