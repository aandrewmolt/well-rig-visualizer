
import React from 'react';
import { Node } from '@xyflow/react';
import CableConfigurationPanel from './CableConfigurationPanel';
import WellConfigurationPanel from './WellConfigurationPanel';
import CompactJobEquipmentPanel from './CompactJobEquipmentPanel';
import CompactEquipmentSelectionPanel from './CompactEquipmentSelectionPanel';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

interface JobDiagramPanelsProps {
  job: Job;
  nodes: Node[];
  edges: any[];
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

const JobDiagramPanels: React.FC<JobDiagramPanelsProps> = ({
  job,
  nodes,
  edges,
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
  const wellNodes = nodes.filter(node => node.type === 'well');
  const wellsideGaugeNode = nodes.find(node => node.type === 'wellsideGauge');
  const companyComputerNodes = nodes.filter(node => node.type === 'companyComputer');
  const shearstreamBoxNodes = nodes.filter(node => node.type === 'mainBox');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      <CableConfigurationPanel
        selectedCableType={selectedCableType}
        setSelectedCableType={setSelectedCableType}
        addYAdapter={addYAdapter}
        addCompanyComputer={addCompanyComputer}
        clearDiagram={clearDiagram}
        saveDiagram={saveDiagram}
      />

      <CompactEquipmentSelectionPanel
        selectedShearstreamBoxes={selectedShearstreamBoxes}
        selectedStarlink={selectedStarlink}
        selectedCompanyComputers={selectedCompanyComputers}
        companyComputerCount={companyComputerNodes.length}
        shearstreamBoxCount={shearstreamBoxNodes.length}
        onEquipmentSelect={onEquipmentSelect}
        onAddShearstreamBox={onAddShearstreamBox}
        onRemoveShearstreamBox={onRemoveShearstreamBox}
        hasWellsideGauge={job.hasWellsideGauge}
      />

      <WellConfigurationPanel
        wellNodes={wellNodes}
        wellsideGaugeNode={wellsideGaugeNode}
        updateWellName={updateWellName}
        updateWellColor={updateWellColor}
        updateWellsideGaugeName={updateWellsideGaugeName}
        updateWellsideGaugeColor={updateWellsideGaugeColor}
      />

      <CompactJobEquipmentPanel
        jobId={job.id}
        jobName={job.name}
        nodes={nodes}
        edges={edges}
      />

      {/* Optional 5th column for future expansion */}
      <div className="hidden xl:block">
        {/* Reserved for additional controls if needed */}
      </div>
    </div>
  );
};

export default JobDiagramPanels;
