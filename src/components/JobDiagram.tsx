
import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { Cable, Route, Download, Square, Monitor, Satellite } from 'lucide-react';
import MainBoxNode from './nodes/MainBoxNode';
import WellNode from './nodes/WellNode';
import YAdapterNode from './nodes/YAdapterNode';
import CompanyComputerNode from './nodes/CompanyComputerNode';
import SatelliteNode from './nodes/SatelliteNode';
import CableEdge from './edges/CableEdge';

const nodeTypes = {
  mainBox: MainBoxNode,
  well: WellNode,
  yAdapter: YAdapterNode,
  companyComputer: CompanyComputerNode,
  satellite: SatelliteNode,
};

const edgeTypes = {
  cable: CableEdge,
};

interface Job {
  id: string;
  name: string;
  wellCount: number;
  createdAt: Date;
}

interface JobDiagramProps {
  job: Job;
}

const JobDiagram: React.FC<JobDiagramProps> = ({ job }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedCableType, setSelectedCableType] = useState<'100ft' | '200ft' | '300ft'>('200ft');
  const [nodeIdCounter, setNodeIdCounter] = useState(0);
  const [mainBoxName, setMainBoxName] = useState('SS001');
  const [companyComputerName, setCompanyComputerName] = useState('Company Computer');
  const [satelliteName, setSatelliteName] = useState('Starlink');

  const initializeJob = useCallback(() => {
    const initialNodes: Node[] = [];
    
    // Create main box node
    const mainBoxNode: Node = {
      id: 'main-box',
      type: 'mainBox',
      position: { x: 50, y: 100 },
      data: { label: mainBoxName },
      draggable: false,
    };
    initialNodes.push(mainBoxNode);

    // Create company computer node
    const companyComputerNode: Node = {
      id: 'company-computer',
      type: 'companyComputer',
      position: { x: 50, y: 300 },
      data: { label: companyComputerName },
      draggable: true,
    };
    initialNodes.push(companyComputerNode);

    // Create satellite node
    const satelliteNode: Node = {
      id: 'satellite',
      type: 'satellite',
      position: { x: 50, y: 500 },
      data: { label: satelliteName },
      draggable: true,
    };
    initialNodes.push(satelliteNode);

    // Create well nodes in a grid layout
    const wellsPerRow = Math.ceil(job.wellCount / 2);
    for (let i = 0; i < job.wellCount; i++) {
      const row = Math.floor(i / wellsPerRow);
      const col = i % wellsPerRow;
      const wellNode: Node = {
        id: `well-${i + 1}`,
        type: 'well',
        position: { 
          x: 400 + (col * 200), 
          y: 50 + (row * 150) 
        },
        data: { 
          label: `Well ${i + 1}`,
          wellNumber: i + 1,
          color: '#3b82f6'
        },
      };
      initialNodes.push(wellNode);
    }

    setNodes(initialNodes);
    setEdges([]);
    setNodeIdCounter(job.wellCount + 3);
  }, [job, setNodes, setEdges, mainBoxName, companyComputerName, satelliteName]);

  // Initialize the diagram when component mounts or names change
  React.useEffect(() => {
    initializeJob();
  }, [initializeJob]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'cable',
        data: { 
          cableType: selectedCableType,
          label: selectedCableType
        },
        style: {
          stroke: selectedCableType === '100ft' ? '#ef4444' : 
                 selectedCableType === '200ft' ? '#3b82f6' : '#10b981',
          strokeWidth: 3,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
      toast.success(`${selectedCableType} cable connected!`);
    },
    [selectedCableType, setEdges]
  );

  const addYAdapter = () => {
    const newYAdapter: Node = {
      id: `y-adapter-${nodeIdCounter}`,
      type: 'yAdapter',
      position: { x: 250 + (nodeIdCounter * 30), y: 200 + (nodeIdCounter * 30) },
      data: { label: 'Y Adapter' },
    };
    
    setNodes((nds) => [...nds, newYAdapter]);
    setNodeIdCounter(prev => prev + 1);
    toast.success('Y Adapter added!');
  };

  const updateWellName = (wellId: string, newName: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === wellId 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  };

  const updateWellColor = (wellId: string, newColor: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === wellId 
          ? { ...node, data: { ...node.data, color: newColor } }
          : node
      )
    );
  };

  const clearDiagram = () => {
    initializeJob();
    toast.success('Diagram cleared!');
  };

  const saveDiagram = async () => {
    if (!reactFlowWrapper.current) return;
    
    try {
      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${job.name}-cable-diagram.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Diagram saved successfully!');
    } catch (error) {
      toast.error('Failed to save diagram');
      console.error('Save error:', error);
    }
  };

  const wellNodes = nodes.filter(node => node.type === 'well');

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Cable Configuration Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
            <div>
              <Label htmlFor="cable-type">Cable Type</Label>
              <Select value={selectedCableType} onValueChange={(value: any) => setSelectedCableType(value)}>
                <SelectTrigger id="cable-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100ft">100ft Cable</SelectItem>
                  <SelectItem value="200ft">200ft Cable</SelectItem>
                  <SelectItem value="300ft">300ft Reel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={addYAdapter} variant="outline" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Add Y Adapter
            </Button>
            
            <Button onClick={clearDiagram} variant="outline">
              Clear Diagram
            </Button>
            
            <Button onClick={saveDiagram} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Save Diagram
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="main-box-name">Main Box Name</Label>
              <Input
                id="main-box-name"
                value={mainBoxName}
                onChange={(e) => setMainBoxName(e.target.value)}
                placeholder="SS001"
              />
            </div>
            
            <div>
              <Label htmlFor="computer-name">Company Computer</Label>
              <Input
                id="computer-name"
                value={companyComputerName}
                onChange={(e) => setCompanyComputerName(e.target.value)}
                placeholder="Company Computer"
              />
            </div>
            
            <div>
              <Label htmlFor="satellite-name">Satellite Name</Label>
              <Input
                id="satellite-name"
                value={satelliteName}
                onChange={(e) => setSatelliteName(e.target.value)}
                placeholder="Starlink"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {wellNodes.length > 0 && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Well Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wellNodes.map((wellNode) => (
                <div key={wellNode.id} className="flex items-center gap-2 p-2 border rounded">
                  <div className="flex-1">
                    <Label htmlFor={`well-name-${wellNode.id}`}>Well Name</Label>
                    <Input
                      id={`well-name-${wellNode.id}`}
                      value={wellNode.data.label}
                      onChange={(e) => updateWellName(wellNode.id, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`well-color-${wellNode.id}`}>Color</Label>
                    <Select
                      value={wellNode.data.color}
                      onValueChange={(color) => updateWellColor(wellNode.id, color)}
                    >
                      <SelectTrigger id={`well-color-${wellNode.id}`} className="w-24 mt-1">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: wellNode.data.color }}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#3b82f6">Blue</SelectItem>
                        <SelectItem value="#ef4444">Red</SelectItem>
                        <SelectItem value="#10b981">Green</SelectItem>
                        <SelectItem value="#f59e0b">Orange</SelectItem>
                        <SelectItem value="#8b5cf6">Purple</SelectItem>
                        <SelectItem value="#06b6d4">Cyan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white shadow-lg">
        <CardContent className="p-2">
          <div className="h-[600px] border rounded-lg" ref={reactFlowWrapper}>
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

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Cable className="h-5 w-5" />
            Cable Connection Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p><strong>300ft Reels:</strong> Connect from Main Box → Y Adapter → Well + 100ft Cable → Second Well</p>
          <p><strong>200ft Cables:</strong> Connect directly Main Box → Well (rare: add Y Adapter + 100ft for 2 wells)</p>
          <p><strong>100ft Cables:</strong> Always connect through Y Adapter to reach additional wells</p>
          <p><strong>COM Ports:</strong> P1(COM1,2) | P2(COM3,4) | P3(COM5,6) | P4(COM7,8)</p>
          <p><strong>Delete Connections:</strong> Select any cable connection and press Delete key</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDiagram;
