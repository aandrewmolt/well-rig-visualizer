
import { Edge } from '@xyflow/react';
import { EquipmentType } from '@/types/inventory';
import { DetailedEquipmentUsage } from '../types/equipmentUsageTypes';

export const analyzeEdges = (
  edges: Edge[], 
  equipmentTypes: EquipmentType[], 
  usage: DetailedEquipmentUsage
): void => {
  edges.forEach(edge => {
    // Handle different edge types and data structures
    const connectionType = edge.data?.connectionType || edge.type || 'cable';
    
    if (connectionType === 'direct') {
      usage.directConnections += 1;
      return;
    }

    // For cable connections, determine cable type
    let cableTypeId: string;
    
    if (edge.data?.cableTypeId) {
      // Use explicit cable type ID if available
      cableTypeId = edge.data.cableTypeId;
    } else if (edge.data?.cableType) {
      // Map legacy cable type names to IDs
      const typeMapping: { [key: string]: string } = {
        '100ft': '1',
        '200ft': '2', 
        '300ft': '4',
      };
      cableTypeId = typeMapping[edge.data.cableType] || '2'; // Default to 200ft
    } else {
      // Default to 200ft cable if no type specified
      cableTypeId = '2';
    }

    // Find equipment type details
    const equipmentType = equipmentTypes.find(type => type.id === cableTypeId);
    
    if (equipmentType) {
      if (!usage.cables[cableTypeId]) {
        usage.cables[cableTypeId] = {
          quantity: 0,
          typeName: equipmentType.name,
          category: equipmentType.category,
          length: extractLengthFromName(equipmentType.name),
          version: extractVersionFromName(equipmentType.name)
        };
      }
      usage.cables[cableTypeId].quantity += 1;
    }

    usage.totalConnections += 1;
  });

  console.log('Edge analysis completed:', {
    totalEdges: edges.length,
    cablesByType: Object.entries(usage.cables).map(([typeId, details]) => ({
      typeId,
      typeName: details.typeName,
      quantity: details.quantity
    })),
    directConnections: usage.directConnections,
    totalConnections: usage.totalConnections
  });
};

const extractLengthFromName = (name: string): string => {
  const lengthMatch = name.match(/(\d+)\s*ft/i);
  return lengthMatch ? `${lengthMatch[1]}ft` : '';
};

const extractVersionFromName = (name: string): string | undefined => {
  if (name.toLowerCase().includes('v2') || name.toLowerCase().includes('version 2')) {
    return 'V2';
  }
  return undefined;
};
