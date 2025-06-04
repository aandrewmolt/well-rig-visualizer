
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
  smoothstep: DirectEdge, // Use DirectEdge for smoothstep connections
  default: CableEdge, // Default edge type
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
      edges: edges.map(e => ({ 
        id: e.id, 
        type: e.type, 
        source: e.source, 
        target: e.target, 
        label: e.label || e.data?.label,
        style: e.style 
      }))
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
            defaultEdgeOptions={{
              style: { strokeWidth: 3, stroke: '#374151' },
              type: 'smoothstep',
              animated: false,
            }}
            connectionLineStyle={{ strokeWidth: 3, stroke: '#6366f1' }}
            connectionLineType="smoothstep"
          >
            <Controls position="top-left" />
            <MiniMap 
              position="top-right" 
              style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
              nodeStrokeWidth={3}
              nodeColor={(node) => {
                switch (node.type) {
                  case 'mainBox': return '#1f2937';
                  case 'satellite': return '#059669';
                  case 'customerComputer': return '#374151';
                  case 'yAdapter': return '#f59e0b';
                  case 'wellsideGauge': return '#f59e0b';
                  case 'well': return '#3b82f6';
                  default: return '#6b7280';
                }
              }}
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
