
import { Node, Edge } from '@xyflow/react';
import { useComprehensiveEquipmentTracking } from './equipment/useComprehensiveEquipmentTracking';
import { useEquipmentAllocation } from './equipment/useEquipmentAllocation';
import { useEquipmentReturn } from './equipment/useEquipmentReturn';
import { useEquipmentValidation } from './equipment/useEquipmentValidation';

export const useRobustEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { analyzeEquipmentUsage, generateEquipmentReport } = useComprehensiveEquipmentTracking(nodes, edges);
  const { performComprehensiveAllocation } = useEquipmentAllocation(jobId);
  const { returnAllJobEquipment } = useEquipmentReturn(jobId);
  const { validateInventoryConsistency } = useEquipmentValidation(jobId, nodes, edges);

  return {
    performComprehensiveAllocation: (locationId: string) => performComprehensiveAllocation(locationId, nodes, edges),
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
    generateEquipmentReport,
  };
};
