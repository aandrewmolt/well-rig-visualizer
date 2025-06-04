
import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useSupabaseJobs, JobDiagram } from '@/hooks/useSupabaseJobs';

interface UseJobDiagramInitializationProps {
  job: JobDiagram;
  nodes: any[];
  edges: any[];
  isInitialized: boolean;
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
  setNodeIdCounter: (counter: number) => void;
  setIsInitialized: (initialized: boolean) => void;
  setMainBoxName: (name: string) => void;
  setSatelliteName: (name: string) => void;
  setWellsideGaugeName: (name: string) => void;
  setCustomerComputerNames: (names: Record<string, string>) => void;
  setSelectedCableType: (type: string) => void;
  setSelectedShearstreamBoxes: (boxes: string[]) => void;
  setSelectedStarlink: (starlink: string) => void;
  setSelectedCustomerComputers: (computers: string[]) => void;
  setEquipmentAssignment: (assignment: any) => void;
  syncWithLoadedData: (data: any) => void;
  mainBoxName: string;
  satelliteName: string;
  wellsideGaugeName: string;
}

// Well colors for unique identification
const wellColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
  '#6366f1', // indigo
];

// Function to generate well positions on the right side
const generateWellPositions = (wellCount: number) => {
  const positions = [];
  const startX = 750; // Right side positioning
  const startY = 150; // Starting Y position
  const verticalSpacing = 150; // Space between wells vertically
  
  for (let i = 0; i < wellCount; i++) {
    const x = startX;
    const y = startY + (i * verticalSpacing);
    positions.push({ x, y });
  }
  return positions;
};

const createDefaultNodes = (job: JobDiagram, mainBoxName: string, satelliteName: string, wellsideGaugeName: string): Node[] => {
  console.log('Creating default nodes for job:', job);
  
  const wellPositions = generateWellPositions(job.wellCount);
  
  // Always create at least 1 ShearStream Box in the center
  const newNodes: Node[] = [
    {
      id: 'main-box',
      type: 'mainBox',
      position: { x: 400, y: 250 }, // Center position
      data: { 
        label: mainBoxName || 'ShearStream Box',
        boxNumber: 1,
        equipmentId: null,
        assigned: false
      },
      draggable: true,
      deletable: true, // Make deletable
    },
    // Starlink Satellite on the left
    {
      id: 'satellite',
      type: 'satellite',
      position: { x: 150, y: 450 }, // Left side position
      data: { 
        label: satelliteName || 'Starlink',
        equipmentId: null,
        assigned: false
      },
      draggable: true,
      deletable: true, // Make deletable
    },
  ];

  // Create wells with unique colors on the right side
  wellPositions.forEach((pos, index) => {
    newNodes.push({
      id: `well-${index + 1}`,
      type: 'well',
      position: pos,
      data: { 
        label: `Well ${index + 1}`,
        wellNumber: index + 1,
        color: wellColors[index % wellColors.length] // Assign unique colors
      },
      draggable: true,
      deletable: true, // Make deletable
    });
  });

  // Add wellside gauge if selected - position below the wells
  if (job.hasWellsideGauge) {
    const lastWellY = wellPositions.length > 0 ? wellPositions[wellPositions.length - 1].y : 150;
    newNodes.push({
      id: 'wellside-gauge',
      type: 'wellsideGauge',
      position: { x: 750, y: lastWellY + 150 }, // Below the last well
      data: { 
        label: wellsideGaugeName || 'Wellside Gauge',
        color: '#10b981' // Green color
      },
      draggable: true,
      deletable: true, // Make deletable
    });
  }

  console.log('Created default nodes:', newNodes);
  return newNodes;
};

export const useJobDiagramInitialization = (props: UseJobDiagramInitializationProps) => {
  const { jobs } = useSupabaseJobs();

  const initializeJob = useCallback(() => {
    console.log('initializeJob called with:', { 
      jobId: props.job.id, 
      isInitialized: props.isInitialized,
      wellCount: props.job.wellCount,
      hasWellsideGauge: props.job.hasWellsideGauge
    });

    if (props.isInitialized) {
      console.log('Job already initialized, skipping');
      return;
    }

    const loadedJob = jobs.find(j => j.id === props.job.id);
    const initialData = loadedJob || props.job;

    console.log('Using initial data:', initialData);

    // Sync loaded data to state
    props.syncWithLoadedData(initialData);

    // Set initial values from loaded data
    props.setSelectedCableType(initialData.selectedCableType || 'defaultCableType');
    props.setSelectedShearstreamBoxes(initialData.equipmentAssignment?.shearstreamBoxIds || []);
    props.setSelectedStarlink(initialData.equipmentAssignment?.starlinkId || '');
    props.setSelectedCustomerComputers(initialData.equipmentAssignment?.customerComputerIds || []);
    props.setEquipmentAssignment(initialData.equipmentAssignment || {});

    props.setMainBoxName(initialData.mainBoxName || 'ShearStream Box');
    props.setSatelliteName(initialData.satelliteName || 'Starlink');
    props.setWellsideGaugeName(initialData.wellsideGaugeName || 'Wellside Gauge');
    props.setCustomerComputerNames(initialData.companyComputerNames || {});

    // Always create default nodes - this ensures we have the essential components
    const defaultNodes = createDefaultNodes(
      initialData, 
      initialData.mainBoxName || 'ShearStream Box',
      initialData.satelliteName || 'Starlink', 
      initialData.wellsideGaugeName || 'Wellside Gauge'
    );

    console.log('Setting nodes to:', defaultNodes);
    props.setNodes(defaultNodes);

    // Initialize edges
    props.setEdges(initialData.edges && initialData.edges.length > 0 ? initialData.edges : []);
    
    // Set node counter based on created nodes
    props.setNodeIdCounter(defaultNodes.length + 1);
    
    props.setIsInitialized(true);
    console.log('Job initialization completed');
  }, [props, jobs]);

  return { initializeJob };
};
