
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
import { useStarlinkCustomerComputerHandlers } from '@/hooks/useStarlinkCustomerComputerHandlers';
import { useRobustEquipmentTracking } from '@/hooks/useRobustEquipmentTracking';
import { useEquipmentValidation } from '@/hooks/equipment/useEquipmentValidation';
import { useInventoryMapperSync } from '@/hooks/useInventoryMapperSync';
import { JobDiagram as JobDiagramType } from '@/hooks/useSupabaseJobs';

// Import components
import DiagramControls from '@/components/diagram/DiagramControls';
import JobDiagramSidebar from '@/components/diagram/JobDiagramSidebar';
import JobDiagramCanvas from '@/components/diagram/JobDiagramCanvas';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Camera, Package, AlertTriangle } from 'lucide-react';
import JobPhotoPanel from '@/components/diagram/JobPhotoPanel';
import CompactJobEquipmentPanel from '@/components/diagram/CompactJobEquipmentPanel';

interface JobDiagramProps {
  job: JobDiagramType;
}

const JobDiagram: React.FC<JobDiagramProps> = ({ job }) => {
  const [isPhotosPanelOpen, setIsPhotosPanelOpen] = useState(false);
  const [isEquipmentPanelOpen, setIsEquipmentPanelOpen] = useState(false);

  // Initialize inventory mapper sync
  const {
    isValidating: isSyncValidating,
    conflicts,
    allocations,
    validateEquipmentAvailability,
    allocateEquipment,
    releaseEquipment,
    resolveConflict,
    syncInventoryStatus,
    getEquipmentStatus,
    getJobEquipment
  } = useInventoryMapperSync();

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

  const {
    extrasOnLocation,
    handleAddExtra,
    handleRemoveExtra,
  } = useExtrasOnLocation();

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
    extrasOnLocation,
  });

  // Equipment tracking and validation
  const {
    validateInventoryConsistency,
    analyzeEquipmentUsage,
  } = useRobustEquipmentTracking(job.id, nodes, edges);

  const { runFullValidation } = useEquipmentValidation();

  // Enhanced connection handler with immediate save for edge toggles
  const enhancedOnConnect = useCallback((connection: any) => {
    onConnect(connection);
    setTimeout(() => immediateSave(), 100);
  }, [onConnect, immediateSave]);

  // Enhanced edges change handler to detect Y→Well toggles
  const enhancedOnEdgesChange = useCallback((changes: any[]) => {
    onEdgesChange(changes);
    
    const hasEdgeUpdate = changes.some(change => 
      change.type === 'reset' || 
      (change.type === 'replace' && change.item) ||
      (change.item && (change.item.type === 'direct' || change.item.data?.connectionType === 'direct'))
    );
    
    if (hasEdgeUpdate) {
      setTimeout(() => immediateSave(), 100);
    }
  }, [onEdgesChange, immediateSave]);

  // Enhanced nodes change handler to detect COM port changes
  const enhancedOnNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    
    const hasMainBoxUpdate = changes.some(change => 
      change.type === 'reset' || 
      (change.item && change.item.type === 'mainBox')
    );
    
    if (hasMainBoxUpdate) {
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

  // Add equipment handlers with sync integration
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
    // Pass sync methods
    validateEquipmentAvailability,
    allocateEquipment,
    releaseEquipment,
  });

  // Add Starlink and Customer Computer handlers
  const {
    handleAddStarlink,
    handleRemoveStarlink,
    handleAddCustomerComputer: handleAddCustomerComputerWrapper,
    handleRemoveCustomerComputer,
  } = useStarlinkCustomerComputerHandlers({
    setNodes,
    nodeIdCounter,
    setNodeIdCounter,
  });

  const handleValidateEquipment = useCallback(async () => {
    const isConsistent = validateInventoryConsistency();
    if (!isConsistent) {
      await runFullValidation();
    }
  }, [validateInventoryConsistency, runFullValidation]);

  // Get equipment status for UI indicators
  const usage = analyzeEquipmentUsage();
  const totalEquipmentRequired = Object.values(usage.cables).reduce((sum, cable) => sum + cable.quantity, 0) + 
                                usage.gauges + usage.adapters + usage.computers + usage.satellite;

  return (
    <div className="w-full h-screen flex flex-col">
      <DiagramControls
        onManualSave={manualSave}
        onValidateEquipment={handleValidateEquipment}
        onValidateDiagram={handleValidateDiagram}
        validationResults={validationResults}
        isValidating={isValidating}
      />
      
      {/* Action Buttons */}
      <div className="absolute top-16 left-4 z-20 flex gap-2">
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

        <Sheet open={isEquipmentPanelOpen} onOpenChange={setIsEquipmentPanelOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/95 backdrop-blur-sm shadow-md hover:bg-gray-50 border-gray-300"
            >
              <Package className="h-4 w-4 mr-2" />
              Equipment
              {totalEquipmentRequired > 0 && (
                <span className="ml-1 px-1 bg-blue-500 text-white text-xs rounded">
                  {totalEquipmentRequired}
                </span>
              )}
              {conflicts.length > 0 && (
                <span className="ml-1 px-1 bg-red-500 text-white text-xs rounded">
                  {conflicts.length} conflicts
                </span>
              )}
              {!validateInventoryConsistency() && (
                <AlertTriangle className="h-3 w-3 ml-1 text-yellow-500" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-96 p-4">
            <CompactJobEquipmentPanel
              jobId={job.id}
              jobName={job.name}
              nodes={nodes}
              edges={edges}
            />
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
          // Pass sync data
          getEquipmentStatus={getEquipmentStatus}
          conflicts={conflicts}
          resolveConflict={resolveConflict}
        />

        <JobDiagramCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={enhancedOnNodesChange}
          onEdgesChange={enhancedOnEdgesChange}
          onConnect={enhancedOnConnect}
          reactFlowWrapper={reactFlowWrapper}
          immediateSave={immediateSave}
        />
      </div>
    </div>
  );
};

export default JobDiagram;
