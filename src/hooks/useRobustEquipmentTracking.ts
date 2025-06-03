
import { Node, Edge } from '@xyflow/react';
import { useSupabaseEquipmentTracking } from './equipment/useSupabaseEquipmentTracking';

export const useRobustEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const {
    analyzeEquipmentUsage,
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
  } = useSupabaseEquipmentTracking(jobId, nodes, edges);

  return {
    performComprehensiveAllocation: (locationId: string) => performComprehensiveAllocation(locationId),
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
    generateEquipmentReport: () => {
      const usage = analyzeEquipmentUsage();
      return {
        summary: `${usage.totalConnections} connections, ${Object.keys(usage.cables).length} cable types`,
        details: usage,
      };
    },
  };
};
