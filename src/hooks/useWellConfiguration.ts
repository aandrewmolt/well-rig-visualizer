
import { useCallback } from 'react';
import { Node } from '@xyflow/react';

export const useWellConfiguration = (setNodes: (updater: (nodes: Node[]) => Node[]) => void) => {
  const updateWellName = useCallback((wellId: string, newName: string) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.id === wellId 
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    );
  }, [setNodes]);

  const updateWellColor = useCallback((wellId: string, newColor: string) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.id === wellId 
          ? { ...node, data: { ...node.data, color: newColor } }
          : node
      )
    );
  }, [setNodes]);

  const updateWellsideGaugeColor = useCallback((newColor: string) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.type === 'wellsideGauge' 
          ? { ...node, data: { ...node.data, color: newColor } }
          : node
      )
    );
  }, [setNodes]);

  return {
    updateWellName,
    updateWellColor,
    updateWellsideGaugeColor,
  };
};
