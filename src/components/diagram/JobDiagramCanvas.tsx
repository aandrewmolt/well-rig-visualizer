
import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ReactFlowProvider,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

// Import all node types
import WellNode from '@/components/nodes/WellNode';
import YAdapterNode from '@/components/nodes/YAdapterNode';
import MainBoxNode from '@/components/nodes/MainBoxNode';
import SatelliteNode from '@/components/nodes/SatelliteNode';
import CustomerComputerNode from '@/components/nodes/CustomerComputerNode';
import WellsideGaugeNode from '@/components/nodes/WellsideGaugeNode';

// Import edge types
import InteractiveCableEdge from '@/components/edges/InteractiveCableEdge';

const nodeTypes = {
  well: WellNode,
  yAdapter: YAdapterNode,
  mainBox: MainBoxNode,
  satellite: SatelliteNode,
  customerComputer: CustomerComputerNode,
  wellsideGauge: WellsideGaugeNode,
};

const edgeTypes = {
  cable: InteractiveCableEdge,
  direct: InteractiveCableEdge, // Use InteractiveCableEdge for both types
  default: InteractiveCableEdge,
};

interface JobDiagramCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  immediateSave?: () => void;
}

const JobDiagramCanvas: React.FC<JobDiagramCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  reactFlowWrapper,
  immediateSave,
}) => {
  // Enhanced edges with immediateSave function
  const enhancedEdges = React.useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      data: {
        ...edge.data,
        immediateSave,
      },
    }));
  }, [edges, immediateSave]);

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={enhancedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-50"
          defaultEdgeOptions={{
            type: 'cable',
            animated: false,
          }}
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeStrokeColor="#374151"
            nodeColor="#f3f4f6"
            nodeBorderRadius={8}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default JobDiagramCanvas;
