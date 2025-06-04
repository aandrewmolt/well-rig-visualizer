
import { Node } from '@xyflow/react';
import { DetailedEquipmentUsage } from '../types/equipmentUsageTypes';

export const analyzeNodes = (nodes: Node[], usage: DetailedEquipmentUsage): void => {
  nodes.forEach(node => {
    switch (node.type) {
      case 'well':
        // Each well typically has a gauge
        usage.gauges += 1;
        break;
      case 'wellsideGauge':
        usage.gauges += 1;
        break;
      case 'yAdapter':
        usage.adapters += 1;
        break;
      case 'mainBox':
      case 'companyComputer':
        usage.computers += 1;
        break;
      case 'satellite':
        usage.satellite += 1;
        break;
      case 'customerComputer':
        // Customer computers don't count toward company equipment
        break;
      default:
        console.log('Unhandled node type in equipment analysis:', node.type);
    }
  });

  console.log('Node analysis completed:', {
    totalNodes: nodes.length,
    gauges: usage.gauges,
    adapters: usage.adapters,
    computers: usage.computers,
    satellite: usage.satellite
  });
};
