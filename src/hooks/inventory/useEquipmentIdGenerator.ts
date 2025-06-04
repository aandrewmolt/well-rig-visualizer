
import { EquipmentType } from '@/types/inventory';

export const useEquipmentIdGenerator = () => {
  const generateEquipmentId = (equipmentType: EquipmentType, counter: number): string => {
    const prefix = equipmentType.defaultIdPrefix || '';
    return `${prefix}${counter.toString().padStart(3, '0')}`;
  };

  const generateEquipmentName = (equipmentType: EquipmentType, id: string): string => {
    if (equipmentType.name === 'Customer Computer') {
      // Check if it's a tablet (CT prefix) or computer (CC prefix)
      if (id.startsWith('CT')) {
        return `Customer Tablet ${id.replace('CT', '')}`;
      }
      return `Customer Computer ${id.replace('CC', '')}`;
    }
    
    if (equipmentType.name === 'Starlink') {
      return `Starlink ${id.replace('SL', '')}`;
    }
    
    if (equipmentType.name === 'ShearStream Box') {
      return `ShearStream Box ${id.replace('SS', '')}`;
    }
    
    if (equipmentType.name === '1502 Pressure Gauge') {
      return `Pressure Gauge ${id.replace('PG', '')}`;
    }
    
    return `${equipmentType.name} ${id}`;
  };

  const getIdFormat = (equipmentType: EquipmentType): string => {
    const prefix = equipmentType.defaultIdPrefix || '';
    return `${prefix}XXX (e.g., ${prefix}001)`;
  };

  return {
    generateEquipmentId,
    generateEquipmentName,
    getIdFormat
  };
};
