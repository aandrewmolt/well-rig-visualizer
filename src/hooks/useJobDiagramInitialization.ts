
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

// Function to generate well positions based on wellCount
const generateWellPositions = (wellCount: number) => {
  const positions = [];
  for (let i = 0; i < wellCount; i++) {
    const x = 75 + (i % 5) * 150; // 5 wells per row
    const y = 450 + Math.floor(i / 5) * 150; // Adjust y position for each row
    positions.push({ x, y });
  }
  return positions;
};

const createDefaultNodes = (job: JobDiagram, mainBoxName: string, satelliteName: string, wellsideGaugeName: string): Node[] => {
  const wellPositions = generateWellPositions(job.wellCount);
  
  // Always create at least 1 ShearStream Box
  const newNodes: Node[] = [
    {
      id: 'main-box',
      type: 'mainBox',
      position: { x: 50, y: 100 },
      data: { 
        label: mainBoxName || 'ShearStream Box',
        boxNumber: 1,
        equipmentId: null,
        assigned: false
      },
      draggable: true,
    },
    // Starlink Satellite
    {
      id: 'satellite',
      type: 'satellite',
      position: { x: 400, y: 50 },
      data: { 
        label: satelliteName || 'Starlink',
        equipmentId: null,
        assigned: false
      },
      draggable: true,
    },
  ];

  // Always create wells based on wellCount
  wellPositions.forEach((pos, index) => {
    newNodes.push({
      id: `well-${index + 1}`,
      type: 'well',
      position: pos,
      data: { 
        label: `Well ${index + 1}`,
        wellNumber: index + 1,
        color: '#3b82f6'
      },
      draggable: true,
    });
  });

  // Add wellside gauge if selected
  if (job.hasWellsideGauge) {
    newNodes.push({
      id: 'wellside-gauge',
      type: 'wellsideGauge',
      position: { x: 600, y: 300 },
      data: { 
        label: wellsideGaugeName || 'Wellside Gauge',
        color: '#10b981'
      },
      draggable: true,
    });
  }

  return newNodes;
};

export const useJobDiagramInitialization = (props: UseJobDiagramInitializationProps) => {
  const { jobs } = useSupabaseJobs();

  const initializeJob = useCallback(() => {
    const loadedJob = jobs.find(j => j.id === props.job.id);

    if (!loadedJob) {
      console.warn('Job not found in Supabase, using provided job data.');
    }

    const initialData = loadedJob || props.job;

    if (initialData && !props.isInitialized) {
      console.log('Initializing job with data:', initialData);

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

      // Create default nodes if no saved nodes exist, or use saved nodes
      const nodesToSet = (initialData.nodes && initialData.nodes.length > 0) 
        ? initialData.nodes 
        : createDefaultNodes(
            initialData, 
            initialData.mainBoxName || 'ShearStream Box',
            initialData.satelliteName || 'Starlink', 
            initialData.wellsideGaugeName || 'Wellside Gauge'
          );

      // Always ensure we have the essential components even if loading from saved data
      const hasMainBox = nodesToSet.some((node: any) => node.id === 'main-box');
      const hasWells = nodesToSet.some((node: any) => node.type === 'well');
      const hasWellsideGauge = nodesToSet.some((node: any) => node.id === 'wellside-gauge');

      // If essential components are missing, create default nodes
      if (!hasMainBox || !hasWells || (initialData.hasWellsideGauge && !hasWellsideGauge)) {
        console.log('Essential components missing, creating default nodes');
        const defaultNodes = createDefaultNodes(
          initialData,
          initialData.mainBoxName || 'ShearStream Box',
          initialData.satelliteName || 'Starlink',
          initialData.wellsideGaugeName || 'Wellside Gauge'
        );
        props.setNodes(defaultNodes);
      } else {
        props.setNodes(nodesToSet);
      }

      // Initialize edges
      props.setEdges(initialData.edges && initialData.edges.length > 0 ? initialData.edges : []);
      props.setIsInitialized(true);
    }
  }, [props, jobs]);

  return { initializeJob };
};
