
import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { useJobDiagramCore } from '@/hooks/useJobDiagramCore';
import { useJobDiagramSave } from '@/hooks/useJobDiagramSave';
import { useEquipmentAllocationValidator } from '@/hooks/useEquipmentAllocationValidator';
import { JobDiagram as JobDiagramType } from '@/hooks/useSupabaseJobs';

// Import node types
import MainBoxNode from '@/components/nodes/MainBoxNode';
import SatelliteNode from '@/components/nodes/SatelliteNode';
import WellNode from '@/components/nodes/WellNode';
import WellsideGaugeNode from '@/components/nodes/WellsideGaugeNode';
import YAdapterNode from '@/components/nodes/YAdapterNode';
import CustomerComputerNode from '@/components/nodes/CustomerComputerNode';

// Import components
import DiagramControls from '@/components/diagram/DiagramControls';
import WellConfigurationPanel from '@/components/diagram/WellConfigurationPanel';
import EquipmentSelectionPanel from '@/components/diagram/EquipmentSelectionPanel';
import ExtrasOnLocationPanel from '@/components/diagram/ExtrasOnLocationPanel';

const nodeTypes = {
  mainBox: MainBoxNode,
  satellite: SatelliteNode,
  well: WellNode,
  wellsideGauge: WellsideGaugeNode,
  yAdapter: YAdapterNode,
  customerComputer: CustomerComputerNode,
};

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

  const handleValidateEquipment = useCallback(() => {
    const issues = validateEquipmentAllocations();
    if (issues.length > 0) {
      const fixedCount = fixEquipmentAllocations(issues);
      console.log(`Fixed ${fixedCount} equipment issues`);
    }
  }, [validateEquipmentAllocations, fixEquipmentAllocations]);

  const handleValidateDiagram = useCallback(() => {
    console.log('Validating diagram integrity...');
    console.log('Nodes:', nodes.length);
    console.log('Edges:', edges.length);
    console.log('Edges with sourceHandle:', edges.filter(e => e.sourceHandle || e.data?.sourceHandle).length);
    
    const invalidEdges = edges.filter(e => !e.source || !e.target);
    if (invalidEdges.length > 0) {
      console.warn('Found invalid edges:', invalidEdges);
    } else {
      console.log('All edges are valid');
    }
  }, [nodes, edges]);

  // Get well and wellside gauge nodes for configuration
  const wellNodes = nodes.filter(node => node.type === 'well');
  const wellsideGaugeNode = nodes.find(node => node.type === 'wellsideGauge');

  const updateWellName = useCallback((wellId: string, newName: string) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.id === wellId 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  }, [setNodes]);

  const updateWellColor = useCallback((wellId: string, newColor: string) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.id === wellId 
          ? { ...node, data: { ...node.data, color: newColor } }
          : node
      )
    );
  }, [setNodes]);

  const updateWellsideGaugeColor = useCallback((newColor: string) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.type === 'wellsideGauge' 
          ? { ...node, data: { ...node.data, color: newColor } }
          : node
      )
    );
  }, [setNodes]);

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
        {/* Left sidebar with controls */}
        <div className="w-80 space-y-4 p-4 bg-gray-50 overflow-y-auto">
          <EquipmentSelectionPanel
            selectedShearstreamBoxes={selectedShearstreamBoxes}
            selectedStarlink={selectedStarlink}
            selectedCustomerComputers={selectedCustomerComputers}
            updateMainBoxName={updateMainBoxName}
            updateSatelliteName={updateSatelliteName}
            updateCustomerComputerName={updateCustomerComputerName}
          />

          <WellConfigurationPanel
            wellNodes={wellNodes}
            wellsideGaugeNode={wellsideGaugeNode}
            updateWellName={updateWellName}
            updateWellColor={updateWellColor}
            updateWellsideGaugeName={updateWellsideGaugeName}
            updateWellsideGaugeColor={updateWellsideGaugeColor}
          />

          {/* Extras on Location Panel */}
          <ExtrasOnLocationPanel 
            jobId={job.id}
            jobName={job.name}
          />
        </div>

        {/* Main diagram area */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gradient-to-br from-blue-50 to-indigo-100"
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeStrokeColor="#374151"
              nodeColor="#e5e7eb"
              nodeBorderRadius={2}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default JobDiagram;
