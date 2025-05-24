
import React, { useCallback, useState, useRef } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import CableConfigurationPanel from './diagram/CableConfigurationPanel';
import WellConfigurationPanel from './diagram/WellConfigurationPanel';
import DiagramCanvas from './diagram/DiagramCanvas';
import ConnectionGuide from './diagram/ConnectionGuide';

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
        <CableConfigurationPanel
          selectedCableType={selectedCableType}
          setSelectedCableType={setSelectedCableType}
          mainBoxName={mainBoxName}
          updateMainBoxName={updateMainBoxName}
          companyComputerName={companyComputerName}
          updateCompanyComputerName={updateCompanyComputerName}
          satelliteName={satelliteName}
          updateSatelliteName={updateSatelliteName}
          wellsideGaugeName={wellsideGaugeName}
          updateWellsideGaugeName={updateWellsideGaugeName}
          hasWellsideGauge={job.hasWellsideGauge}
          addYAdapter={addYAdapter}
          clearDiagram={clearDiagram}
          saveDiagram={saveDiagram}
        />

        <WellConfigurationPanel
          wellNodes={wellNodes}
          wellsideGaugeNode={wellsideGaugeNode}
          updateWellName={updateWellName}
          updateWellColor={updateWellColor}
          updateWellsideGaugeName={updateWellsideGaugeName}
          updateWellsideGaugeColor={updateWellsideGaugeColor}
        />
      </div>

      {/* Diagram Section */}
      <DiagramCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        reactFlowWrapper={reactFlowWrapper}
      />

      {/* Connection Guide */}
      <ConnectionGuide />
    </div>
  );
};

export default JobDiagram;
