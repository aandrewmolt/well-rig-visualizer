
import { Node, Edge } from '@xyflow/react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { DetailedEquipmentUsage } from './types/equipmentUsageTypes';
import { analyzeEdges } from './utils/edgeAnalyzer';
import { analyzeNodes } from './utils/nodeAnalyzer';

export const useEquipmentUsageAnalyzer = (nodes: Node[], edges: Edge[]) => {
  const { data } = useInventoryData();

  const analyzeEquipmentUsage = (): DetailedEquipmentUsage => {
    const usage: DetailedEquipmentUsage = {
      cables: {},
      gauges: 0,
      adapters: 0,
      computers: 0,
      satellite: 0,
      directConnections: 0,
      totalConnections: 0,
    };

    // Analyze edges for cable usage
    analyzeEdges(edges, data.equipmentTypes, usage);

    // Analyze nodes for equipment usage
    analyzeNodes(nodes, usage);

    console.log('Final equipment usage analysis:', usage);
    return usage;
  };

  return {
    analyzeEquipmentUsage,
  };
};

export type { DetailedEquipmentUsage } from './types/equipmentUsageTypes';
