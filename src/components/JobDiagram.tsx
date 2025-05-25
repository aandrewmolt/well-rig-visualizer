import React, { useCallback, useState, useRef, useEffect } from 'react';
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
import JobEquipmentPanel from './diagram/JobEquipmentPanel';
import DiagramCanvas from './diagram/DiagramCanvas';
import ConnectionGuide from './diagram/ConnectionGuide';
import { useJobPersistence } from '@/hooks/useJobPersistence';
import { useEquipmentTracking } from '@/hooks/useEquipmentTracking';

interface NodeData {
  label?: string;
  color?: string;
  wellNumber?: number;
}

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
  const [mainBoxName, setMainBoxName] = useState('ShearStream Box');
  const [satelliteName, setSatelliteName] = useState('Starlink');
  const [wellsideGaugeName, setWellsideGaugeName] = useState('Wellside Gauge');
  const [companyComputerNames, setCompanyComputerNames] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const { jobData, saveJobData } = useJobPersistence(job.id);
  const { 
    usage, 
    extrasOnLocation,
    autoAllocateEquipment,
    addExtraEquipment,
    removeExtraEquipment,
    transferEquipment 
  } = useEquipmentTracking(job.id, nodes, edges);

  // Load persisted data on mount
  useEffect(() => {
    if (jobData && !isInitialized) {
      setNodes(jobData.nodes || []);
      setEdges(jobData.edges || []);
      setMainBoxName(jobData.mainBoxName || 'ShearStream Box');
      setSatelliteName(jobData.satelliteName || 'Starlink');
      setWellsideGaugeName(jobData.wellsideGaugeName || 'Wellside Gauge');
      setCompanyComputerNames(jobData.companyComputerNames || {});
      setNodeIdCounter(jobData.nodes?.length || 0);
      setIsInitialized(true);
    } else if (!jobData && !isInitialized) {
      initializeJob();
    }
  }, [jobData, isInitialized]);

  // Save data whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveJobData({
        name: job.name,
        wellCount: job.wellCount,
        hasWellsideGauge: job.hasWellsideGauge,
        nodes,
        edges,
        mainBoxName,
        satelliteName,
        wellsideGaugeName,
        companyComputerNames,
      });
    }
  }, [nodes, edges, mainBoxName, satelliteName, wellsideGaugeName, companyComputerNames, isInitialized]);

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

  const updateCompanyComputerName = (computerId: string, newName: string) => {
    setCompanyComputerNames(prev => ({ ...prev, [computerId]: newName }));
    setNodes((nds) => 
      nds.map((node) => 
        node.id === computerId 
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
    if (isInitialized) return;
    
    const initialNodes: Node[] = [];
    
    // Create main box node (ShearStream Box)
    const mainBoxNode: Node = {
      id: 'main-box',
      type: 'mainBox',
      position: { x: 50, y: 100 },
      data: { label: mainBoxName },
      draggable: false,
    };
    initialNodes.push(mainBoxNode);

    // Create initial company computer node
    const companyComputerNode: Node = {
      id: 'company-computer-1',
      type: 'companyComputer',
      position: { x: 50, y: 300 },
      data: { label: 'Company Computer' },
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
    setIsInitialized(true);
  }, [job, mainBoxName, satelliteName, wellsideGaugeName, isInitialized]);

  // Initialize the diagram only once when component mounts
  React.useEffect(() => {
    if (!isInitialized) {
      initializeJob();
    }
  }, [initializeJob, isInitialized]);

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

  const addCompanyComputer = () => {
    const existingComputers = nodes.filter(node => node.type === 'companyComputer');
    const newComputer: Node = {
      id: `company-computer-${nodeIdCounter}`,
      type: 'companyComputer',
      position: { x: 50 + (existingComputers.length * 30), y: 300 + (existingComputers.length * 100) },
      data: { label: `Company Computer ${existingComputers.length + 1}` },
      draggable: true,
    };
    
    setNodes((nds) => [...nds, newComputer]);
    setNodeIdCounter(prev => prev + 1);
    toast.success('Company Computer added!');
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
    setIsInitialized(false);
    setNodes([]);
    setEdges([]);
    setMainBoxName('ShearStream Box');
    setSatelliteName('Starlink');
    setWellsideGaugeName('Wellside Gauge');
    setCompanyComputerNames({});
    setTimeout(() => {
      initializeJob();
    }, 0);
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
  const companyComputerNodes = nodes.filter(node => node.type === 'companyComputer');

  return (
    <div className="max-w-7xl mx-auto space-y-2">
      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CableConfigurationPanel
          selectedCableType={selectedCableType}
          setSelectedCableType={setSelectedCableType}
          mainBoxName={mainBoxName}
          updateMainBoxName={updateMainBoxName}
          companyComputerNodes={companyComputerNodes}
          updateCompanyComputerName={updateCompanyComputerName}
          satelliteName={satelliteName}
          updateSatelliteName={updateSatelliteName}
          wellsideGaugeName={wellsideGaugeName}
          updateWellsideGaugeName={updateWellsideGaugeName}
          hasWellsideGauge={job.hasWellsideGauge}
          addYAdapter={addYAdapter}
          addCompanyComputer={addCompanyComputer}
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

        <JobEquipmentPanel
          jobId={job.id}
          jobName={job.name}
          equipmentUsage={usage}
          extrasOnLocation={extrasOnLocation}
          onAutoAllocate={autoAllocateEquipment}
          onAddExtra={addExtraEquipment}
          onRemoveExtra={removeExtraEquipment}
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
