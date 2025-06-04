
import React from 'react';
import { Node } from '@xyflow/react';
import WellConfigurationPanel from './WellConfigurationPanel';
import EquipmentSelectionPanel from './EquipmentSelectionPanel';
import ExtrasOnLocationPanel from './ExtrasOnLocationPanel';
import RedTagPanel from './RedTagPanel';
import { ExtrasOnLocationItem } from '@/hooks/useExtrasOnLocation';

interface JobDiagramSidebarProps {
  nodes: Node[];
  selectedShearstreamBoxes: string[];
  selectedStarlink: string;
  selectedCustomerComputers: string[];
  updateWellName: (wellId: string, newName: string) => void;
  updateWellColor: (wellId: string, newColor: string) => void;
  updateWellsideGaugeName: (name: string) => void;
  updateWellsideGaugeColor: (newColor: string) => void;
  extrasOnLocation: ExtrasOnLocationItem[];
  onAddExtra: (equipmentTypeId: string, quantity: number, reason: string, notes?: string, individualEquipmentId?: string) => void;
  onRemoveExtra: (extraId: string) => void;
  onEquipmentSelect: (type: 'shearstream-box' | 'starlink' | 'customer-computer', equipmentId: string, index?: number) => void;
  onAddShearstreamBox: () => void;
  onRemoveShearstreamBox: (index: number) => void;
  onAddStarlink: () => void;
  onRemoveStarlink: (index: number) => void;
  onAddCustomerComputer: () => void;
  onRemoveCustomerComputer: (index: number) => void;
}

const JobDiagramSidebar: React.FC<JobDiagramSidebarProps> = ({
  nodes,
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCustomerComputers,
  updateWellName,
  updateWellColor,
  updateWellsideGaugeName,
  updateWellsideGaugeColor,
  extrasOnLocation,
  onAddExtra,
  onRemoveExtra,
  onEquipmentSelect,
  onAddShearstreamBox,
  onRemoveShearstreamBox,
  onAddStarlink,
  onRemoveStarlink,
  onAddCustomerComputer,
  onRemoveCustomerComputer,
}) => {
  // Get well and wellside gauge nodes for configuration
  const wellNodes = nodes.filter(node => node.type === 'well');
  const wellsideGaugeNode = nodes.find(node => node.type === 'wellsideGauge');
  
  // Calculate counts from nodes
  const shearstreamBoxCount = nodes.filter(node => node.type === 'mainBox').length;
  const customerComputerCount = nodes.filter(node => node.type === 'customerComputer').length;
  const hasWellsideGauge = !!wellsideGaugeNode;

  return (
    <div className="w-80 space-y-4 p-4 bg-gray-50 overflow-y-auto">
      <EquipmentSelectionPanel
        selectedShearstreamBoxes={selectedShearstreamBoxes}
        selectedStarlink={selectedStarlink}
        selectedCustomerComputers={selectedCustomerComputers}
        customerComputerCount={customerComputerCount}
        shearstreamBoxCount={shearstreamBoxCount}
        onEquipmentSelect={onEquipmentSelect}
        onAddShearstreamBox={onAddShearstreamBox}
        onRemoveShearstreamBox={onRemoveShearstreamBox}
        onAddStarlink={onAddStarlink}
        onRemoveStarlink={onRemoveStarlink}
        onAddCustomerComputer={onAddCustomerComputer}
        onRemoveCustomerComputer={onRemoveCustomerComputer}
        hasWellsideGauge={hasWellsideGauge}
      />

      <WellConfigurationPanel
        wellNodes={wellNodes}
        wellsideGaugeNode={wellsideGaugeNode}
        updateWellName={updateWellName}
        updateWellColor={updateWellColor}
        updateWellsideGaugeName={updateWellsideGaugeName}
        updateWellsideGaugeColor={updateWellsideGaugeColor}
      />

      <ExtrasOnLocationPanel 
        extrasOnLocation={extrasOnLocation}
        onAddExtra={onAddExtra}
        onRemoveExtra={onRemoveExtra}
      />

      <RedTagPanel />
    </div>
  );
};

export default JobDiagramSidebar;
