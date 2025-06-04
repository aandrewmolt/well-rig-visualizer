
import React from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  Connection,
} from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import MainBoxNode from '../nodes/MainBoxNode';
import WellNode from '../nodes/WellNode';
import YAdapterNode from '../nodes/YAdapterNode';
import CustomerComputerNode from '../nodes/CustomerComputerNode';
import SatelliteNode from '../nodes/SatelliteNode';
import WellsideGaugeNode from '../nodes/WellsideGaugeNode';
import CableEdge from '../edges/CableEdge';
import DirectEdge from '../edges/DirectEdge';

const nodeTypes = {
  mainBox: MainBoxNode,
  well: WellNode,
  yAdapter: YAdapterNode,
  customerComputer: CustomerComputerNode,
  satellite: SatelliteNode,
  wellsideGauge: WellsideGaugeNode,
};

const edgeTypes = {
  cable: CableEdge,
  direct: DirectEdge,
};

interface DiagramCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  reactFlowWrapper,
}) => {
  // Enhanced logging for debugging
  React.useEffect(() => {
    console.log('DiagramCanvas rendered with:', {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      edges: edges.map(e => ({ id: e.id, type: e.type, source: e.source, target: e.target }))
    });
  }, [nodes, edges]);

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-1">
        <div className="h-[900px] border rounded-lg" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
            style={{ backgroundColor: '#f8fafc' }}
            deleteKeyCode={null} // Prevent accidental deletion
            multiSelectionKeyCode={null} // Simplify selection
          >
            <Controls position="top-left" />
            <MiniMap 
              position="top-right" 
              style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              color="#e2e8f0" 
            />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagramCanvas;
