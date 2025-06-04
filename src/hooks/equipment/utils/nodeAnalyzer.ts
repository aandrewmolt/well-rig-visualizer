
import { Node } from '@xyflow/react';
import { DetailedEquipmentUsage } from '../types/equipmentUsageTypes';

export const analyzeNodes = (nodes: Node[], usage: DetailedEquipmentUsage): DetailedEquipmentUsage => {
  nodes.forEach(node => {
    switch (node.type) {
      case 'well':
      case 'wellsideGauge':
        usage.gauges++;
        break;
      case 'yAdapter':
        usage.adapters++;
        break;
      case 'companyComputer':
      case 'customerComputer':
        usage.computers++;
        break;
      case 'satellite':
        usage.satellite++;
        break;
    }
  });

  return usage;
};
