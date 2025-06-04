
import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
} from '@xyflow/react';

// Import node types
import MainBoxNode from '@/components/nodes/MainBoxNode';
import SatelliteNode from '@/components/nodes/SatelliteNode';
import WellNode from '@/components/nodes/WellNode';
import WellsideGaugeNode from '@/components/nodes/WellsideGaugeNode';
import YAdapterNode from '@/components/nodes/YAdapterNode';
import CustomerComputerNode from '@/components/nodes/CustomerComputerNode';

// Import edge types
import CableEdge from '@/components/edges/CableEdge';
import DirectEdge from '@/components/edges/DirectEdge';
import InteractiveCableEdge from '@/components/edges/InteractiveCableEdge';

const nodeTypes = {
  mainBox: MainBoxNode,
  satellite: SatelliteNode,
  well: WellNode,
  wellsideGauge: WellsideGaugeNode,
  yAdapter: YAdapterNode,
  customerComputer: CustomerComputerNode,
};

const edgeTypes = {
  cable: InteractiveCableEdge,
  direct: DirectEdge,
  smoothstep: CableEdge,
  default: InteractiveCableEdge,
};

interface JobDiagramCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
}

const JobDiagramCanvas: React.FC<JobDiagramCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  reactFlowWrapper,
}) => {
  return (
    <div className="flex-1" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gradient-to-br from-blue-50 to-indigo-100"
        defaultEdgeOptions={{
          style: { strokeWidth: 3, stroke: '#374151' },
          type: 'cable',
          animated: false,
        }}
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
  );
};

export default JobDiagramCanvas;
