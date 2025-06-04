
import { EquipmentType } from '@/types/inventory';

export const useCableTypeService = (equipmentTypes: EquipmentType[]) => {
  
  const getCableTypes = () => {
    return equipmentTypes.filter(type => type.category === 'cables');
  };

  const getCableTypeById = (typeId: string) => {
    return equipmentTypes.find(type => type.id === typeId && type.category === 'cables');
  };

  const getCableColor = (cableTypeId: string) => {
    const cableType = getCableTypeById(cableTypeId);
    if (!cableType) return '#6b7280'; // Default gray
    
    const name = cableType.name.toLowerCase();
    if (name.includes('100ft')) return '#ef4444'; // Red
    if (name.includes('200ft')) return '#3b82f6'; // Blue  
    if (name.includes('300ft')) return '#10b981'; // Green
    return '#6b7280'; // Gray for unknown
  };

  const getCableDisplayName = (cableTypeId: string) => {
    const cableType = getCableTypeById(cableTypeId);
    return cableType?.name || 'Unknown Cable';
  };

  const getDefaultCableType = () => {
    // Prefer 200ft cable as default
    const cable200ft = equipmentTypes.find(type => 
      type.category === 'cables' && 
      type.name.toLowerCase().includes('200ft')
    );
    
    if (cable200ft) return cable200ft.id;
    
    // Fallback to any cable type
    const anyCable = equipmentTypes.find(type => type.category === 'cables');
    return anyCable?.id || '';
  };

  const getCableLengthFromType = (cableTypeId: string): string => {
    const cableType = getCableTypeById(cableTypeId);
    if (!cableType) return '200ft';
    
    const name = cableType.name.toLowerCase();
    if (name.includes('100ft')) return '100ft';
    if (name.includes('200ft')) return '200ft';
    if (name.includes('300ft')) return '300ft';
    return '200ft';
  };

  const getCableVersion = (cableTypeId: string): string | undefined => {
    const cableType = getCableTypeById(cableTypeId);
    if (!cableType) return undefined;
    
    const name = cableType.name.toLowerCase();
    if (name.includes('300ft')) {
      if (name.includes('old') || name.includes('y adapter')) return 'old';
      if (name.includes('new') || name.includes('direct')) return 'new';
    }
    return undefined;
  };

  return {
    getCableTypes,
    getCableTypeById,
    getCableColor,
    getCableDisplayName,
    getDefaultCableType,
    getCableLengthFromType,
    getCableVersion,
  };
};
