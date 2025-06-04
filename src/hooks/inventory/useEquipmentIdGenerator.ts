
import { EquipmentType } from '@/types/inventory';

export const useEquipmentIdGenerator = () => {
  const generateEquipmentId = (equipmentType: EquipmentType, counter: number): string => {
    const prefix = equipmentType.defaultIdPrefix || '';
    
    // Different padding for different equipment types
    if (prefix === 'SS') {
      // ShearStream: 4 digits (SS0001)
      return `${prefix}${counter.toString().padStart(4, '0')}`;
    } else if (prefix === 'SL') {
      // Starlink: 2 digits (SL01)
      return `${prefix}${counter.toString().padStart(2, '0')}`;
    } else {
      // Others (CC, CT, PG, BP): 3 digits (CC001, CT001, etc.)
      return `${prefix}${counter.toString().padStart(3, '0')}`;
    }
  };

  const generateEquipmentName = (equipmentType: EquipmentType, id: string): string => {
    if (equipmentType.name === 'Customer Computer') {
      return `Customer Computer ${id.replace('CC', '')}`;
    }
    
    if (equipmentType.name === 'Customer Tablet') {
      return `Customer Tablet ${id.replace('CT', '')}`;
    }
    
    if (equipmentType.name === 'Starlink') {
      return `Starlink-${id.replace('SL', '')}`;
    }
    
    if (equipmentType.name === 'ShearStream Box') {
      return `ShearStream-${id.replace('SS', '')}`;
    }
    
    if (equipmentType.name === '1502 Pressure Gauge') {
      return `Pressure Gauge ${id.replace('PG', '')}`;
    }
    
    if (equipmentType.name === 'Battery Pack') {
      return `Battery Pack ${id.replace('BP', '')}`;
    }
    
    return `${equipmentType.name} ${id}`;
  };

  const getIdFormat = (equipmentType: EquipmentType): string => {
    const prefix = equipmentType.defaultIdPrefix || '';
    
    if (prefix === 'SS') {
      return `${prefix}XXXX (e.g., ${prefix}0001)`;
    } else if (prefix === 'SL') {
      return `${prefix}XX (e.g., ${prefix}01)`;
    } else {
      return `${prefix}XXX (e.g., ${prefix}001)`;
    }
  };

  return {
    generateEquipmentId,
    generateEquipmentName,
    getIdFormat
  };
};
