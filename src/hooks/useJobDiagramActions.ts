
import { useDiagramActions } from '@/hooks/useDiagramActions';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

interface UseJobDiagramActionsProps {
  job: Job;
  nodeIdCounter: number;
  setNodeIdCounter: (counter: number) => void;
  setNodes: (updater: (nodes: any[]) => any[]) => void;
  setEdges: (updater: (edges: any[]) => any[]) => void;
  setIsInitialized: (initialized: boolean) => void;
  initializeJob: () => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
}

export const useJobDiagramActions = ({
  job,
  nodeIdCounter,
  setNodeIdCounter,
  setNodes,
  setEdges,
  setIsInitialized,
  initializeJob,
  reactFlowWrapper,
}: UseJobDiagramActionsProps) => {
  const {
    addYAdapter,
    addShearstreamBox,
    removeShearstreamBox,
    addCompanyComputer,
    updateWellName,
    updateWellColor,
    updateWellsideGaugeColor,
    clearDiagram,
    saveDiagram,
  } = useDiagramActions(
    job,
    nodeIdCounter,
    setNodeIdCounter,
    setNodes,
    setEdges,
    setIsInitialized,
    initializeJob,
    reactFlowWrapper
  );

  // Rename addCompanyComputer to addCustomerComputer for consistency
  const addCustomerComputer = addCompanyComputer;

  const updateWellsideGaugeName = (name: string) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === 'wellside-gauge' 
          ? { ...node, data: { ...node.data, label: name } }
          : node
      )
    );
  };

  return {
    addYAdapter,
    addShearstreamBox,
    removeShearstreamBox,
    addCustomerComputer,
    updateWellName,
    updateWellColor,
    updateWellsideGaugeName,
    updateWellsideGaugeColor,
    clearDiagram,
    saveDiagram,
  };
};
