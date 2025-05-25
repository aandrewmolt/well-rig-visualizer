
import React from 'react';
import '@xyflow/react/dist/style.css';
import JobDiagramContent from './diagram/JobDiagramContent';
import { useJobDiagramHooks } from '@/hooks/useJobDiagramHooks';

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
  const {
    reactFlowWrapper,
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
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
    addYAdapter,
    addCompanyComputer,
    clearDiagram,
    saveDiagram,
    updateWellName,
    updateWellColor,
    updateWellsideGaugeName,
    updateWellsideGaugeColor,
  } = useJobDiagramHooks(job);

  return (
    <JobDiagramContent
      job={job}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      reactFlowWrapper={reactFlowWrapper}
      selectedCableType={selectedCableType}
      setSelectedCableType={setSelectedCableType}
      selectedShearstreamBoxes={selectedShearstreamBoxes}
      selectedStarlink={selectedStarlink}
      selectedCompanyComputers={selectedCompanyComputers}
      onEquipmentSelect={handleEquipmentSelect}
      onAddShearstreamBox={handleAddShearstreamBox}
      onRemoveShearstreamBox={handleRemoveShearstreamBox}
      addYAdapter={addYAdapter}
      addCompanyComputer={addCompanyComputer}
      clearDiagram={clearDiagram}
      saveDiagram={saveDiagram}
      updateWellName={updateWellName}
      updateWellColor={updateWellColor}
      updateWellsideGaugeName={updateWellsideGaugeName}
      updateWellsideGaugeColor={updateWellsideGaugeColor}
    />
  );
};

export default JobDiagram;
