
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Camera } from 'lucide-react';
import DiagramCanvas from './DiagramCanvas';
import ConnectionGuide from './ConnectionGuide';
import JobDiagramPanels from './JobDiagramPanels';
import JobPhotoPanel from './JobPhotoPanel';
import FloatingDiagramControls from './FloatingDiagramControls';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

interface JobDiagramContentProps {
  job: Job;
  nodes: Node[];
  edges: any[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  selectedCableType: string;
  setSelectedCableType: (type: string) => void;
  selectedShearstreamBoxes: string[];
  selectedStarlink: string;
  selectedCustomerComputers: string[];
  onEquipmentSelect: (type: 'shearstream-box' | 'starlink' | 'customer-computer', equipmentId: string, index?: number) => void;
  onAddShearstreamBox: () => void;
  onRemoveShearstreamBox: (index: number) => void;
  addYAdapter: () => void;
  addCustomerComputer: () => void;
  clearDiagram: () => void;
  saveDiagram: () => void;
  updateWellName: (wellId: string, newName: string) => void;
  updateWellColor: (wellId: string, newColor: string) => void;
  updateWellsideGaugeName: (name: string) => void;
  updateWellsideGaugeColor: (newColor: string) => void;
}

const JobDiagramContent: React.FC<JobDiagramContentProps> = ({
  job,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  reactFlowWrapper,
  selectedCableType,
  setSelectedCableType,
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCustomerComputers,
  onEquipmentSelect,
  onAddShearstreamBox,
  onRemoveShearstreamBox,
  addYAdapter,
  addCustomerComputer,
  clearDiagram,
  saveDiagram,
  updateWellName,
  updateWellColor,
  updateWellsideGaugeName,
  updateWellsideGaugeColor,
}) => {
  const [isPhotosPanelOpen, setIsPhotosPanelOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-3">
      {/* Compact Configuration Grid */}
      <JobDiagramPanels
        job={job}
        nodes={nodes}
        edges={edges}
        selectedCableType={selectedCableType}
        setSelectedCableType={setSelectedCableType}
        selectedShearstreamBoxes={selectedShearstreamBoxes}
        selectedStarlink={selectedStarlink}
        selectedCustomerComputers={selectedCustomerComputers}
        onEquipmentSelect={onEquipmentSelect}
        onAddShearstreamBox={onAddShearstreamBox}
        onRemoveShearstreamBox={onRemoveShearstreamBox}
        addYAdapter={addYAdapter}
        addCustomerComputer={addCustomerComputer}
        clearDiagram={clearDiagram}
        saveDiagram={saveDiagram}
        updateWellName={updateWellName}
        updateWellColor={updateWellColor}
        updateWellsideGaugeName={updateWellsideGaugeName}
        updateWellsideGaugeColor={updateWellsideGaugeColor}
      />

      {/* Diagram Section */}
      <div className="relative bg-white rounded-lg border shadow-sm">
        {/* Top Controls Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          {/* Photos Button */}
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

          {/* Floating Diagram Controls */}
          <div className="flex gap-2">
            <FloatingDiagramControls
              selectedCableType={selectedCableType}
              setSelectedCableType={setSelectedCableType}
              addYAdapter={addYAdapter}
              onAddShearstreamBox={onAddShearstreamBox}
              addCustomerComputer={addCustomerComputer}
            />
          </div>
        </div>

        {/* Diagram Canvas */}
        <div className="h-[600px]">
          <DiagramCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            reactFlowWrapper={reactFlowWrapper}
          />
        </div>
      </div>

      {/* Connection Guide */}
      <ConnectionGuide />
    </div>
  );
};

export default JobDiagramContent;
