
import React from 'react';
import { Node } from '@xyflow/react';
import WellConfigurationPanel from './WellConfigurationPanel';
import EquipmentSelectionPanel from './EquipmentSelectionPanel';
import ExtrasOnLocationPanel from './ExtrasOnLocationPanel';
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
}) => {
  // Get well and wellside gauge nodes for configuration
  const wellNodes = nodes.filter(node => node.type === 'well');
  const wellsideGaugeNode = nodes.find(node => node.type === 'wellsideGauge');
  
  // Calculate counts from nodes
  const shearstreamBoxCount = nodes.filter(node => node.type === 'mainBox').length;
  const customerComputerCount = nodes.filter(node => node.type === 'customerComputer').length;
  const hasWellsideGauge = !!wellsideGaugeNode;

  // Enhanced handlers for equipment management
  const handleEquipmentSelect = (type: 'shearstream-box' | 'starlink' | 'customer-computer', equipmentId: string, index?: number) => {
    console.log('Equipment select:', type, equipmentId, index);
    // This functionality would need to be implemented in the parent component
  };

  const handleAddShearstreamBox = () => {
    console.log('Add shearstream box');
    // This functionality would need to be implemented in the parent component
  };

  const handleRemoveShearstreamBox = (index: number) => {
    console.log('Remove shearstream box:', index);
    // This functionality would need to be implemented in the parent component
  };

  // New handlers for Starlink management
  const handleAddStarlink = () => {
    console.log('Add starlink');
    // This functionality would need to be implemented in the parent component
  };

  const handleRemoveStarlink = (index: number) => {
    console.log('Remove starlink:', index);
    // This functionality would need to be implemented in the parent component
  };

  // New handlers for Customer Computer management
  const handleAddCustomerComputer = () => {
    console.log('Add customer computer');
    // This functionality would need to be implemented in the parent component
  };

  const handleRemoveCustomerComputer = (index: number) => {
    console.log('Remove customer computer:', index);
    // This functionality would need to be implemented in the parent component
  };

  return (
    <div className="w-80 space-y-4 p-4 bg-gray-50 overflow-y-auto">
      <EquipmentSelectionPanel
        selectedShearstreamBoxes={selectedShearstreamBoxes}
        selectedStarlink={selectedStarlink}
        selectedCustomerComputers={selectedCustomerComputers}
        customerComputerCount={customerComputerCount}
        shearstreamBoxCount={shearstreamBoxCount}
        onEquipmentSelect={handleEquipmentSelect}
        onAddShearstreamBox={handleAddShearstreamBox}
        onRemoveShearstreamBox={handleRemoveShearstreamBox}
        onAddStarlink={handleAddStarlink}
        onRemoveStarlink={handleRemoveStarlink}
        onAddCustomerComputer={handleAddCustomerComputer}
        onRemoveCustomerComputer={handleRemoveCustomerComputer}
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
    </div>
  );
};

export default JobDiagramSidebar;
