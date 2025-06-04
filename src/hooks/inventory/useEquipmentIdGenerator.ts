
import { EquipmentType } from '@/types/inventory';

export const useEquipmentIdGenerator = () => {
  const getIdPadding = (equipmentType: EquipmentType): number => {
    const prefix = equipmentType.defaultIdPrefix || '';
    
    // ShearStream Box uses 4-digit padding
    if (prefix === 'SS') {
      return 4;
    }
    
    // Starlink, Customer Computer, and Customer Tablet use 2-digit padding
    if (prefix === 'SL' || prefix === 'CC' || prefix === 'CT') {
      return 2;
    }
    
    // Default to 3-digit padding for other types
    return 3;
  };

  const generateEquipmentId = (
    equipmentType: EquipmentType, 
    number: number
  ): string => {
    const prefix = equipmentType.defaultIdPrefix || '';
    const padding = getIdPadding(equipmentType);
    return `${prefix}${number.toString().padStart(padding, '0')}`;
  };

  const generateEquipmentName = (
    equipmentType: EquipmentType,
    equipmentId: string
  ): string => {
    const prefix = equipmentType.defaultIdPrefix || '';
    
    // Extract the number portion from the equipment ID
    const numberPart = equipmentId.replace(prefix, '');
    const number = parseInt(numberPart, 10);
    
    // Format the name based on the equipment type
    if (prefix === 'SL') {
      return `Starlink ${number.toString().padStart(2, '0')}`;
    } else if (prefix === 'CC') {
      return `Customer Computer ${number.toString().padStart(2, '0')}`;
    } else if (prefix === 'CT') {
      return `Customer Tablet ${number.toString().padStart(2, '0')}`;
    } else if (prefix === 'SS') {
      return `ShearStream Box ${number.toString().padStart(3, '0')}`;
    }
    
    // Fallback for other types
    return `${equipmentType.name} ${number.toString().padStart(2, '0')}`;
  };

  const getIdFormat = (equipmentType: EquipmentType): string => {
    const prefix = equipmentType.defaultIdPrefix || '';
    const padding = getIdPadding(equipmentType);
    const example = '0'.repeat(padding);
    return `${prefix}${example}`;
  };

  return {
    generateEquipmentId,
    generateEquipmentName,
    getIdFormat,
    getIdPadding,
  };
};
