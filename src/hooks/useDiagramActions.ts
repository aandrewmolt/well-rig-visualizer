
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

export const useDiagramActions = (
  job: Job,
  nodeIdCounter: number,
  setNodeIdCounter: (counter: number) => void,
  setNodes: (updater: (nodes: Node[]) => Node[]) => void,
  setEdges: (edges: any[]) => void,
  setIsInitialized: (initialized: boolean) => void,
  initializeJob: () => void,
  reactFlowWrapper: React.RefObject<HTMLDivElement>
) => {
  const addYAdapter = useCallback(() => {
    const newYAdapter: Node = {
      id: `y-adapter-${nodeIdCounter}`,
      type: 'yAdapter',
      position: { x: 250 + (nodeIdCounter * 30), y: 200 + (nodeIdCounter * 30) },
      data: { label: 'Y Adapter' },
    };
    
    setNodes((nds) => [...nds, newYAdapter]);
    setNodeIdCounter(nodeIdCounter + 1);
    toast.success('Y Adapter added!');
  }, [nodeIdCounter, setNodes, setNodeIdCounter]);

  const addCompanyComputer = useCallback(() => {
    setNodes((nds) => {
      const existingComputers = nds.filter(node => node.type === 'companyComputer');
      const newComputer: Node = {
        id: `company-computer-${nodeIdCounter}`,
        type: 'companyComputer',
        // Position further left with more spacing to prevent overlap
        position: { x: -150 + (existingComputers.length * 200), y: 300 + (existingComputers.length * 150) },
        data: { label: `Company Computer ${existingComputers.length + 1}` },
        draggable: true,
      };
      
      setNodeIdCounter(nodeIdCounter + 1);
      toast.success('Company Computer added!');
      return [...nds, newComputer];
    });
  }, [nodeIdCounter, setNodes, setNodeIdCounter]);

  const updateWellName = useCallback((wellId: string, newName: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === wellId 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  }, [setNodes]);

  const updateWellColor = useCallback((wellId: string, newColor: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === wellId 
          ? { ...node, data: { ...node.data, color: newColor } }
          : node
      )
    );
  }, [setNodes]);

  const updateWellsideGaugeColor = useCallback((newColor: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'wellside-gauge' 
          ? { ...node, data: { ...node.data, color: newColor } }
          : node
      )
    );
  }, [setNodes]);

  const clearDiagram = useCallback(() => {
    setIsInitialized(false);
    setNodes(() => []);
    setEdges([]);
    setTimeout(() => {
      initializeJob();
    }, 0);
    toast.success('Diagram cleared!');
  }, [setIsInitialized, setNodes, setEdges, initializeJob]);

  const saveDiagram = useCallback(async () => {
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
  }, [job.name, reactFlowWrapper]);

  return {
    addYAdapter,
    addCompanyComputer,
    updateWellName,
    updateWellColor,
    updateWellsideGaugeColor,
    clearDiagram,
    saveDiagram,
  };
};
