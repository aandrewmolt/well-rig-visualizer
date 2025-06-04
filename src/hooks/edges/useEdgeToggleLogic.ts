
import { useCallback } from 'react';
import { useReactFlow, Edge } from '@xyflow/react';

interface UseEdgeToggleLogicProps {
  id: string;
  data?: {
    connectionType?: string;
    label?: string;
    cableTypeId?: string;
    sourceHandle?: string;
    targetHandle?: string;
    immediateSave?: () => void;
  };
  currentEdge: Edge | undefined;
}

export const useEdgeToggleLogic = ({ id, data, currentEdge }: UseEdgeToggleLogicProps) => {
  const { setEdges } = useReactFlow();

  const handleEdgeToggle = useCallback(() => {
    console.log('Edge click triggered:', { 
      id, 
      currentEdge 
    });
    
    if (!currentEdge) return;

    // Determine current type - check multiple sources
    const currentType = data?.connectionType || currentEdge.data?.connectionType || currentEdge.type || 'cable';
    const newType = currentType === 'direct' ? 'cable' : 'direct';
    
    console.log('Connection type toggle:', {
      from: currentType,
      to: newType,
      edgeId: id
    });
    
    setEdges((prevEdges: Edge[]) => {
      const updatedEdges = prevEdges.map((edge: Edge) => {
        if (edge.id === id) {
          if (newType === 'direct') {
            // Create direct connection
            const directEdge = {
              ...edge,
              type: 'direct',
              label: 'Direct Connection',
              data: {
                ...edge.data,
                connectionType: 'direct',
                label: 'Direct Connection',
                sourceHandle: edge.sourceHandle || data?.sourceHandle,
                targetHandle: edge.targetHandle || data?.targetHandle,
                cableTypeId: undefined, // Clear cable-specific data
                immediateSave: data?.immediateSave,
              },
              style: {
                stroke: '#10b981',
                strokeWidth: 3,
                strokeDasharray: '5,5',
              },
              animated: true,
            };
            console.log('Created direct edge:', directEdge);
            return directEdge;
          } else {
            // Create cable connection
            const cableEdge = {
              ...edge,
              type: 'cable',
              label: '100ft Cable',
              data: {
                ...edge.data,
                connectionType: 'cable',
                label: '100ft Cable',
                cableTypeId: '1', // 100ft cable type ID
                sourceHandle: edge.sourceHandle || data?.sourceHandle,
                targetHandle: edge.targetHandle || data?.targetHandle,
                immediateSave: data?.immediateSave,
              },
              style: {
                stroke: '#3b82f6',
                strokeWidth: 3,
                strokeDasharray: undefined,
              },
              animated: false,
            };
            console.log('Created cable edge:', cableEdge);
            return cableEdge;
          }
        }
        return edge;
      });

      // Trigger immediate save if available
      if (data?.immediateSave) {
        console.log('Triggering immediate save after edge toggle');
        setTimeout(() => data.immediateSave!(), 50);
      }

      return updatedEdges;
    });

    console.log('Edge toggle completed');
  }, [id, data, currentEdge, setEdges]);

  return { handleEdgeToggle };
};
