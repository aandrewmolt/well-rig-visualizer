
import { Edge } from '@xyflow/react';
import { EquipmentType } from '@/types/inventory';
import { DetailedEquipmentUsage } from '../types/equipmentUsageTypes';

interface EdgeData {
  connectionType?: string;
  cableTypeId?: string;
  cableType?: string;
  label?: string;
}

export const analyzeEdges = (
  edges: Edge[], 
  equipmentTypes: EquipmentType[], 
  usage: DetailedEquipmentUsage
): void => {
  edges.forEach(edge => {
    // Handle different edge types and data structures
    const edgeData = edge.data as EdgeData;
    const connectionType = edgeData?.connectionType || edge.type || 'cable';
    
    if (connectionType === 'direct') {
      usage.directConnections += 1;
      return;
    }

    // For cable connections, determine cable type
    let cableTypeId: string;
    
    if (edgeData?.cableTypeId) {
      // Use explicit cable type ID if available
      cableTypeId = edgeData.cableTypeId;
    } else if (edgeData?.cableType) {
      // Map legacy cable type names to IDs
      const typeMapping: { [key: string]: string } = {
        '100ft': '100ft-cable',
        '200ft': '200ft-cable', 
        '300ft': '300ft-cable-new',
      };
      cableTypeId = typeMapping[edgeData.cableType] || '200ft-cable'; // Default to 200ft
    } else {
      // Default to 200ft cable if no type specified
      cableTypeId = '200ft-cable';
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
