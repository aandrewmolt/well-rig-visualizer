
import React from 'react';
import '@xyflow/react/dist/style.css';
import JobDiagramContent from './diagram/JobDiagramContent';
import { useJobDiagramHooks } from '@/hooks/useJobDiagramHooks';
import { JobDiagram } from '@/hooks/useSupabaseJobs';

interface JobDiagramProps {
  job: JobDiagram;
}

const JobDiagramComponent: React.FC<JobDiagramProps> = ({ job }) => {
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
    selectedCustomerComputers,
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
    addYAdapter,
    addCustomerComputer,
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
      selectedCustomerComputers={selectedCustomerComputers}
      onEquipmentSelect={handleEquipmentSelect}
      onAddShearstreamBox={handleAddShearstreamBox}
      onRemoveShearstreamBox={handleRemoveShearstreamBox}
      addYAdapter={addYAdapter}
      addCustomerComputer={addCustomerComputer}
      clearDiagram={clearDiagram}
      saveDiagram={saveDiagram}
      updateWellName={updateWellName}
      updateWellColor={updateWellColor}
      updateWellsideGaugeName={updateWellsideGaugeName}
      updateWellsideGaugeColor={updateWellsideGaugeColor}
    />
  );
};

export default JobDiagramComponent;
