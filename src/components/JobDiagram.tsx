
import React, { useCallback, useState } from 'react';

import '@xyflow/react/dist/style.css';

import { useJobDiagramCore } from '@/hooks/useJobDiagramCore';
import { useJobDiagramSave } from '@/hooks/useJobDiagramSave';
import { useEquipmentAllocationValidator } from '@/hooks/useEquipmentAllocationValidator';
import { useExtrasOnLocation } from '@/hooks/useExtrasOnLocation';
import { useWellConfiguration } from '@/hooks/useWellConfiguration';
import { useDiagramValidation } from '@/hooks/useDiagramValidation';
import { useJobDiagramActions } from '@/hooks/useJobDiagramActions';
import { useJobDiagramEquipmentHandlers } from '@/hooks/useJobDiagramEquipmentHandlers';
import { useJobPhotos } from '@/hooks/useJobPhotos';
import { JobDiagram as JobDiagramType } from '@/hooks/useSupabaseJobs';

// Import components
import DiagramControls from '@/components/diagram/DiagramControls';
import JobDiagramSidebar from '@/components/diagram/JobDiagramSidebar';
import JobDiagramCanvas from '@/components/diagram/JobDiagramCanvas';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import JobPhotoPanel from '@/components/diagram/JobPhotoPanel';

interface JobDiagramProps {
  job: JobDiagramType;
}

const JobDiagram: React.FC<JobDiagramProps> = ({ job }) => {
  const [isPhotosPanelOpen, setIsPhotosPanelOpen] = useState(false);

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
    setSelectedShearstreamBoxes,
    selectedStarlink,
    setSelectedStarlink,
    selectedCustomerComputers,
    setSelectedCustomerComputers,
    nodeIdCounter,
    setNodeIdCounter,
    isInitialized,
    setIsInitialized,
    initializeJob,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
    customerComputerNames,
    updateMainBoxName,
    updateCustomerComputerName,
    updateSatelliteName,
    updateWellsideGaugeName,
  } = useJobDiagramCore(job);

  const { manualSave, immediateSave } = useJobDiagramSave({
    job,
    nodes,
    edges,
    isInitialized,
    mainBoxName,
    satelliteName,
    wellsideGaugeName,
    customerComputerNames,
    selectedCableType,
    selectedShearstreamBoxes,
    selectedStarlink,
    selectedCustomerComputers,
  });

  // Enhanced connection handler with immediate save for edge toggles
  const enhancedOnConnect = useCallback((connection: any) => {
    console.log('Enhanced connection handler:', connection);
    onConnect(connection);
    // Trigger immediate save after connection
    setTimeout(() => immediateSave(), 100);
  }, [onConnect, immediateSave]);

  // Enhanced edges change handler to detect Y→Well toggles
  const enhancedOnEdgesChange = useCallback((changes: any[]) => {
    console.log('Enhanced edges change handler:', changes);
    onEdgesChange(changes);
    
    // Check if this is a Y→Well toggle (edge update)
    const hasEdgeUpdate = changes.some(change => change.type === 'reset' || 
      (change.type === 'add' && change.item?.type === 'direct') ||
      (change.type === 'add' && change.item?.data?.connectionType === 'direct'));
    
    if (hasEdgeUpdate) {
      console.log('Detected edge toggle, triggering immediate save');
      setTimeout(() => immediateSave(), 100);
    }
  }, [onEdgesChange, immediateSave]);

  // Enhanced nodes change handler to detect COM port changes
  const enhancedOnNodesChange = useCallback((changes: any[]) => {
    console.log('Enhanced nodes change handler:', changes);
    onNodesChange(changes);
    
    // Check if this includes MainBox data changes (COM ports)
    const hasMainBoxUpdate = changes.some(change => 
      change.type === 'reset' || 
      (change.item && change.item.type === 'mainBox')
    );
    
    if (hasMainBoxUpdate) {
      console.log('Detected MainBox change, triggering immediate save');
      setTimeout(() => immediateSave(), 100);
    }
  }, [onNodesChange, immediateSave]);

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

  // Add diagram actions
  const {
    addYAdapter,
    addShearstreamBox,
    removeShearstreamBox,
    addCustomerComputer,
    clearDiagram,
    saveDiagram,
  } = useJobDiagramActions({
    job,
    nodeIdCounter,
    setNodeIdCounter,
    setNodes,
    setEdges,
    setIsInitialized,
    initializeJob,
    reactFlowWrapper,
  });

  // Add equipment handlers
  const {
    handleEquipmentSelect,
    handleAddShearstreamBox,
    handleRemoveShearstreamBox,
  } = useJobDiagramEquipmentHandlers({
    job,
    selectedShearstreamBoxes,
    selectedStarlink,
    selectedCustomerComputers,
    setSelectedShearstreamBoxes,
    setSelectedStarlink,
    setSelectedCustomerComputers,
    setNodes,
    updateMainBoxName,
    updateSatelliteName,
    updateCustomerComputerName,
    addShearstreamBox,
    removeShearstreamBox,
  });

  const handleValidateEquipment = useCallback(() => {
    const issues = validateEquipmentAllocations();
    if (issues.length > 0) {
      const fixedCount = fixEquipmentAllocations(issues);
      console.log(`Fixed ${fixedCount} equipment issues`);
    }
  }, [validateEquipmentAllocations, fixEquipmentAllocations]);

  // Add handlers for Starlink and Customer Computer management
  const handleAddStarlink = () => {
    console.log('Add starlink - functionality to be implemented');
    // This would add a new starlink node to the diagram
  };

  const handleRemoveStarlink = (index: number) => {
    console.log('Remove starlink:', index);
    // This would remove a starlink node from the diagram
  };

  const handleAddCustomerComputerWrapper = () => {
    addCustomerComputer();
  };

  const handleRemoveCustomerComputer = (index: number) => {
    console.log('Remove customer computer:', index);
    // This would remove a customer computer node from the diagram
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <DiagramControls
        onManualSave={manualSave}
        onValidateEquipment={handleValidateEquipment}
        onValidateDiagram={handleValidateDiagram}
        validationResults={validationResults}
        isValidating={isValidating}
      />
      
      {/* Photos Button */}
      <div className="absolute top-16 left-4 z-20">
        <Sheet open={isPhotosPanelOpen} onOpenChange={setIsPhotosPanelOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm shadow-md hover:bg-gray-50 border-gray-300"
            >
              <Camera className="h-4 w-4 mr-2" />
              Photos
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-96 p-0">
            <JobPhotoPanel jobId={job.id} jobName={job.name} />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="flex-1 flex gap-4">
        <JobDiagramSidebar
          nodes={nodes}
          edges={edges}
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
          onEquipmentSelect={handleEquipmentSelect}
          onAddShearstreamBox={handleAddShearstreamBox}
          onRemoveShearstreamBox={handleRemoveShearstreamBox}
          onAddStarlink={handleAddStarlink}
          onRemoveStarlink={handleRemoveStarlink}
          onAddCustomerComputer={handleAddCustomerComputerWrapper}
          onRemoveCustomerComputer={handleRemoveCustomerComputer}
        />

        <JobDiagramCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={enhancedOnNodesChange}
          onEdgesChange={enhancedOnEdgesChange}
          onConnect={enhancedOnConnect}
          reactFlowWrapper={reactFlowWrapper}
        />
      </div>
    </div>
  );
};

export default JobDiagram;
