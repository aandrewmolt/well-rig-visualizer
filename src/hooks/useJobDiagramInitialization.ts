
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
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#6366f1',
];

// Function to generate well positions on the right side
const generateWellPositions = (wellCount: number) => {
  const positions = [];
  const startX = 750;
  const startY = 150;
  const verticalSpacing = 150;
  
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
  
  const newNodes: Node[] = [
    {
      id: 'main-box',
      type: 'mainBox',
      position: { x: 400, y: 250 },
      data: { 
        label: mainBoxName || 'ShearStream Box',
        boxNumber: 1,
        equipmentId: null,
        assigned: false
      },
      draggable: true,
      deletable: true,
    },
    {
      id: 'satellite',
      type: 'satellite',
      position: { x: 150, y: 450 },
      data: { 
        label: satelliteName || 'Starlink',
        equipmentId: null,
        assigned: false
      },
      draggable: true,
      deletable: true,
    },
  ];

  // Create wells with unique colors
  wellPositions.forEach((pos, index) => {
    newNodes.push({
      id: `well-${index + 1}`,
      type: 'well',
      position: pos,
      data: { 
        label: `Well ${index + 1}`,
        wellNumber: index + 1,
        color: wellColors[index % wellColors.length]
      },
      draggable: true,
      deletable: true,
    });
  });

  // Add wellside gauge if selected
  if (job.hasWellsideGauge) {
    const lastWellY = wellPositions.length > 0 ? wellPositions[wellPositions.length - 1].y : 150;
    newNodes.push({
      id: 'wellside-gauge',
      type: 'wellsideGauge',
      position: { x: 750, y: lastWellY + 150 },
      data: { 
        label: wellsideGaugeName || 'Wellside Gauge',
        color: '#10b981'
      },
      draggable: true,
      deletable: true,
    });
  }

  console.log('Created default nodes:', newNodes);
  return newNodes;
};

// Enhanced edge restoration function that preserves ALL edge properties
const restoreEdgeData = (edges: any[]) => {
  return edges.map(edge => ({
    ...edge,
    // Restore sourceHandle from multiple possible locations
    sourceHandle: edge.sourceHandle || edge.data?.sourceHandle,
    targetHandle: edge.targetHandle || edge.data?.targetHandle,
    // Ensure data object exists with all properties
    data: {
      ...edge.data,
      sourceHandle: edge.data?.sourceHandle || edge.sourceHandle,
      targetHandle: edge.data?.targetHandle || edge.targetHandle,
      connectionType: edge.data?.connectionType || (edge.type === 'direct' ? 'direct' : 'cable'),
      cableTypeId: edge.data?.cableTypeId,
      label: edge.data?.label || edge.label,
    },
    // Preserve styling
    style: edge.style || {},
    animated: edge.animated,
    label: edge.label,
  }));
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

    // Enhanced data loading with complete preservation
    if (initialData.nodes && Array.isArray(initialData.nodes) && initialData.nodes.length > 0) {
      console.log('Loading saved nodes and edges with full preservation:', {
        nodeCount: initialData.nodes.length,
        edgeCount: initialData.edges?.length || 0
      });
      
      // Restore nodes with all properties preserved
      const restoredNodes = initialData.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          // Ensure all data properties are preserved
        },
        style: node.style || {},
        draggable: node.draggable !== false,
        deletable: node.deletable !== false,
      }));
      
      // Restore edges with enhanced data preservation
      const restoredEdges = initialData.edges && initialData.edges.length > 0 
        ? restoreEdgeData(initialData.edges) 
        : [];
      
      console.log('Restored edges with sourceHandle info:', restoredEdges.map(e => ({
        id: e.id,
        sourceHandle: e.sourceHandle,
        edgeDataSourceHandle: e.data?.sourceHandle,
        type: e.type,
        label: e.label
      })));
      
      props.setNodes(restoredNodes);
      props.setEdges(restoredEdges);
      
      // Set node counter based on existing nodes
      const maxNodeId = Math.max(
        ...restoredNodes.map(node => {
          const match = node.id.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        }),
        0
      );
      props.setNodeIdCounter(maxNodeId + 1);
    } else {
      // Only create default nodes if no saved nodes exist
      console.log('No saved nodes found, creating default nodes for new job');
      
      const defaultNodes = createDefaultNodes(
        initialData, 
        initialData.mainBoxName || 'ShearStream Box',
        initialData.satelliteName || 'Starlink', 
        initialData.wellsideGaugeName || 'Wellside Gauge'
      );

      console.log('Setting default nodes to:', defaultNodes);
      props.setNodes(defaultNodes);
      props.setEdges([]);
      props.setNodeIdCounter(defaultNodes.length + 1);
    }
    
    props.setIsInitialized(true);
    console.log('Job initialization completed');
  }, [props, jobs]);

  return { initializeJob };
};
