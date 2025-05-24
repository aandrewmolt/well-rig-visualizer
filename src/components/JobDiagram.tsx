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
import { Cable, Route, Download, Square, Monitor, Satellite, Gauge } from 'lucide-react';
import MainBoxNode from './nodes/MainBoxNode';
import WellNode from './nodes/WellNode';
import YAdapterNode from './nodes/YAdapterNode';
import CompanyComputerNode from './nodes/CompanyComputerNode';
import SatelliteNode from './nodes/SatelliteNode';
import WellsideGaugeNode from './nodes/WellsideGaugeNode';
import CableEdge from './edges/CableEdge';

const nodeTypes = {
  mainBox: MainBoxNode,
  well: WellNode,
  yAdapter: YAdapterNode,
  companyComputer: CompanyComputerNode,
  satellite: SatelliteNode,
  wellsideGauge: WellsideGaugeNode,
};

const edgeTypes = {
  cable: CableEdge,
};

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
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
  const [wellsideGaugeName, setWellsideGaugeName] = useState('Wellside Gauge');

  const updateMainBoxName = (newName: string) => {
    setMainBoxName(newName);
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'main-box' 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  };

  const updateCompanyComputerName = (newName: string) => {
    setCompanyComputerName(newName);
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'company-computer' 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  };

  const updateSatelliteName = (newName: string) => {
    setSatelliteName(newName);
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'satellite' 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  };

  const updateWellsideGaugeName = (newName: string) => {
    setWellsideGaugeName(newName);
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'wellside-gauge' 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  };

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

    // Create wellside gauge if enabled
    if (job.hasWellsideGauge) {
      const wellsideGaugeNode: Node = {
        id: 'wellside-gauge',
        type: 'wellsideGauge',
        position: { x: 400, y: 350 },
        data: { 
          label: wellsideGaugeName,
          color: '#f59e0b'
        },
      };
      initialNodes.push(wellsideGaugeNode);
    }

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
    setNodeIdCounter(job.wellCount + (job.hasWellsideGauge ? 4 : 3));
  }, [job, mainBoxName, companyComputerName, satelliteName, wellsideGaugeName, setNodes, setEdges]);

  // Initialize the diagram when component mounts or names change
  React.useEffect(() => {
    initializeJob();
  }, [initializeJob]);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (selectedCableType === '300ft') {
        // 300ft cables can only connect from main box to Y adapter
        if (sourceNode?.type === 'mainBox' && targetNode?.type !== 'yAdapter') {
          toast.error('300ft cables can only connect from Main Box to Y Adapters!');
          return;
        }
        if (sourceNode?.type !== 'mainBox' && sourceNode?.type !== 'yAdapter') {
          toast.error('300ft cables must originate from Main Box or Y Adapter!');
          return;
        }
      }

      // Y Adapters can connect directly to wells without cable type restrictions
      if (sourceNode?.type === 'yAdapter') {
        // Allow direct connection from Y adapter to wells or wellside gauge
        if (targetNode?.type === 'well' || targetNode?.type === 'wellsideGauge') {
          // No cable type validation needed for Y adapter direct connections
        }
      }

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
    [selectedCableType, setEdges, nodes]
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

  const updateWellsideGaugeColor = (newColor: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'wellside-gauge' 
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
  const wellsideGaugeNode = nodes.find(node => node.type === 'wellsideGauge');

  return (
    <div className="max-w-7xl mx-auto space-y-2">
      {/* Configuration Sections - Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cable Configuration Tools */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="h-4 w-4" />
              Cable Configuration Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
              <div>
                <Label htmlFor="cable-type" className="text-sm">Cable Type</Label>
                <Select value={selectedCableType} onValueChange={(value: any) => setSelectedCableType(value)}>
                  <SelectTrigger id="cable-type" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100ft">100ft Cable</SelectItem>
                    <SelectItem value="200ft">200ft Cable</SelectItem>
                    <SelectItem value="300ft">300ft Reel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={addYAdapter} variant="outline" size="sm" className="flex items-center gap-2 h-8">
                <Square className="h-3 w-3" />
                Add Y Adapter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button onClick={clearDiagram} variant="outline" size="sm" className="h-8">
                Clear Diagram
              </Button>
              
              <Button onClick={saveDiagram} size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2 h-8">
                <Download className="h-3 w-3" />
                Save Diagram
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <Label htmlFor="main-box-name" className="text-sm">Main Box Name</Label>
                <Input
                  id="main-box-name"
                  value={mainBoxName}
                  onChange={(e) => updateMainBoxName(e.target.value)}
                  placeholder="SS001"
                  className="h-8"
                />
              </div>
              
              <div>
                <Label htmlFor="computer-name" className="text-sm">Company Computer</Label>
                <Input
                  id="computer-name"
                  value={companyComputerName}
                  onChange={(e) => updateCompanyComputerName(e.target.value)}
                  placeholder="Company Computer"
                  className="h-8"
                />
              </div>
              
              <div>
                <Label htmlFor="satellite-name" className="text-sm">Satellite Name</Label>
                <Input
                  id="satellite-name"
                  value={satelliteName}
                  onChange={(e) => updateSatelliteName(e.target.value)}
                  placeholder="Starlink"
                  className="h-8"
                />
              </div>

              {job.hasWellsideGauge && (
                <div>
                  <Label htmlFor="wellside-gauge-name" className="text-sm">Wellside Gauge Name</Label>
                  <Input
                    id="wellside-gauge-name"
                    value={wellsideGaugeName}
                    onChange={(e) => updateWellsideGaugeName(e.target.value)}
                    placeholder="Wellside Gauge"
                    className="h-8"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Well and Gauge Configuration */}
        {(wellNodes.length > 0 || wellsideGaugeNode) && (
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Well & Gauge Configuration</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                {wellsideGaugeNode && (
                  <div className="flex items-center gap-2 p-2 border rounded bg-orange-50">
                    <div className="flex-1">
                      <Label htmlFor="wellside-gauge-name-config" className="text-xs flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        Gauge Name
                      </Label>
                      <Input
                        id="wellside-gauge-name-config"
                        value={wellsideGaugeNode.data.label}
                        onChange={(e) => updateWellsideGaugeName(e.target.value)}
                        className="h-7 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wellside-gauge-color" className="text-xs">Color</Label>
                      <Select
                        value={wellsideGaugeNode.data.color}
                        onValueChange={(color) => updateWellsideGaugeColor(color)}
                      >
                        <SelectTrigger id="wellside-gauge-color" className="w-20 h-7">
                          <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: wellsideGaugeNode.data.color }}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="#f59e0b">Orange</SelectItem>
                          <SelectItem value="#3b82f6">Blue</SelectItem>
                          <SelectItem value="#ef4444">Red</SelectItem>
                          <SelectItem value="#10b981">Green</SelectItem>
                          <SelectItem value="#8b5cf6">Purple</SelectItem>
                          <SelectItem value="#06b6d4">Cyan</SelectItem>
                          <SelectItem value="#eab308">Yellow</SelectItem>
                          <SelectItem value="#ffffff">White</SelectItem>
                          <SelectItem value="#000000">Black</SelectItem>
                          <SelectItem value="#6b7280">Grey</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {wellNodes.map((wellNode) => (
                  <div key={wellNode.id} className="flex items-center gap-2 p-2 border rounded">
                    <div className="flex-1">
                      <Label htmlFor={`well-name-${wellNode.id}`} className="text-xs">Well Name</Label>
                      <Input
                        id={`well-name-${wellNode.id}`}
                        value={wellNode.data.label}
                        onChange={(e) => updateWellName(wellNode.id, e.target.value)}
                        className="h-7 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`well-color-${wellNode.id}`} className="text-xs">Color</Label>
                      <Select
                        value={wellNode.data.color}
                        onValueChange={(color) => updateWellColor(wellNode.id, color)}
                      >
                        <SelectTrigger id={`well-color-${wellNode.id}`} className="w-20 h-7">
                          <div 
                            className="w-3 h-3 rounded" 
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
                          <SelectItem value="#eab308">Yellow</SelectItem>
                          <SelectItem value="#ffffff">White</SelectItem>
                          <SelectItem value="#000000">Black</SelectItem>
                          <SelectItem value="#6b7280">Grey</SelectItem>
                          <SelectItem value="#84cc16">Lime</SelectItem>
                          <SelectItem value="#ec4899">Pink</SelectItem>
                          <SelectItem value="#f97316">Dark Orange</SelectItem>
                          <SelectItem value="#14b8a6">Teal</SelectItem>
                          <SelectItem value="#a855f7">Violet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diagram Section - Larger Height */}
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

      {/* Connection Guide - Compact */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-1">
          <CardTitle className="text-blue-800 flex items-center gap-2 text-base">
            <Cable className="h-4 w-4" />
            Cable Connection Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-blue-700 space-y-1 pt-0">
          <p><strong>300ft Reels:</strong> Connect from Main Box → Y Adapter → Wells (direct connection from Y adapter)</p>
          <p><strong>200ft Cables:</strong> Connect directly Main Box → Well (or add Y Adapter for multiple wells)</p>
          <p><strong>100ft Cables:</strong> Can connect through Y Adapter or directly to wells/gauges</p>
          <p><strong>Y Adapters:</strong> Can connect directly to wells and wellside gauges without cable restrictions</p>
          <p><strong>COM Ports:</strong> P1(COM1,2) | P2(COM3,4) | P3(COM5,6) | P4(COM7,8)</p>
          <p><strong>Delete Connections:</strong> Select any cable connection and press Delete key</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDiagram;
