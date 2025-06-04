
import React, { useCallback } from 'react';

import '@xyflow/react/dist/style.css';

import { useJobDiagramCore } from '@/hooks/useJobDiagramCore';
import { useJobDiagramSave } from '@/hooks/useJobDiagramSave';
import { useEquipmentAllocationValidator } from '@/hooks/useEquipmentAllocationValidator';
import { useExtrasOnLocation } from '@/hooks/useExtrasOnLocation';
import { useWellConfiguration } from '@/hooks/useWellConfiguration';
import { useDiagramValidation } from '@/hooks/useDiagramValidation';
import { JobDiagram as JobDiagramType } from '@/hooks/useSupabaseJobs';

// Import components
import DiagramControls from '@/components/diagram/DiagramControls';
import JobDiagramSidebar from '@/components/diagram/JobDiagramSidebar';
import JobDiagramCanvas from '@/components/diagram/JobDiagramCanvas';

interface JobDiagramProps {
  job: JobDiagramType;
}

const JobDiagram: React.FC<JobDiagramProps> = ({ job }) => {
  const {
    reactFlowWrapper,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    selectedCableType,
    setSelectedCableType,
    selectedShearstreamBoxes,
    selectedStarlink,
    selectedCustomerComputers,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
    customerComputerNames,
    updateMainBoxName,
    updateCustomerComputerName,
    updateSatelliteName,
    updateWellsideGaugeName,
  } = useJobDiagramCore(job);

  const { manualSave } = useJobDiagramSave({
    job,
    nodes,
    edges,
    isInitialized: true,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
    customerComputerNames,
    selectedCableType,
    selectedShearstreamBoxes,
    selectedStarlink,
    selectedCustomerComputers,
  });

  const {
    validateEquipmentAllocations,
    fixEquipmentAllocations,
    validationResults,
    isValidating,
  } = useEquipmentAllocationValidator();

  const {
    extrasOnLocation,
    handleAddExtra,
    handleRemoveExtra,
  } = useExtrasOnLocation();

  const {
    updateWellName,
    updateWellColor,
    updateWellsideGaugeColor,
  } = useWellConfiguration(setNodes);

  const { handleValidateDiagram } = useDiagramValidation(nodes, edges);

  const handleValidateEquipment = useCallback(() => {
    const issues = validateEquipmentAllocations();
    if (issues.length > 0) {
      const fixedCount = fixEquipmentAllocations(issues);
      console.log(`Fixed ${fixedCount} equipment issues`);
    }
  }, [validateEquipmentAllocations, fixEquipmentAllocations]);

  return (
    <div className="w-full h-screen flex flex-col">
      <DiagramControls
        onManualSave={manualSave}
        onValidateEquipment={handleValidateEquipment}
        onValidateDiagram={handleValidateDiagram}
        validationResults={validationResults}
        isValidating={isValidating}
      />
      
      <div className="flex-1 flex gap-4">
        <JobDiagramSidebar
          nodes={nodes}
          selectedShearstreamBoxes={selectedShearstreamBoxes}
          selectedStarlink={selectedStarlink}
          selectedCustomerComputers={selectedCustomerComputers}
          updateWellName={updateWellName}
          updateWellColor={updateWellColor}
          updateWellsideGaugeName={updateWellsideGaugeName}
          updateWellsideGaugeColor={updateWellsideGaugeColor}
          extrasOnLocation={extrasOnLocation}
          onAddExtra={handleAddExtra}
          onRemoveExtra={handleRemoveExtra}
        />

        <JobDiagramCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          reactFlowWrapper={reactFlowWrapper}
        />
      </div>
    </div>
  );
};

export default JobDiagram;
