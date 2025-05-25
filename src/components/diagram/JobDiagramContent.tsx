
import React from 'react';
import { Node } from '@xyflow/react';
import DiagramCanvas from './DiagramCanvas';
import ConnectionGuide from './ConnectionGuide';
import JobDiagramPanels from './JobDiagramPanels';

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
  selectedCompanyComputers: string[];
  onEquipmentSelect: (type: 'shearstream-box' | 'starlink' | 'company-computer', equipmentId: string, index?: number) => void;
  onAddShearstreamBox: () => void;
  onRemoveShearstreamBox: (index: number) => void;
  addYAdapter: () => void;
  addCompanyComputer: () => void;
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
  selectedCompanyComputers,
  onEquipmentSelect,
  onAddShearstreamBox,
  onRemoveShearstreamBox,
  addYAdapter,
  addCompanyComputer,
  clearDiagram,
  saveDiagram,
  updateWellName,
  updateWellColor,
  updateWellsideGaugeName,
  updateWellsideGaugeColor,
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-2">
      {/* Compact Configuration Grid */}
      <JobDiagramPanels
        job={job}
        nodes={nodes}
        edges={edges}
        selectedCableType={selectedCableType}
        setSelectedCableType={setSelectedCableType}
        selectedShearstreamBoxes={selectedShearstreamBoxes}
        selectedStarlink={selectedStarlink}
        selectedCompanyComputers={selectedCompanyComputers}
        onEquipmentSelect={onEquipmentSelect}
        onAddShearstreamBox={onAddShearstreamBox}
        onRemoveShearstreamBox={onRemoveShearstreamBox}
        addYAdapter={addYAdapter}
        addCompanyComputer={addCompanyComputer}
        clearDiagram={clearDiagram}
        saveDiagram={saveDiagram}
        updateWellName={updateWellName}
        updateWellColor={updateWellColor}
        updateWellsideGaugeName={updateWellsideGaugeName}
        updateWellsideGaugeColor={updateWellsideGaugeColor}
      />

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

export default JobDiagramContent;
