
import { EquipmentType } from '@/types/inventory';

export const useEquipmentIdGenerator = () => {
  const getIdPadding = (equipmentType: EquipmentType): number => {
    const prefix = equipmentType.defaultIdPrefix || '';
    
    // ShearStream Box uses 3-digit padding
    if (prefix === 'SS') {
      return 3;
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

  const getIdFormat = (equipmentType: EquipmentType): string => {
    const prefix = equipmentType.defaultIdPrefix || '';
    const padding = getIdPadding(equipmentType);
    const example = '0'.repeat(padding);
    return `${prefix}${example}`;
  };

  return {
    generateEquipmentId,
    getIdFormat,
    getIdPadding,
  };
};
