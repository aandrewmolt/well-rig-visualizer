
import { useCallback } from 'react';
import { Node } from '@xyflow/react';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

export const useDiagramInitialization = (
  job: Job,
  mainBoxName: string,
  satelliteName: string,
  wellsideGaugeName: string,
  isInitialized: boolean,
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: any[]) => void,
  setNodeIdCounter: (counter: number) => void,
  setIsInitialized: (initialized: boolean) => void
) => {
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
  }, [job, mainBoxName, satelliteName, wellsideGaugeName, isInitialized, setNodes, setEdges, setNodeIdCounter, setIsInitialized]);

  return { initializeJob };
};
